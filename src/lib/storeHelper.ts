// lib/storeHelper.ts
//
// WooCommerce REST product fetching. NOTE: Shopify is NO LONGER handled here —
// it uses the dedicated OAuth Shopify app (GraphQL). The old REST Shopify fetch
// was removed with Milestone 4 cleanup.

import type { NormalizedProduct } from '@/types/store'
import type { seller } from '@prisma/client'

// Parse a price-like value into a finite number. WooCommerce variable products
// return "" for price/regular_price, which parseFloat would turn into NaN.
function toPrice(value: unknown): number {
  const n = parseFloat(value as string)
  return Number.isFinite(n) ? n : 0
}

// ─── WooCommerce ───────────────────────────────────
export async function fetchWooProducts(
  siteUrl: string,
  consumerKey: string,
  consumerSecret: string
): Promise<NormalizedProduct[]> {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')
  const base = siteUrl.replace(/\/+$/, '') // strip trailing slash(es) to avoid `//wp-json`

  const perPage = 100
  const all: NormalizedProduct[] = []
  let totalPages = 1

  // WooCommerce paginates; without looping we would only import the first page.
  // `X-WP-TotalPages` (set on the first response) tells us how many pages exist.
  for (let page = 1; page <= totalPages; page++) {
    const res = await fetch(
      `${base}/wp-json/wc/v3/products?per_page=${perPage}&page=${page}`,
      {
        headers: { Authorization: `Basic ${auth}` },
        cache: 'no-store',
      }
    )

    if (!res.ok) throw new Error(`WooCommerce fetch failed: ${res.statusText}`)

    if (page === 1) {
      totalPages = parseInt(res.headers.get('X-WP-TotalPages') ?? '1', 10) || 1
    }

    const products = await res.json()
    if (!Array.isArray(products)) break

    for (const p of products) {
      all.push({
        externalProductId: p.id.toString(),
        externalVariantId: p.variations?.[0]?.toString() ?? p.id.toString(),
        externalSource:    'woocommerce',
        title:             p.name,
        description:       p.description ?? null,
        sellingPrice:      toPrice(p.price),
        costPrice:         toPrice(p.regular_price || p.price),
        baseQty:           p.stock_quantity ?? 0,
        slug:              `${p.slug}-${p.id}`,
        image:             p.images?.[0]?.src ?? null,
      })
    }
  }

  return all
}

// ─── Universal Fetcher (WooCommerce only) ──────────
export async function fetchExternalProducts(
  seller: seller
): Promise<NormalizedProduct[]> {
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