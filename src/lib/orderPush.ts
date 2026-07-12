// lib/orderPush.ts

import { prisma } from '@/lib/prisma'
import type { ExternalPushResult } from '@/types/store'
import type { Orders, seller } from '@prisma/client'

// ─── Shopify ───────────────────────────────────────
async function pushToShopify(
  seller: seller,
  orderItem: any,
  order: Orders
): Promise<string> {
  const res = await fetch(
    `https://${seller.shopifyDomain}/admin/api/2024-01/orders.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': seller.shopifyAccessToken!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order: {
          line_items: [
            {
              variant_id: orderItem.product.externalVariantId,
              quantity:   orderItem.quantity,
              price:      orderItem.price.toString(),
            },
          ],
          shipping_address: {
            first_name: order.firstName,
            last_name:  order.lastName  ?? '',
            address1:   order.address1,
            address2:   order.address2  ?? '',
            city:       order.city,
            country:    order.country,
            zip:        order.postalCode,
            phone:      order.phone,
          },
          financial_status: 'paid',
          note: `Marketplace Order #${order.id}`,
        },
      }),
    }
  )

  const data = await res.json()
  if (!data.order?.id) throw new Error(JSON.stringify(data.errors))
  return data.order.id.toString()
}

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

// ─── Universal Push ────────────────────────────────
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

    let externalOrderId: string | null = null

    if (seller.storeType === 'shopify') {
      externalOrderId = await pushToShopify(seller, orderItem, orderItem.order)
    } else if (seller.storeType === 'woocommerce') {
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
  const order = await prisma.orders.findUnique({
    where:  { id: orderId },
    select: { status: true },
  })

  if (!order || !PAID_STATUSES.includes(order.status.toLowerCase())) return

  const items = await prisma.orderItem.findMany({
    where: {
      orderId,
      externalOrderId: null,
      product: { isExternalProduct: true },
    },
    select: { id: true },
  })

  for (const item of items) {
    await pushOrderToExternalStore({ orderItemId: item.id })
  }
}