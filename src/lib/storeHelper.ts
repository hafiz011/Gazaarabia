// lib/storeHelper.ts

import type {
  NormalizedProduct,
  StoreType,
} from '@/types/store'
import type { seller } from '@prisma/client'

// ─── Shopify ───────────────────────────────────────
export async function fetchShopifyProducts(
  domain: string,
  token: string
): Promise<NormalizedProduct[]> {
  const res = await fetch(
    `https://${domain}/admin/api/2024-01/products.json?limit=250`,
    {
      headers: { 'X-Shopify-Access-Token': token },
      cache: 'no-store',
    }
  )

  if (!res.ok) throw new Error(`Shopify fetch failed: ${res.statusText}`)

  const data = await res.json()

  return data.products.map((p: any): NormalizedProduct => ({
    externalProductId: p.id.toString(),
    externalVariantId: p.variants[0]?.id?.toString() ?? '',
    externalSource:    'shopify',
    title:             p.title,
    description:       p.body_html ?? null,
    sellingPrice:      parseFloat(p.variants[0]?.price ?? '0'),
    costPrice:         parseFloat(p.variants[0]?.price ?? '0'),
    baseQty:           p.variants[0]?.inventory_quantity ?? 0,
    slug:              `${p.handle}-${p.id}`,
    image:             p.images?.[0]?.src ?? null,
  }))
}

// ─── WooCommerce ───────────────────────────────────
export async function fetchWooProducts(
  siteUrl: string,
  consumerKey: string,
  consumerSecret: string
): Promise<NormalizedProduct[]> {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')

  const res = await fetch(
    `${siteUrl}/wp-json/wc/v3/products?per_page=100`,
    {
      headers: { Authorization: `Basic ${auth}` },
      cache: 'no-store',
    }
  )

  if (!res.ok) throw new Error(`WooCommerce fetch failed: ${res.statusText}`)

  const products = await res.json()

  return products.map((p: any): NormalizedProduct => ({
    externalProductId: p.id.toString(),
    externalVariantId: p.variations?.[0]?.toString() ?? p.id.toString(),
    externalSource:    'woocommerce',
    title:             p.name,
    description:       p.description ?? null,
    sellingPrice:      parseFloat(p.price ?? '0'),
    costPrice:         parseFloat(p.regular_price ?? p.price ?? '0'),
    baseQty:           p.stock_quantity ?? 0,
    slug:              `${p.slug}-${p.id}`,
    image:             p.images?.[0]?.src ?? null,
  }))
}

// ─── Universal Fetcher ─────────────────────────────
export async function fetchExternalProducts(
  seller: seller
): Promise<NormalizedProduct[]> {
  if (
    seller.storeType === 'shopify' &&
    seller.shopifyDomain &&
    seller.shopifyAccessToken
  ) {
    return fetchShopifyProducts(seller.shopifyDomain, seller.shopifyAccessToken)
  }

  if (
    seller.storeType === 'woocommerce' &&
    seller.wooSiteUrl &&
    seller.wooConsumerKey &&
    seller.wooConsumerSecret
  ) {
    return fetchWooProducts(
      seller.wooSiteUrl,
      seller.wooConsumerKey,
      seller.wooConsumerSecret
    )
  }

  throw new Error('No valid store credentials found')
}