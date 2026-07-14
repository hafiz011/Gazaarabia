// Live product/inventory sync from webhooks. Reuses the same Gazaarabia endpoints
// and product mapping as the full sync, so writes stay idempotent (safe on
// duplicate webhook delivery).

import { gazaarabiaFetch } from "./gazaarabia.server";
import { mapWebhookProduct, productGid } from "./productMap.server";
import { INVENTORY_ITEM_QUERY } from "./queries.server";
import { log } from "./logger.server";

// products/create + products/update → upsert the product AND all its variants.
export async function handleProductUpsert(shop: string, payload: any): Promise<void> {
  const product = mapWebhookProduct(payload);
  await gazaarabiaFetch("/api/integrations/shopify/products", { shop, products: [product] });
  log.info("webhook.processed", {
    shop,
    kind: "product.upsert",
    id: product.externalProductId,
    variants: product.variants.length,
  });
}

// products/delete → deactivate the product.
export async function handleProductDelete(shop: string, payload: any): Promise<void> {
  const externalProductId = productGid(payload.id);
  await gazaarabiaFetch("/api/integrations/shopify/product-delete", { shop, externalProductId });
  log.info("webhook.processed", { shop, kind: "product.delete", id: externalProductId });
}

// inventory_levels/update → resolve the inventory item to its variant/product via
// GraphQL, then push the variant's total on-hand quantity.
export async function handleInventoryUpdate(shop: string, admin: any, payload: any): Promise<void> {
  const invId = payload?.inventory_item_id;
  if (!invId || !admin) return;

  const gid = `gid://shopify/InventoryItem/${invId}`;
  const res = await admin.graphql(INVENTORY_ITEM_QUERY, { variables: { id: gid } });
  const body = await res.json();
  const variant = body?.data?.inventoryItem?.variant;
  if (!variant?.product?.id) return;

  // Send the variant identity (GID + inventory item id) so Gazaarabia updates
  // ONLY this variant's stock — matched by identity, never SKU.
  await gazaarabiaFetch("/api/integrations/shopify/inventory", {
    shop,
    externalProductId: variant.product.id,
    externalVariantId: variant.id,
    inventoryItemId: gid,
    available: variant.inventoryQuantity ?? 0,
  });
  log.info("webhook.processed", {
    shop,
    kind: "variant.inventory",
    variant: variant.id,
    available: variant.inventoryQuantity,
  });
}
