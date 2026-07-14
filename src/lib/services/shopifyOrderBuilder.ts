import { prisma } from "@/lib/prisma";

// Phase 1 + 2: validate a marketplace order and build one Shopify
// OrderCreateOrderInput per Shopify-connected seller, using the Variant GIDs
// stored in Milestone 2.6 — NO runtime product discovery, NEVER by SKU.

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

  if (!order) return { groups: [], errors: ["Order not found"] };

  // ── Order-level validation (Phase 1) ──
  if (!order.firstName || !order.address1 || !order.city || !order.country || !order.postalCode) {
    errors.push("Shipping address is incomplete");
  }
  if (!order.user?.email) errors.push("Customer email is missing");
  if (!order.currency || !SUPPORTED_CURRENCIES.has(order.currency)) {
    errors.push(`Unsupported currency: ${order.currency}`);
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

  const addr = {
    firstName: order.firstName,
    lastName: order.lastName ?? "",
    address1: order.address1,
    address2: order.address2 ?? "",
    city: order.city,
    country: order.country,
    zip: order.postalCode,
    phone: order.phone ?? "",
    company: order.company ?? "",
  };

  const singleSeller = bySeller.size === 1;
  const groups: OrderGroup[] = [];

  for (const [sellerId, items] of bySeller) {
    const seller = items[0].seller;
    if (!seller.shopifyDomain) {
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
    if (!ok || lineItems.length === 0) continue; // fail before contacting Shopify

    const input: any = {
      email: order.user!.email,
      phone: order.phone || undefined,
      currency: order.currency,
      financialStatus: "PAID",
      note: `Gazaarabia order #${order.id}`,
      tags: ["gazaarabia", `gaza-${order.id}`],
      shippingAddress: addr,
      billingAddress: addr,
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
  }

  return { groups, errors };
}
