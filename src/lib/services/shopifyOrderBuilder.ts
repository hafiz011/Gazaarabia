import { prisma } from "@/lib/prisma";
import { toCountryCode, toProvinceCode, toE164Phone, isValidEmail } from "./shopifyAddress";

// Phase 1 + 2: validate a marketplace order and build one Shopify
// OrderCreateOrderInput per Shopify-connected seller, using the Variant GIDs
// stored in Milestone 2.6 — NO runtime product discovery, NEVER by SKU.
//
// Customer/address mapping is normalized for Shopify API 2025-01:
//   • addresses use ISO codes (countryCode / provinceCode), never raw names
//   • phones are E.164 or omitted (never invalid)
//   • the real order note is preserved (never overwritten)
//   • invalid email / country / zip are rejected BEFORE contacting Shopify

export interface OrderGroup {
  sellerId: number;
  shop: string;
  gazaOrderId: string;
  input: any;
  itemIds: number[];
}

export interface BuildResult {
  groups: OrderGroup[];
  errors: string[];
}

const SUPPORTED_CURRENCIES = new Set(["GBP", "USD", "EUR"]);

export async function buildShopifyOrders(orderId: number): Promise<BuildResult> {
  const errors: string[] = [];
  console.log("[ORDER-PUSH-TRACE][ENTER] buildShopifyOrders", { orderId });

  const order = await prisma.orders.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { email: true } },
      orderItems: {
        include: {
          product: { select: { isExternalProduct: true } },
          variant: { select: { externalVariantId: true, isActive: true } },
          seller: { select: { id: true, storeType: true, shopifyDomain: true } },
        },
      },
    },
  });

  if (!order) {
    console.log("[ORDER-PUSH-TRACE][RETURN] buildShopifyOrders: order_not_found", { orderId });
    return { groups: [], errors: ["Order not found"] };
  }

  // ── Order-level validation (Phase 1) — normalize + reject invalids up front ──
  const countryCode = toCountryCode(order.country); // ISO2 or null

  if (!order.firstName || !order.address1 || !order.city || !order.country || !order.postalCode) {
    errors.push("Shipping address is incomplete");
  }
  if (!order.user?.email) errors.push("Customer email is missing");
  else if (!isValidEmail(order.user.email)) errors.push(`Invalid customer email: ${order.user.email}`);
  if (order.country && !countryCode) {
    errors.push(`Unrecognized country (cannot map to a Shopify country code): ${order.country}`);
  }
  if (!order.currency || !SUPPORTED_CURRENCIES.has(order.currency)) {
    errors.push(`Unsupported currency: ${order.currency}`);
  }

  // STEP 9 — these are ORDER-LEVEL blockers: if any failed, nothing may reach
  // Shopify. (Seller-level issues below only skip the offending group.)
  if (errors.length) {
    console.log("[ORDER-PUSH-TRACE][RETURN] buildShopifyOrders: order_validation_failed", { orderId, errors });
    return { groups: [], errors };
  }

  // Shopify items only, grouped by seller.
  const shopifyItems = order.orderItems.filter(
    (i: any) => i.product?.isExternalProduct && i.seller?.storeType === "shopify"
  );
  const bySeller = new Map<number, any[]>();
  for (const it of shopifyItems) {
    const arr = bySeller.get(it.seller.id) ?? [];
    arr.push(it);
    bySeller.set(it.seller.id, arr);
  }

  // ── Normalized shipping address (Shopify MailingAddressInput, 2025-01) ──
  const shippingAddress: any = {
    firstName: order.firstName,
    lastName: order.lastName ?? "",
    address1: order.address1,
    address2: order.address2 ?? "",
    city: order.city,
    countryCode, // ISO2 — never a raw name
    zip: order.postalCode,
    company: order.company ?? "",
  };
  const shippingPhone = toE164Phone(order.phone, countryCode);
  if (shippingPhone) shippingAddress.phone = shippingPhone; // E.164 or omit
  // Gazaarabia does not capture province/state; send provinceCode only if present.
  const provinceCode = toProvinceCode((order as any).province ?? (order as any).state);
  if (provinceCode) shippingAddress.provinceCode = provinceCode;

  // Billing: prefer a distinct billing address IF Gazaarabia captured one.
  // The data model stores a single address snapshot, so billing mirrors shipping.
  const billingAddress = shippingAddress;

  // Order note: never overwrite the real note — preserve it, then reference the order.
  const note =
    order.notes && String(order.notes).trim()
      ? `${String(order.notes).trim()}\n\nGazaarabia Order #${order.id}`
      : `Gazaarabia Order #${order.id}`;

  const singleSeller = bySeller.size === 1;
  const groups: OrderGroup[] = [];

  for (const [sellerId, items] of bySeller) {
    const seller = items[0].seller;
    if (!seller.shopifyDomain) {
      console.log("[ORDER-PUSH-TRACE][SKIP] seller_group_missing_shopify_domain", { orderId, sellerId });
      errors.push(`Seller ${sellerId} is not linked to a Shopify store`);
      continue;
    }

    const lineItems: any[] = [];
    let ok = true;
    for (const it of items) {
      if (!it.variant?.externalVariantId) {
        errors.push(`Order item ${it.id} has no Shopify variant id`);
        ok = false;
        continue;
      }
      if (it.variant.isActive === false) {
        errors.push(`Variant for order item ${it.id} is inactive`);
        ok = false;
        continue;
      }
      if (it.quantity <= 0) {
        errors.push(`Order item ${it.id} has invalid quantity`);
        ok = false;
        continue;
      }
      lineItems.push({
        variantId: it.variant.externalVariantId, // stored GID — Phase 12: no lookup
        quantity: it.quantity,
        priceSet: { shopMoney: { amount: String(it.price), currencyCode: order.currency } },
      });
    }
    if (!ok || lineItems.length === 0) {
      console.log("[ORDER-PUSH-TRACE][SKIP] seller_group_invalid_line_items", { orderId, sellerId });
      continue;
    }

    const input: any = {
      email: order.user!.email,
      phone: toE164Phone(order.phone, countryCode) || undefined, // top-level: E.164 or omit
      currency: order.currency,
      financialStatus: "PAID",
      note,
      tags: ["gazaarabia", `gaza-${order.id}`],
      shippingAddress,
      billingAddress,
      lineItems,
    };
    // Only attach shipping when a single Shopify seller owns the order — splitting
    // shipping/tax/discount across multiple stores is deferred (see M4 notes).
    if (singleSeller && order.shippingCost > 0) {
      input.shippingLines = [
        {
          title: order.deliveryName ?? "Shipping",
          priceSet: { shopMoney: { amount: String(order.shippingCost), currencyCode: order.currency } },
        },
      ];
    }

    groups.push({
      sellerId,
      shop: seller.shopifyDomain,
      gazaOrderId: String(order.id),
      input,
      itemIds: items.map((i: any) => i.id),
    });
    console.log("[ORDER-PUSH-TRACE] seller_group_built", { orderId, sellerId, shop: seller.shopifyDomain, itemIds: items.map((i: any) => i.id) });
  }

  console.log("[ORDER-PUSH-TRACE][EXIT] buildShopifyOrders", { orderId, groupCount: groups.length, errors });
  return { groups, errors };
}
