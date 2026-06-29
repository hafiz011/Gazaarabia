# Email Integration Plan — Gazaarabia

## Phase 1: Consolidate Functions ✅
All 48 email functions consolidated into single files:
- ✅ `emailHelper.ts` — Core + Flows 1-3
- ✅ `emailFlows4-14.ts` — Flows 4-8, 10-11, 13-14
- ✅ `emailFlows9-14.ts` — Flows 9-14
- ✅ `emailVendorOnboarding.ts` — Flow 12

## Phase 2: Wire to API Routes (IN PROGRESS)

### Route: `/api/front-end/signup` (POST)
**Event:** User creates account  
**Emails to send:**
1. ✅ `sendWelcomeEmail1()` — Welcome + 10% code (immediate)

**Implementation:**
```typescript
// After user.create() success
await sendWelcomeEmail1({
  to: user.email,
  name: user.name,
  userId: user.id,
});

// Schedule remaining Welcome Series
// Email 2 @ Day 2, Email 3 @ Day 4, etc.
```

---

### Route: `/api/front-end/orders` (POST)
**Event:** Order placed  
**Emails to send:**
1. ✅ `sendOrderConfirmationEmail()` (existing)
2. ✅ `sendPostPurchaseEmail3CareGuide()` @ 3 days
3. ✅ `sendPostPurchaseEmail4Impact()` @ 7 days

**Implementation:**
```typescript
// After order.create() success
const invoiceUrl = await generateCustomerInvoice(order.id);

await sendOrderConfirmationEmail(user.email, {
  name: user.name,
  orderId: order.id,
  total: order.totalAmount,
  invoiceNumber: order.invoiceNumber,
  invoiceUrl: invoiceUrl,
  address: order.deliveryAddress,
  userId: user.id,
});

// Schedule follow-ups with delay
// Email 3 @ 3 days, Email 4 @ 7 days
```

---

### Route: `/api/front-end/cart` (GET/POST)
**Event:** Cart abandoned for 1+ hour  
**Emails to send:**
1. `sendAbandonedCartEmail1()` @ 1 hour
2. `sendAbandonedCartEmail2()` @ 24 hours
3. `sendAbandonedCartEmail3()` @ 72 hours

**Implementation:**
⚠️ Requires webhook/cron job (not direct API call)

```typescript
// Pseudocode for scheduled job
const abandonedCarts = await prisma.cart.findMany({
  where: {
    updatedAt: { lt: new Date(Date.now() - 1 * 60 * 60 * 1000) }, // 1 hour ago
    orderId: null, // not yet purchased
  },
});

for (const cart of abandonedCarts) {
  const product = await prisma.products.findUnique({ where: { id: cart.productId } });
  
  if (cart.lastEmailSentAt === null) {
    // Send Email 1
    await sendAbandonedCartEmail1({
      to: cart.userEmail,
      name: cart.userName,
      productTitle: product.name,
      checkoutUrl: `${domain}/checkout?cartId=${cart.id}`,
      userId: cart.userId,
    });
  } else if (Date.now() - cart.lastEmailSentAt > 24 * 60 * 60 * 1000) {
    // Send Email 2
    await sendAbandonedCartEmail2({...});
  } else if (Date.now() - cart.lastEmailSentAt > 72 * 60 * 60 * 1000) {
    // Send Email 3
    await sendAbandonedCartEmail3({...});
  }
}
```

---

### Route: `/api/front-end/reset-password` (POST)
**Event:** Password reset  
**Emails to send:**
1. ✅ `sendPasswordChangedEmail()` (existing)

**Already implemented** ✅

---

### Route: `/api/orders/[id]` (PATCH) — Admin
**Event:** Order status change (dispatch, etc.)  
**Emails to send:**
1. ✅ `sendOrderShippedEmail()` when status = "dispatched"

**Implementation:**
```typescript
if (updatedOrder.status === "dispatched") {
  await sendOrderShippedEmail({
    to: order.user.email,
    name: order.user.name,
    userId: order.user.id,
    trackingNumber: updatedOrder.trackingNumber,
  });
}
```

---

### Route: `/api/orders/[id]` (DELETE) — Admin
**Event:** Order cancelled  
**Emails to send:**
1. `sendOrderCancellationEmail()`

**Implementation:**
```typescript
if (cancelledOrder) {
  await sendOrderCancellationEmail({
    to: cancelledOrder.user.email,
    orderId: cancelledOrder.id,
    reason: "Cancelled by admin",
    userId: cancelledOrder.userId,
  });
}
```

---

### Route: `/api/refunds` (POST)
**Event:** Refund processed  
**Emails to send:**
1. `sendRefundConfirmationEmail()`

**Implementation:**
```typescript
await sendRefundConfirmationEmail({
  to: order.user.email,
  orderId: order.id,
  refundAmount: refund.amount,
  paymentMethod: order.paymentMethod,
  userId: order.userId,
});
```

---

### Route: `/api/newsletter/subscribe` (POST)
**Event:** User subscribes to newsletter  
**Emails to send:**
1. `sendWelcomeEmail1()` if new user
2. `sendSubscribeConfirmationEmail()` if existing user

**Implementation:**
```typescript
const existingUser = await prisma.users.findUnique({ where: { email } });

if (!existingUser) {
  const user = await prisma.users.create({...});
  await sendWelcomeEmail1({to: email, name, userId: user.id});
} else {
  await sendSubscribeConfirmationEmail({to: email, name});
}
```

---

### Route: `/api/seller/onboard` (POST)
**Event:** Seller account approved  
**Emails to send:**
1. `sendVendorOnboardingEmail1()` @ approval
2. `sendVendorOnboardingEmail2()` @ Day 2
3. `sendVendorOnboardingEmail3()` @ Day 4
4. `sendVendorOnboardingEmail4()` @ Day 7
5. `sendVendorOnboardingEmail5()` @ Day 14

**Implementation:**
```typescript
if (seller.isApproved && !seller.onboardingEmailSent) {
  await sendVendorOnboardingEmail1({
    to: seller.user.email,
    vendorName: seller.storeName,
    commission: seller.commission,
  });
  
  await prisma.seller.update({
    where: { id: seller.id },
    data: { onboardingEmailSent: true },
  });
  
  // Schedule remaining emails in background job
}
```

---

### Route: `/api/reviews` (POST)
**Event:** User makes purchase, 10 days pass  
**Emails to send:**
1. `sendReviewRequestEmail()` @ 10 days post-delivery

**Implementation:**
⚠️ Requires cron job

```typescript
// Scheduled job (daily)
const readyForReview = await prisma.order.findMany({
  where: {
    deliveredAt: { lt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    reviewEmailSent: false,
  },
});

for (const order of readyForReview) {
  const product = order.orderItems[0]; // first product in order
  
  await sendReviewRequestEmail({
    to: order.user.email,
    name: order.user.name,
    userId: order.user.id,
    productUrl: `${domain}/products/${product.productId}/reviews`,
  });
  
  await prisma.order.update({
    where: { id: order.id },
    data: { reviewEmailSent: true },
  });
}
```

---

## Phase 3: Scheduled Jobs (Cron)

These flows need background tasks:
- [ ] **Abandoned Cart** — Check every hour for carts 1hr+ old
- [ ] **Win-Back** — Check daily for users with no order in 45+ days
- [ ] **Sunset/List Clean** — Check weekly for users with no order in 90+ days
- [ ] **Review Request** — Check daily for orders 10 days post-delivery
- [ ] **Seasonal** — Manual campaigns (or date-triggered)
- [ ] **Back in Stock** — Product webhook (real-time)
- [ ] **Post-Purchase Follow-ups** — Delay-triggered (3 days, 7 days)

### Recommended Cron Job Tools
1. **Vercel Cron** (built-in, free tier)
2. **node-cron** (self-hosted, simple)
3. **Bull Queue** (Redis, robust)
4. **Inngest** (external, reliable)

---

## Phase 4: Testing

### Unit Tests
```bash
npm test -- emailHelper.test.ts
```

### Integration Tests
```bash
# Test sending a real email to test address
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@gmail.com","flow":"welcome-1"}'
```

### Manual Testing Checklist
- [ ] Signup → Welcome Email 1 arrives
- [ ] Order placed → Order Confirmation arrives
- [ ] Cart abandoned 1hr → Abandoned Cart Email 1 arrives
- [ ] Password reset → Password Changed arrives
- [ ] Order dispatched → Order Shipped arrives
- [ ] Review ready (10 days) → Review Request arrives
- [ ] Seller approved → Vendor Onboarding Email 1 arrives

---

## Phase 5: Deployment

1. [ ] Merge email function files into `emailHelper.ts`
2. [ ] Update all API routes with email calls
3. [ ] Set up cron jobs for scheduled emails
4. [ ] Test in staging environment
5. [ ] Monitor email deliverability in Zoho Mail
6. [ ] Deploy to production
7. [ ] Set up alerts for failed sends

---

## Files to Update

| File | Status | Email Count |
|------|--------|-------------|
| `emailHelper.ts` | 🔄 In progress | 17 |
| `src/app/api/front-end/signup/route.ts` | ⏳ Todo | 1 (welcome) |
| `src/app/api/front-end/orders/route.ts` | ⏳ Todo | 1 (confirmation) |
| `src/app/api/front-end/reset-password/route.ts` | ✅ Done | 1 (password changed) |
| `src/app/api/orders/[id]/route.ts` | ⏳ Todo | 2 (cancel, ship) |
| `src/cron/abandoned-cart.ts` | ⏳ New | 3 (abandoned) |
| `src/cron/post-purchase.ts` | ⏳ New | 2 (follow-ups) |
| `src/cron/review-request.ts` | ⏳ New | 1 (review) |
| `src/cron/win-back.ts` | ⏳ New | 2 (winback) |
| `src/cron/seasonal.ts` | ⏳ New | 4 (seasonal) |
| `src/cron/vendor-onboarding.ts` | ⏳ New | 5 (vendor) |

---

## Summary

**Total emails to implement:** 48  
**API routes to update:** 8  
**Cron jobs to create:** 6  
**Estimated time:** 6-8 hours  

**Next step:** Merge all email functions → Start wiring routes
