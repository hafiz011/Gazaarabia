# Payment Methods Analysis Report
**Date:** May 7, 2026  
**Issue:** Card payment works but Apple Pay, Google Pay, etc. show return URL failures

---

## Executive Summary

The current implementation has **critical issues with wallet payments** (Apple Pay, Google Pay). While card payments work through the Stripe Card form, wallet payments fail during the redirect phase due to:

1. **Missing return_url configuration** for wallet payment methods
2. **Deprecated Stripe API usage** in StripeCardForm
3. **Improper clientSecret access** in PaymentRequest API handler
4. **No fallback redirect handling** after payment completion
5. **Incomplete payment intent setup** for hosted payment flow

---

## Current Payment Methods Status

| Payment Method | Status | Issues |
|---|---|---|
| **Card (Direct)** | ✅ Working | None - uses `confirmPayment()` with Elements |
| **PayPal** | ✅ Working | Properly configured with modal & callbacks |
| **Apple Pay** | ❌ Failing | Missing return_url, uses deprecated API |
| **Google Pay** | ❌ Failing | Missing return_url, uses deprecated API |
| **Klarna/Other Wallets** | ❌ Failing | Not configured, no return_url setup |

---

## Detailed Analysis

### 1. StripeCardForm Issues (`src/components/StripeCardForm.tsx`)

#### Issue A: PaymentRequest Event Handler (Lines 40-65)
```tsx
pr.on("paymentmethod", async (ev) => {
    const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
        (elements as any)._commonOptions.clientSecret,  // ❌ WRONG
        { payment_method: ev.paymentMethod.id },
        { handleActions: false }
    );
```

**Problems:**
- Uses **deprecated** `confirmCardPayment()` (should use `confirmPayment()`)
- Accesses clientSecret via private `_commonOptions` (fragile, not guaranteed)
- No `return_url` provided → wallet redirects fail
- Third parameter `{ handleActions: false }` not valid in this context

#### Issue B: Missing Return URL
```tsx
const pr = stripe.paymentRequest({
    country: "GB",
    currency: "gbp",
    total: { label: "Total Amount", amount: Math.round(amount * 100) },
    requestPayerName: true,
    requestPayerEmail: true,
    // ❌ MISSING: return_url for SCA/3D Secure redirect
});
```

**Impact:** 
- Apple Pay, Google Pay, and Klarna require redirect_to_url for authentication
- When `requires_action` or `requires_customer_action` status occurs, payment fails silently
- No proper error handling for SCA/3D Secure flows

#### Issue C: Proper Implementation Pattern Missing
The `handlePayment()` function (lines 82-102) correctly uses `confirmPayment()` with redirect, but wallet payments bypass this logic.

**Current flow (BROKEN):**
```
PaymentRequest → paymentmethod event → confirmCardPayment() → Fails without return_url
```

**Should be:**
```
PaymentRequest → paymentmethod event → API call to confirm with return_url → Redirect if needed
```

---

### 2. Payment Intent Creation Issues (`src/app/api/stripe/create-payment-intent/route.ts`)

**Current Implementation:**
```ts
const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "gbp",
    customer: customerId ?? undefined,
    automatic_payment_methods: { enabled: true },
    setup_future_usage: customerId ? "off_session" : undefined,
    metadata: { orderId: "pending", createdBy: userId ? `user_${userId}` : "guest" }
});
```

**Missing Configurations:**
1. **No `confirm: true`** - required to auto-confirm with PaymentMethod
2. **No `return_url`** - CRITICAL for wallet redirects
3. **No `payment_method_types`** - should explicitly list: `card, apple_pay, google_pay`
4. **No `description`** - helpful for payment reconciliation

**Fixed Implementation Should Be:**
```ts
const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "gbp",
    customer: customerId ?? undefined,
    
    // ✅ FIX 1: Explicit payment method types
    payment_method_types: ["card", "apple_pay", "google_pay"],
    
    // ✅ FIX 2: Return URL for wallet redirects
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?success=true`,
    
    // ✅ FIX 3: Proper metadata
    metadata: {
        orderId: "pending",
        createdBy: userId ? `user_${userId}` : "guest",
        paymentType: "checkout"
    },
    
    description: `Order checkout - ${customerId ? "registered" : "guest"} customer`,
    setup_future_usage: customerId ? "off_session" : undefined,
    automatic_payment_methods: { enabled: true }
});
```

---

### 3. Checkout Page Issues (`src/app/(site)/checkout/page.tsx`)

#### Issue A: No Return URL Handler
```tsx
// ❌ Missing: useEffect to handle ?success=true or payment_intent=pi_xxx from redirect
useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const piId = searchParams.get('payment_intent');
    const success = searchParams.get('success');
    
    // Should retrieve PaymentIntent status and call handleStripeSuccess()
}, []);
```

#### Issue B: Wallet Redirect Not Handled
When Apple Pay/Google Pay redirects back, the page doesn't know to check payment status.

---

### 4. Stripe Service Issues (`src/lib/services/front-end/stripeService.ts`)

**Current:**
```ts
async createPaymentIntent(token: string | null, amount: number) {
    // Returns only: { clientSecret, customerEnabled }
}
```

**Missing:**
- No field for `return_url` being sent from frontend
- No method to retrieve PaymentIntent status after redirect
- No confirmation method for wallet payments from server-side

---

## Root Cause Summary

| Issue | Impact | Severity |
|---|---|---|
| No return_url in PaymentIntent | Wallet payments can't redirect after 3D Secure | 🔴 CRITICAL |
| Deprecated confirmCardPayment() | Unpredictable behavior with newer Stripe versions | 🔴 CRITICAL |
| Missing _commonOptions.clientSecret access | clientSecret not passed to confirmation | 🟠 HIGH |
| No redirect=always in confirmPayment | 3D Secure won't trigger | 🟠 HIGH |
| Missing return URL handler on checkout page | Can't complete payment after redirect | 🔴 CRITICAL |
| No payment_method_types specified | Automatic methods may not enable wallet pays | 🟡 MEDIUM |

---

## Recommended Fixes (Priority Order)

### Fix 1: Update `create-payment-intent/route.ts` (CRITICAL)
- Add `return_url` pointing to checkout success page
- Add explicit `payment_method_types`
- Update metadata

### Fix 2: Replace StripeCardForm PaymentRequest Handler (CRITICAL)
- Replace `confirmCardPayment()` with server-side confirmation
- Use proper way to access clientSecret
- Send payment method to server with return_url

### Fix 3: Add Return URL Handler in Checkout Page (CRITICAL)
- Detect redirect from wallet payment
- Retrieve PaymentIntent status
- Call handleStripeSuccess() if payment succeeded

### Fix 4: Create Confirm Payment Endpoint (HIGH)
- New API route: `/api/stripe/confirm-payment`
- Accepts: paymentIntentId, paymentMethodId, return_url
- Confirms payment and returns status

### Fix 5: Update Stripe Service (HIGH)
- Add `retrievePaymentIntent()` method
- Add `confirmWithWallet()` method
- Pass return_url from frontend

### Fix 6: Error Handling & Logging (MEDIUM)
- Catch and log wallet payment errors
- Display proper error messages to user
- Track failed wallet payment attempts

---

## Implementation Steps

### Step 1: Environment Setup
```env
# .env.local
NEXT_PUBLIC_APP_URL=https://yourdomain.com  # For return_url
STRIPE_RETURN_URL_CHECKOUT=https://yourdomain.com/checkout?success=true
```

### Step 2: Create Confirm Payment API
See separate implementation guide

### Step 3: Update Payment Intent Creation
Update route.ts with return_url configuration

### Step 4: Fix StripeCardForm
Replace PaymentRequest handler with proper wallet support

### Step 5: Add Checkout Page Redirect Handler
Handle wallet payment redirects

### Step 6: Test Workflow
- Test card (should still work)
- Test Apple Pay (if on iOS/Mac)
- Test Google Pay (Android/Chrome)
- Test 3D Secure flows
- Test cancellation scenarios

---

## Testing Checklist

- [ ] Card payment works (direct confirmation)
- [ ] Card with 3D Secure works (redirect & back)
- [ ] Apple Pay completes checkout
- [ ] Google Pay completes checkout
- [ ] Klarna/other wallets (if enabled) work
- [ ] Error page shows for declined wallet payments
- [ ] Return URL doesn't expose sensitive data
- [ ] Payment intent status correctly retrieved after redirect
- [ ] Order created after successful wallet payment
- [ ] Guest checkout works with wallets
- [ ] Logged-in checkout works with wallets

---

## Files Affected
1. `src/components/StripeCardForm.tsx` - Major rewrite needed
2. `src/app/api/stripe/create-payment-intent/route.ts` - Add return_url
3. `src/app/(site)/checkout/page.tsx` - Add redirect handler
4. `src/lib/services/front-end/stripeService.ts` - Add methods
5. `src/app/api/stripe/confirm-payment/route.ts` - NEW file

---

## Additional Notes

- PayPal integration works independently and is not affected
- This issue only affects Stripe-based wallet payments
- The solution aligns with Stripe best practices for hosted payment flows
- Consider implementing Stripe Hosted Checkout (Payment Links) as long-term solution
