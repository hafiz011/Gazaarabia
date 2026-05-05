// types/store.ts

export type StoreType = 'shopify' | 'woocommerce'

export interface ShopifyCredentials {
  domain: string
  accessToken: string
}

export interface WooCredentials {
  siteUrl: string
  consumerKey: string
  consumerSecret: string
}

export interface NormalizedProduct {
  externalProductId: string
  externalVariantId: string
  externalSource:    StoreType
  title:             string
  description:       string | null
  sellingPrice:      number
  costPrice:         number
  baseQty:           number
  slug:              string
  image:             string | null
}

export interface PushOrderPayload {
  orderItemId: number
  orderId:     number
}

export interface ExternalPushResult {
  success:         boolean
  externalOrderId: string | null
  error?:          string
}