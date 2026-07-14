// GraphQL documents for the Shopify Admin API (GraphQL is required for new apps;
// REST is deprecated). Verify field names against your target api_version using
// the GraphiQL explorer or `npm run graphql-codegen`.

// Full variant field set — reused by the products query and the variant
// tail-fetch so both return identically-shaped variants.
const VARIANT_FIELDS = `
  id
  title
  sku
  barcode
  price
  compareAtPrice
  taxable
  position
  inventoryQuantity
  createdAt
  updatedAt
  selectedOptions { name value }
  image { url }
  product { id }
  inventoryItem {
    id
    requiresShipping
    measurement { weight { value unit } }
  }
`;

// Page sizes tuned to stay under Shopify's 1000-point query-cost ceiling:
// 20 products × 25 variants each. Products with >25 variants are topped up by
// PRODUCT_VARIANTS_QUERY (rare — not a per-product N+1).
export const PRODUCTS_QUERY = `#graphql
  query Products($cursor: String, $query: String) {
    products(first: 20, after: $cursor, query: $query, sortKey: UPDATED_AT) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        title
        handle
        descriptionHtml
        status
        createdAt
        updatedAt
        featuredImage { url }
        variants(first: 25) {
          pageInfo { hasNextPage endCursor }
          nodes { ${VARIANT_FIELDS} }
        }
      }
    }
  }
`;

// Tail-fetch the remaining variants of a single product that has 25+ variants.
export const PRODUCT_VARIANTS_QUERY = `#graphql
  query ProductVariants($id: ID!, $cursor: String) {
    product(id: $id) {
      variants(first: 100, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes { ${VARIANT_FIELDS} }
      }
    }
  }
`;

// Resolves an inventory_item_id (from inventory_levels/update) to its specific
// variant so only that variant's stock is updated.
export const INVENTORY_ITEM_QUERY = `#graphql
  query InvItem($id: ID!) {
    inventoryItem(id: $id) {
      id
      variant {
        id
        sku
        inventoryQuantity
        product { id }
      }
    }
  }
`;

// Create an order in the merchant's store when a marketplace sale happens.
// `OrderCreateOrderInput` is available on 2024-10+; confirm the exact shape for
// your api_version.
export const ORDER_CREATE_MUTATION = `#graphql
  mutation OrderCreate($order: OrderCreateOrderInput!) {
    orderCreate(order: $order) {
      order {
        id
        name
        legacyResourceId
        displayFinancialStatus
        displayFulfillmentStatus
        cancelledAt
      }
      userErrors { field message }
    }
  }
`;
