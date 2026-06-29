# GAZAARABIA — API Endpoints & Database Audit

---

## API ENDPOINTS AUDIT

### Authentication Endpoints

| Endpoint | Method | Auth | Status | Issues |
|----------|--------|------|--------|--------|
| `/api/front-end/login` | POST | ❌ | ✅ GOOD | Rate-limited 5/min; password hashed |
| `/api/front-end/register` | POST | ❌ | ✅ GOOD | Email validation; password hashing |
| `/api/auth/[...nextauth]` | - | ✅ | ⚠️ PARTIAL | JWT used but NextAuth config unclear |

**Issue:** JWT token lifespan 7 days (should be 1 hour max)

---

### Payment Endpoints

| Endpoint | Method | Auth | Status | Issues |
|----------|--------|------|--------|--------|
| `/api/stripe/create-payment-intent` | POST | ✅ | ✅ GOOD | Validates user & order |
| `/api/stripe/webhook` | POST | ❌ | ⚠️ RISKY | No idempotency check; duplicate webhook could double-credit |
| `/api/paypal/create-order` | POST | ❌ | 🔴 CRITICAL | **No auth check** — anyone can create |
| `/api/paypal/capture-order` | POST | ✅ | ✅ GOOD | Validates user |
| `/api/paypal/webhook` | POST | ❌ | ⚠️ RISKY | Same as Stripe; no idempotency |

**Severity:** PayPal endpoint CRITICAL; webhook endpoints HIGH

---

### Order Endpoints

| Endpoint | Method | Auth | Status | Issues |
|----------|--------|------|--------|--------|
| `/api/orders` | POST | ✅ | ⚠️ WEAK | Late role check; allows some manipulation |
| `/api/orders` | GET | ✅ | ✅ GOOD | Filters by user |
| `/api/orders/[id]` | GET | ✅ | ⚠️ WEAK | No ownership verification |
| `/api/orders/[id]/cancel` | PATCH | ✅ | ❌ MISSING | No cancel endpoint visible |

**Issues:**
- No validation that all order items belong to same seller
- No check for quantity > available stock
- Discount not verified against coupon

---

### Cart Endpoints

| Endpoint | Method | Auth | Status | Issues |
|----------|--------|------|--------|--------|
| `/api/front-end/cart` | GET | ✅ | ✅ GOOD | Retrieves user's cart |
| `/api/front-end/cart` | POST | ✅ | ⚠️ WEAK | No duplicate check |
| `/api/front-end/cart/[id]` | PATCH | ✅ | ✅ GOOD | Updates quantity |
| `/api/front-end/cart/[id]` | DELETE | ✅ | ✅ GOOD | Removes item |
| `/api/front-end/cart/validate-stock` | POST | ✅ | 🔴 RACE CONDITION | Checks stock but doesn't reserve |

**Race condition scenario:**
1. Product has 1 item left
2. User A checks stock → returns 1 available
3. User B checks stock → returns 1 available (both think they can buy)
4. Both proceed to checkout
5. Both orders placed; stock oversold

---

### Seller Endpoints

| Endpoint | Method | Auth | Status | Issues |
|----------|--------|------|--------|--------|
| `/api/seller/products` | GET | ✅ | ✅ GOOD | Lists seller's products |
| `/api/seller/products` | POST | ✅ | ⚠️ WEAK | Missing seller ownership verification |
| `/api/seller/products/[id]` | PATCH | ✅ | 🟠 HIGH | No ownership check; seller could edit another's |
| `/api/seller/products/[id]` | DELETE | ✅ | 🟠 HIGH | No ownership check |
| `/api/seller/dashboard` | GET | ✅ | ⚠️ SLOW | Joins 5+ tables; likely N+1 query |
| `/api/seller/earnings` | GET | ✅ | 🟠 HIGH | Commission verification missing |
| `/api/seller/payout-eligibility` | GET | ✅ | ⚠️ WEAK | No audit trail of when checked |
| `/api/payouts` | POST | ⚠️ DISABLED | 🔴 CRITICAL | Process disabled; no alternative shown |

**Issues:**
- Missing authorization checks on 3 critical endpoints
- Dashboard query efficiency poor
- Payouts completely disabled

---

### Affiliate Endpoints

| Endpoint | Method | Auth | Status | Issues |
|----------|--------|------|--------|--------|
| `/api/affiliates` | GET | ✅ | 🔴 PII LEAK | Returns bank account details without role check |
| `/api/affiliates` | POST | ✅ | ✅ OK | Creates affiliate record |
| `/api/affiliates/bank-account` | PATCH | ✅ | ✅ OK | Updates bank details |

**Critical Issue:** Bank account endpoint leaks IBAN, sort code, account number to any authenticated user

---

### Return/Refund Endpoints

| Endpoint | Method | Auth | Status | Issues |
|----------|--------|------|--------|--------|
| `/api/returns` | POST | ✅ | ✅ OK | Creates return request |
| `/api/returns/[id]` | GET | ✅ | ✅ OK | Gets return status |
| `/api/returns/[id]` | PATCH | ✅ | ❌ INCOMPLETE | Updates status but doesn't execute refund |

**Critical Gap:** Refund execution NOT IMPLEMENTED
- Status updated to "refunded" but no actual refund call to Stripe/PayPal
- No balance update to seller
- No notification to customer

---

### Admin Endpoints

| Endpoint | Method | Auth | Status | Issues |
|----------|--------|------|--------|--------|
| `/api/admin/sellers` | GET | ✅ | ❌ MISSING | No seller approval workflow visible |
| `/api/admin/orders` | GET | ✅ | ❌ MISSING | No order management dashboard |
| `/api/admin/commission-settings` | PATCH | ✅ | ❌ MISSING | No endpoint to update commissions |
| `/api/admin/coupons` | GET/POST | ✅ | ⚠️ PARTIAL | Coupons created but admin UI missing |

**Issue:** Admin API mostly missing; no way to approve sellers or manage platform

---

### Upload Endpoints

| Endpoint | Method | Auth | Status | Issues |
|----------|--------|------|--------|--------|
| `/api/upload/image` | POST | ✅ | ⚠️ WEAK | No file type validation |
| `/api/upload/document` | POST | ✅ | ⚠️ WEAK | No size limits? |

**Issues:**
- No virus scanning
- No file size limits visible
- No rate limiting

---

## DATABASE SCHEMA ISSUES

### 1. Commission System — 4 Sources, No Priority

```prisma
// Source 1: Platform default
model PlatformSettings {
  defaultCommissionValue Float @default(5)
}

// Source 2: Seller-specific
model seller {
  commissionValue Float @default(5)
}

// Source 3: Product-specific
model products {
  commissionValue Float @default(5)
}

// Source 4: Category-specific
model CategoryCommission {
  commission Float
}

// Source 5: Subcategory-specific
model SubcategoryCommission {
  commission Float
}

// Applied at: OrderItem level
model OrderItem {
  commissionValue Float    // Which source was this from?
  commissionAmount Float   // Result of calculation
}
```

**Problem:**
- No documented hierarchy
- OrderItem doesn't record which source was used
- No way to audit if correct commission applied
- Disputes unresolvable

**Example scenario:**
```
Platform default: 5%
Seller setting: 7%
Product override: 10%
Category setting: 8%
Subcategory setting: 6%

When order placed — which applies? All five? One? No documentation.
OrderItem stores final commissionValue but not the source.
```

---

### 2. Affiliate/Ambassador Ambiguity

```prisma
model Affiliate {
  type: String @default("affiliate")  // "affiliate" | "ambassador"
  baseCommission Float                // Admin's cut
  shareCommission Float               // User's cut
  
  // Inconsistent relations:
  orders Orders[] @relation("OrderAffiliateRelation")
  ambassadorOrders Orders[] @relation("OrderAmbassadorRelation")
  orderItemAmbassadors OrderItem[] @relation("OrderItemAmbassadorRelation")
  
  // Product-level assignment
  products products[] @relation("AffiliateAmbassadorRelation")
}

// Also tracked at product level:
model products {
  ambassadorId Int?
  ambassador Affiliate?
}

// Also tracked at order level:
model Orders {
  affiliateId Int?
  affiliateCommission Float?
  affiliateEarning Float?
  ambassadorId Int?
  ambassadorPaid Boolean
}

// Also tracked at item level:
model OrderItem {
  ambassadorId Int?
  ambassadorCommission Float?
  ambassadorEarning Float?
  ambassadorPaid Boolean
}
```

**Problem:**
- Single Affiliate model for two distinct roles
- Relations named confusingly (`ambassadorOrders` on Affiliate)
- No clear distinction between "coupon-based" affiliate and "product-assigned" ambassador
- Commission tracking fragmented across 4 models

**Example conflict:**
```
Product assigned to Ambassador A
Order uses Affiliate B's coupon

Which one earns commission? Both? Partial split?
No logic to resolve this conflict.
```

---

### 3. Missing Indexes

```sql
-- These queries likely slow:

-- Find orders for a seller
SELECT * FROM orders_item WHERE sellerId = ?  -- No index!

-- Search products by seller
SELECT * FROM products WHERE sellerId = ?     -- Has index ✓

-- Find returns by status
SELECT * FROM return_requests WHERE status = ? -- No index!

-- Cart lookups
SELECT * FROM carts WHERE userId = ? AND variantId = ?  -- No composite index!

-- Product variants by SKU
SELECT * FROM productvariant WHERE sku = ?   -- No unique constraint!
```

---

### 4. No Audit Trail Fields

```prisma
// Missing on almost all models:
// - createdBy Int?
// - updatedBy Int?
// - changeLog Json?

// This means:
// - Can't see who created an order (for support tickets)
// - Can't see who approved a return
// - Can't see commission history
// - No compliance trail for regulatory audits
```

---

### 5. String Status Fields (No Enums)

```prisma
// Scattered throughout:
seller.status: String @default("Pending")       // What values? Pending/Active/Rejected?
Orders.status: String @default("pending")       // pending/processing/shipped/delivered/cancelled?
ReturnRequest.status: String @default("pending") // pending/approved/rejected/returned/refunded?
StoreSync.status: String                        // success/failed/running?
CharityDonations.paymentStatus: String          // pending/success/failed?

// Problems:
// - No type checking (typo: "sucess" vs "success")
// - Hard to enforce valid transitions
// - Unclear what states are valid
// - No documentation in schema
```

---

### 6. Unused/Orphaned Fields

```prisma
seller {
  storeType String?          // "shopify" | "woocommerce" | null
  shopifyDomain String?      // Set but no sync visible
  shopifyAccessToken String? // Stored but not used
  wooSiteUrl String?         // WooCommerce sync incomplete
  wooConsumerKey String?
  wooConsumerSecret String?
  shopifySyncEnabled Boolean // Flag set but processor missing
  lastSyncedAt DateTime?
}

StoreSync {
  // Table exists but no code calling it
  // Sync processor logic not found in codebase
}

products {
  externalProductId String? @unique  // Incomplete external mapping
  externalVariantId String?
  externalSource String?            // "shopify" | "woocommerce"
  isExternalProduct Boolean
}
```

**Impact:** Dead code; confusion for new developers

---

### 7. Foreign Key Cascades — Risk Analysis

```prisma
// Dangerous cascades:
Categories → onDelete: Cascade → Subcategory → Submenus
// Deleting a category deletes all subcategories and submenus

Menus → onDelete: Cascade → Categories
// Deleting a menu cascades down the whole tree

Users → onDelete: Cascade → Orders, Cart, Wishlist, Reviews, etc.
// Deleting a user deletes all their data (good for GDPR but risky if accidental)

seller → onDelete: NO CASCADE
// Deleting a seller doesn't delete their products (data orphaned)
```

**Issue:** Inconsistent cascade strategy; no audit trail of deletions

---

## QUERY PERFORMANCE ANALYSIS

### N+1 Query Issues Found

**1. Seller Earnings Calculation**
```typescript
// File: src/app/api/seller/earnings/route.ts
async function calculateEarnings(sellerId) {
  const orderItems = await db.orderItem.findMany({
    where: { sellerId }  // Fetches 1000s of items
  })
  
  // For each item, queries seller (N+1):
  for (const item of orderItems) {
    const seller = await db.seller.findUnique({
      where: { id: item.sellerId }
    })
    // Calculate commission using seller.commissionValue
  }
}
```
**Fix:** Include seller in initial findMany, or fetch once

**2. Commission Lookups**
```typescript
// Pseudo-code showing N+1
const orders = await db.orders.findMany()

for (const order of orders) {
  const orderItems = await db.orderItem.findMany({
    where: { orderId: order.id }
  })
  
  for (const item of orderItems) {
    const product = await db.products.findUnique({
      where: { id: item.productId }
    })
    const category = await db.categories.findUnique({
      where: { id: product.categoryId }
    })
    const categoryCommission = await db.categoryCommission.findUnique({
      where: { categoryId: category.id }
    })
  }
}
```
**Fix:** Eager load with include/select; batch queries

---

### Missing Pagination

```typescript
// Problematic queries:
GET /api/seller/products   // No limit; could return 10,000 products
GET /api/front-end/cart    // Fetches entire cart (usually OK)
GET /api/orders            // No pagination; customer sees all orders at once
```

---

## SUMMARY TABLE

| Category | Status | Count | Severity |
|----------|--------|-------|----------|
| Authentication issues | 1 | 1 | HIGH |
| Payment endpoint issues | 2 | 1 CRITICAL + 1 HIGH |
| Authorization gaps | 5 | 5 HIGH |
| Race conditions | 1 | 1 HIGH |
| Missing functionality | 8 | 3 CRITICAL + 5 HIGH |
| Schema ambiguity | 3 | 3 HIGH |
| Query performance | 5+ | 5 MEDIUM |
| Data validation | 4 | 4 MEDIUM |

**Total API issues:** 29
**Total DB issues:** 15
