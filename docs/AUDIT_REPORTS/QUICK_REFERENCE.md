# GAZAARABIA Audit — Quick Reference

## Status at a Glance
- **Overall:** 76% Complete (MVP-ready, not production-ready)
- **Critical Issues:** 5
- **High Issues:** 12
- **Fix Time:** 3-4 weeks

---

## Top 5 Blockers (Fix First)

| # | Issue | File | Impact |
|---|-------|------|--------|
| 1 | PayPal orders unauthenticated | `src/app/api/paypal/create-order/route.ts` | Anyone can create orders |
| 2 | Bank details exposed in API | `src/app/api/affiliates/route.ts` | GDPR violation, PII leak |
| 3 | JWT expires in 7 days | `src/lib/authToken.ts` | Token theft risk |
| 4 | Payouts disabled | `src/app/api/payouts/route.ts` | Sellers can't get paid |
| 5 | Cart stock race condition | `src/app/api/front-end/cart/validate-stock/route.ts` | Overselling possible |

---

## What's Working ✅

- Authentication (login/register/JWT)
- Product catalog & search
- Shopping cart & checkout
- Stripe payments
- Seller product upload
- Order placement
- Basic admin login
- Role-based routing

---

## What's Broken ❌

- Payouts (disabled)
- Return/refund execution
- Admin dashboard (80% non-functional)
- Seller dashboard (60% complete)
- Content manager (UI missing)
- Commission verification
- Loyalty system (stubbed)

---

## What's Incomplete ⚠️

- Multi-seller verification/approval workflow
- Affiliate bank account validation
- Return request processing flow
- Ambassador commission tracking
- Store sync (Shopify/WooCommerce started but unfinished)
- GDPR compliance features
- Error logging/monitoring

---

## Key Architectural Decisions

**Multi-Tenant Model:**
- Each seller has isolated shop (via `seller.sellerId` on products)
- Orders split into OrderItems per seller
- Commission calculated at OrderItem level

**Commission Sources (Ambiguous):**
1. seller.commissionValue
2. products.commissionValue
3. CategoryCommission
4. SubcategoryCommission
⚠️ **No documented hierarchy**

**Affiliate vs Ambassador:**
- Single `Affiliate` model with `type: "affiliate" | "ambassador"`
- Relations tangled; difficult to trace which commission applies where

---

## Code Debt

**Remove (unused):**
- `wouter` package
- `react-icons` (use lucide-react or MUI Icons)
- `@uiw/react-md-editor`
- `marked` (redundant with react-quill)

**Fix (hardcoded):**
- Commission percentages scattered in code
- URLs hardcoded in components
- Payout eligibility (30 days) hardcoded

**Add (missing):**
- Input validation on commission fields
- Type safety for request bodies
- Error logging service
- Database query optimization

---

## Database Schema Issues

**Problem Areas:**
- No audit trail fields (created_by, updated_by)
- String statuses instead of enums
- Missing indexes on frequently filtered columns
- Unused fields (WooCommerce integration incomplete)
- Affiliate model ambiguity

**Orphaned Tables:**
- StoreSync (no processor)
- Unused external product tracking

---

## Performance Red Flags

- N+1 queries in seller earnings calculations
- No pagination on product/order listings
- Large dependencies (MUI, ApexCharts) may not be fully used
- Images likely unoptimized
- Bundle size likely 800KB+ (target: <500KB)

---

## Compliance Gaps

| Requirement | Status | Action |
|---|---|---|
| GDPR - right to deletion | ❌ MISSING | Add cascade delete + audit trail |
| GDPR - data export | ❌ MISSING | Add personal data export endpoint |
| PCI DSS - payment data | ✅ OK | Stripe/PayPal handle it |
| Privacy policy | ✅ PRESENT | But no version tracking |
| Terms updated | ⚠️ STATIC | No change notifications to users |

---

## Recommended 3-Week Plan

**Week 1: Security Hardening**
- [ ] Fix PayPal auth
- [ ] Restrict affiliate bank endpoint
- [ ] Reduce JWT expiration
- [ ] Fix cart race condition
- [ ] Enable payouts

**Week 2: Core Feature Completion**
- [ ] Implement refund execution
- [ ] Complete seller dashboard
- [ ] Add error logging
- [ ] Document commission hierarchy
- [ ] Remove unused dependencies

**Week 3: Admin & Polish**
- [ ] Build basic admin dashboard
- [ ] Add input validation everywhere
- [ ] Implement GDPR features
- [ ] Database query optimization
- [ ] Content manager UI

---

## Testing Checklist (Manual)

- [ ] Seller can upload product → appears on site → can be purchased
- [ ] Commission calculated correctly for product/category/affiliate combinations
- [ ] Return request → approved → refund → appears in customer account
- [ ] Payout generated after 30 days → seller receives funds
- [ ] Ambassador product → customer purchases → ambassador earns commission
- [ ] Affiliate coupon → customer uses → affiliate earns commission
- [ ] Cart item quantity updates → stock updates correctly
- [ ] Order cancellation → stock restored

---

## Files to Prioritize

```
src/app/api/
  ├── paypal/create-order/route.ts          [CRITICAL - AUTH]
  ├── affiliates/route.ts                   [CRITICAL - PII]
  ├── payouts/route.ts                      [CRITICAL - DISABLED]
  ├── returns/[id]/route.ts                 [HIGH - NO REFUND]
  ├── seller/products/route.ts              [HIGH - VALIDATION]
  ├── seller/earnings/route.ts              [HIGH - PERF]
  └── stripe/webhook/route.ts               [HIGH - IDEMPOTENCY]

src/lib/
  └── authToken.ts                          [CRITICAL - JWT]

src/app/
  ├── admin/                                [HIGH - INCOMPLETE]
  └── seller/                               [HIGH - 60% DONE]

prisma/
  └── schema.prisma                         [HIGH - AMBIGUITY]
```

---

## Questions for Product Owner

1. When does seller payout happen? (daily/weekly/monthly?)
2. What's the commission hierarchy? (product overrides category overrides platform?)
3. Should ambassador and affiliate be separate roles or combined?
4. Is Shopify/WooCommerce sync still planned? (started but unfinished)
5. What's the loyalty points system design?
6. Do you need GDPR compliance before launch or for beta?
7. What's the target concurrent user load?
8. Should admin approve sellers before they can list products?
