// Normalises Shopify products + ALL their variants into the marketplace shape.
// Both the GraphQL full-sync and the (REST-shaped) product webhooks funnel
// through here so ids are ALWAYS GraphQL GIDs and full-sync/webhook writes stay
// idempotent.

export interface NormalizedVariant {
  externalVariantId: string; // gid://shopify/ProductVariant/…
  externalProductId: string; // gid://shopify/Product/…
  sku: string | null;
  barcode: string | null;
  price: number;
  compareAtPrice: number | null;
  inventoryItemId: string | null; // gid://shopify/InventoryItem/…
  inventoryQuantity: number;
  weight: number | null;
  weightUnit: string | null;
  requiresShipping: boolean;
  taxable: boolean;
  position: number | null;
  title: string | null;
  options: { name: string; value: string }[];
  image: string | null; // variant image, falling back to product image
  createdAt: string | null;
  updatedAt: string | null;
}

export interface NormalizedProduct {
  externalProductId: string;
  externalVariantId: string; // representative (first) variant — backward compatible
  externalSource: "shopify";
  title: string;
  description: string | null;
  sellingPrice: number; // representative (first variant)
  costPrice: number;
  baseQty: number; // sum of all variant quantities
  slug: string;
  image: string | null;
  status: string | null;
  variants: NormalizedVariant[];
}

const toPrice = (v: unknown): number => {
  const n = parseFloat(v as string);
  return Number.isFinite(n) ? n : 0;
};

const productGid = (v: string | number): string => {
  const s = String(v);
  return s.startsWith("gid://") ? s : `gid://shopify/Product/${s}`;
};

const variantGid = (v: string | number | undefined): string => {
  if (v == null || v === "") return "";
  const s = String(v);
  return s.startsWith("gid://") ? s : `gid://shopify/ProductVariant/${s}`;
};

// ── GraphQL ─────────────────────────────────────────────────────
function mapGraphqlVariant(v: any, productImage: string | null): NormalizedVariant {
  const weight = v.inventoryItem?.measurement?.weight;
  return {
    externalVariantId: variantGid(v.id),
    externalProductId: productGid(v.product?.id ?? ""),
    sku: v.sku || null,
    barcode: v.barcode || null,
    price: toPrice(v.price),
    compareAtPrice: v.compareAtPrice != null ? toPrice(v.compareAtPrice) : null,
    inventoryItemId: v.inventoryItem?.id ?? null,
    inventoryQuantity: v.inventoryQuantity ?? 0,
    weight: weight?.value ?? null,
    weightUnit: weight?.unit ?? null,
    requiresShipping: v.inventoryItem?.requiresShipping ?? true,
    taxable: v.taxable ?? true,
    position: v.position ?? null,
    title: v.title ?? null,
    options: (v.selectedOptions ?? []).map((o: any) => ({ name: o.name, value: o.value })),
    image: v.image?.url ?? productImage, // variant image → product image fallback
    createdAt: v.createdAt ?? null,
    updatedAt: v.updatedAt ?? null,
  };
}

// `extraVariantNodes` are tail-fetched variants for products with >25 variants.
export function mapGraphqlProduct(node: any, extraVariantNodes: any[] = []): NormalizedProduct {
  const productImage = node.featuredImage?.url ?? null;
  const variantNodes = [...(node.variants?.nodes ?? []), ...extraVariantNodes];
  const variants = variantNodes.map((v) => mapGraphqlVariant(v, productImage));
  const primary = variants[0];
  return {
    externalProductId: productGid(node.id),
    externalVariantId: primary?.externalVariantId ?? "",
    externalSource: "shopify",
    title: node.title,
    description: node.descriptionHtml ?? null,
    sellingPrice: primary?.price ?? 0,
    costPrice: primary?.price ?? 0,
    baseQty: variants.reduce((s, v) => s + (v.inventoryQuantity || 0), 0),
    slug: node.handle,
    image: productImage,
    status: node.status ?? null,
    variants,
  };
}

// ── Webhook (REST-shaped payload) ───────────────────────────────
function mapWebhookVariant(
  v: any,
  productIdGid: string,
  imagesById: Map<number, string>,
  productImage: string | null
): NormalizedVariant {
  return {
    externalVariantId: variantGid(v.id),
    externalProductId: productIdGid,
    sku: v.sku || null,
    barcode: v.barcode || null,
    price: toPrice(v.price),
    compareAtPrice: v.compare_at_price != null ? toPrice(v.compare_at_price) : null,
    inventoryItemId: v.inventory_item_id != null ? `gid://shopify/InventoryItem/${v.inventory_item_id}` : null,
    inventoryQuantity: v.inventory_quantity ?? 0,
    weight: v.weight ?? null,
    weightUnit: v.weight_unit ?? null,
    requiresShipping: v.requires_shipping ?? true,
    taxable: v.taxable ?? true,
    position: v.position ?? null,
    title: v.title ?? null,
    options: [v.option1, v.option2, v.option3]
      .map((val: string, i: number) => (val ? { name: `option${i + 1}`, value: val } : null))
      .filter(Boolean) as { name: string; value: string }[],
    image: (v.image_id != null && imagesById.get(v.image_id)) || productImage,
    createdAt: v.created_at ?? null,
    updatedAt: v.updated_at ?? null,
  };
}

export function mapWebhookProduct(payload: any): NormalizedProduct {
  const productIdGid = productGid(payload.id);
  const productImage = payload.image?.src ?? payload.images?.[0]?.src ?? null;
  const imagesById = new Map<number, string>(
    (payload.images ?? []).map((img: any) => [img.id, img.src])
  );
  const variants = (payload.variants ?? []).map((v: any) =>
    mapWebhookVariant(v, productIdGid, imagesById, productImage)
  );
  const primary = variants[0];
  return {
    externalProductId: productIdGid,
    externalVariantId: primary?.externalVariantId ?? "",
    externalSource: "shopify",
    title: payload.title,
    description: payload.body_html ?? null,
    sellingPrice: primary?.price ?? 0,
    costPrice: primary?.price ?? 0,
    baseQty: variants.reduce((s: number, v: NormalizedVariant) => s + (v.inventoryQuantity || 0), 0),
    slug: payload.handle,
    image: productImage,
    status: payload.status ?? null,
    variants,
  };
}

export { productGid, variantGid };
