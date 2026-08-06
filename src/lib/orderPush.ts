// lib/orderPush.ts

import { prisma } from '@/lib/prisma'
import type { ExternalPushResult } from '@/types/store'
import type { Orders, seller } from '@prisma/client'
import { pushShopifyOrders } from '@/lib/services/shopifyOrderPush'

// NOTE: Shopify orders are NOT created here anymore. Since Milestone 3 they are
// built from stored Variant GIDs and created via the Shopify app's GraphQL
// orderCreate (see src/lib/services/shopifyOrderPush.ts). This file only handles
// the WooCommerce REST push.

// ─── WooCommerce ───────────────────────────────────
async function pushToWooCommerce(
  seller: seller,
  orderItem: any,
  order: Orders
): Promise<string> {
  const auth = Buffer.from(
    `${seller.wooConsumerKey}:${seller.wooConsumerSecret}`
  ).toString('base64')

  const base = (seller.wooSiteUrl ?? '').replace(/\/+$/, '') // strip trailing slash

  // WooCommerce expects numeric ids; externalVariantId equals externalProductId
  // for simple products, and holds the variation id for variable ones.
  const productId = Number(orderItem.product.externalProductId)
  const variantId = Number(orderItem.product.externalVariantId)
  const lineItem: Record<string, any> = {
    product_id: productId,
    quantity:   orderItem.quantity,
  }
  if (variantId && variantId !== productId) {
    lineItem.variation_id = variantId
  }

  const res = await fetch(
    `${base}/wp-json/wc/v3/orders`,
    {
      method: 'POST',
      headers: {
        Authorization:  `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        line_items: [lineItem],
        shipping: {
          first_name: order.firstName,
          last_name:  order.lastName  ?? '',
          address_1:  order.address1,
          address_2:  order.address2  ?? '',
          city:       order.city,
          country:    order.country,
          postcode:   order.postalCode,
          phone:      order.phone,
        },
        payment_method:       'cod',
        payment_method_title: 'Marketplace Order',
        set_paid:             true,
        customer_note: `Marketplace Order #${order.id}`,
      }),
    }
  )

  const data = await res.json()
  if (!data.id) throw new Error(data.message ?? 'WooCommerce push failed')
  return data.id.toString()
}

// ─── WooCommerce order push ─────────────────────────
export async function pushOrderToExternalStore({
  orderItemId,
}: {
  orderItemId: number
}): Promise<ExternalPushResult> {
  try {
    const orderItem = await prisma.orderItem.findUnique({
      where:   { id: orderItemId },
      include: { product: true, order: true },
    })

    if (!orderItem) throw new Error('OrderItem not found')
    if (!orderItem.product.isExternalProduct) return { success: false, externalOrderId: null }

    const seller = await prisma.seller.findUnique({
      where: { id: orderItem.sellerId },
    })

    if (!seller?.storeType) return { success: false, externalOrderId: null }

    // WooCommerce only — Shopify is handled by pushShopifyOrders (the app flow).
    let externalOrderId: string | null = null
    if (seller.storeType === 'woocommerce') {
      externalOrderId = await pushToWooCommerce(seller, orderItem, orderItem.order)
    }

    if (externalOrderId) {
      await prisma.orderItem.update({
        where: { id: orderItemId },
        data:  { externalOrderId },
      })
    }

    return { success: true, externalOrderId }
  } catch (err) {
    const message = (err as Error).message
    console.error('Order push failed:', message)
    return { success: false, externalOrderId: null, error: message }
  }
}

// Order statuses that mean payment is confirmed and the order can be forwarded.
const PAID_STATUSES = [
  'paid',
  'succeeded',
  'processing',
  'confirmed',
  'shipped',
  'delivered',
]

// ─── Forward all external items on a paid order ────
/**
 * Push every external-store item on a paid order to the seller's store.
 * Idempotent: items that already carry an `externalOrderId` are skipped, so it
 * is safe to call from both the order-create path and the payment webhook — the
 * first to run does the work, the rest are no-ops.
 */
export async function pushExternalItemsForOrder(orderId: number): Promise<void> {
  console.log("[ORDER-PUSH-TRACE][ENTER] pushExternalItemsForOrder", { orderId });
  const order = await prisma.orders.findUnique({
    where:  { id: orderId },
    select: { status: true },
  })

  if (!order) {
    console.log("[ORDER-PUSH-TRACE][RETURN] pushExternalItemsForOrder: order_not_found", { orderId });
    return;
  }
  if (!PAID_STATUSES.includes(order.status.toLowerCase())) {
    console.log("[ORDER-PUSH-TRACE][RETURN] pushExternalItemsForOrder: order_not_paid", { orderId, status: order.status });
    return;
  }

  const items = await prisma.orderItem.findMany({
    where: {
      orderId,
      externalOrderId: null,
      product: { isExternalProduct: true },
    },
    select: { id: true, seller: { select: { storeType: true } } },
  })
  console.log("[ORDER-PUSH-TRACE] external_items_loaded", {
    orderId,
    count: items.length,
    storeTypes: items.map((item) => item.seller?.storeType ?? null),
  });

  // WooCommerce: existing per-item REST push (unchanged).
  for (const item of items) {
    if (item.seller?.storeType === 'woocommerce') {
      await pushOrderToExternalStore({ orderItemId: item.id })
    }
  }

  // Shopify (Milestone 3): one GraphQL order per seller, built from stored Variant
  // GIDs and created via the Shopify app (idempotent, offline session).
  if (items.some((i) => i.seller?.storeType === 'shopify')) {
    console.log("[ORDER-PUSH-TRACE][ENTER] pushShopifyOrders", { orderId });
    await pushShopifyOrders(orderId)
    console.log("[ORDER-PUSH-TRACE][EXIT] pushShopifyOrders", { orderId });
  } else {
    console.log("[ORDER-PUSH-TRACE][SKIP] pushShopifyOrders: no_shopify_items", { orderId });
  }
  console.log("[ORDER-PUSH-TRACE][EXIT] pushExternalItemsForOrder", { orderId });
}
