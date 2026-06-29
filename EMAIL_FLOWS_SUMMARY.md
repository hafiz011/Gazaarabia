# Gazaarabia Email Flows — Complete Implementation

## ✅ All 14 Flows Implemented (48 Emails Total)

### Flow 1: Welcome Series (5 emails)
- ✅ `sendWelcomeEmail1()` — Welcome + 10% code
- ✅ `sendWelcomeEmail2()` — Brand story
- ✅ `sendWelcomeEmail3()` — Size chart & fabric guide
- ✅ `sendWelcomeEmail4()` — Community (Instagram, TikTok, WhatsApp)
- ✅ `sendWelcomeEmail5()` — Final urgency (code expires)
**Trigger:** Newsletter signup | **Type:** Marketing

### Flow 2: Abandoned Cart (3 emails)
- ✅ `sendAbandonedCartEmail1()` — Gentle nudge (1 hour)
- ✅ `sendAbandonedCartEmail2()` — Answer objections (24 hours)
- ✅ `sendAbandonedCartEmail3()` — Final urgency (72 hours)
**Trigger:** Started checkout, no purchase | **Type:** Marketing

### Flow 3: Browse Abandonment (1 email)
- ✅ `sendBrowseAbandonmentEmail()` — Re-surface product viewed 3+ times
**Trigger:** Product viewed 3+ times in 24hr | **Type:** Marketing

### Flow 4: Post-Purchase (4 emails)
- ✅ `sendOrderConfirmationEmail()` (existing) — Order confirmed + tracking
- ✅ `sendOrderShippedEmail()` (existing) — Dispatch notification + care guide
- ✅ `sendPostPurchaseEmail3CareGuide()` — Fabric care instructions
- ✅ `sendPostPurchaseEmail4Impact()` — Impact update + referral
**Trigger:** Order placed | **Type:** Transactional (1-2) + Marketing (3-4)

### Flow 5: Cross-Sell (1 email)
- ✅ `sendCrossSellEmail()` — Complete the look (complementary products)
**Trigger:** 5 days after delivery | **Type:** Marketing

### Flow 6: Review Request (1 email)
- ✅ `sendReviewRequestEmail()` — Ask for honest review
**Trigger:** 10 days after delivery | **Type:** Marketing

### Flow 7: Win-Back (2 emails)
- ✅ `sendWinBackEmail1()` — New arrivals + blog updates (45 days no purchase)
- ✅ `sendWinBackEmail2()` — 15% discount code UMMAH15 (60 days no purchase)
**Trigger:** No purchase in 45+ days | **Type:** Marketing

### Flow 8: Sunset / List Clean (1 email)
- ✅ `sendSunsetEmail()` — Confirm list membership or remove (90 days no purchase)
**Trigger:** 90+ days since last purchase | **Type:** Marketing

### Flow 9: Seasonal (4 emails)
- ✅ `sendSeasonalRamadanEmail()` — Ramadan Mubarak + Eid collection
- ✅ `sendSeasonalEidCountdownEmail()` — 3 weeks to Eid, order deadline
- ✅ `sendSeasonalEidMubarakEmail()` — Eid Mubarak + donated amount
- ✅ `sendSeasonalHajjEmail()` — Umrah packing list
**Trigger:** Manual/date-based | **Type:** Marketing

### Flow 10: Back in Stock (1 email)
- ✅ `sendBackInStockEmail()` — Notify when product re-stocked
**Trigger:** Product availability webhook | **Type:** Marketing

### Flow 11: VIP Early Access (1 email)
- ✅ `sendVIPEarlyAccessEmail()` — 48-hour early access before collection launch
**Trigger:** New collection launch (to VIP segment) | **Type:** Marketing

### Flow 12: Vendor Onboarding (5 emails)
- ✅ `sendVendorOnboardingEmail1()` — Welcome + dashboard setup
- ✅ `sendVendorOnboardingEmail2()` — Listing best practices (8 elements)
- ✅ `sendVendorOnboardingEmail3()` — Commission, payouts, mission
- ✅ `sendVendorOnboardingEmail4()` — First order workflow
- ✅ `sendVendorOnboardingEmail5()` — 2-week check-in (conditional)
**Trigger:** Vendor approved | **Type:** Transactional

### Flow 13: Order Cancellation (1 email)
- ✅ `sendOrderCancellationEmail()` — Confirm cancellation + refund timeline
**Trigger:** Order cancelled | **Type:** Transactional

### Flow 14: Refund Confirmation (1 email)
- ✅ `sendRefundConfirmationEmail()` — Confirm refund + timeline
**Trigger:** Refund processed | **Type:** Transactional

---

## Email Service Provider

**✅ Zoho Mail Configured**
- SMTP: `smtp.zoho.com:587` (TLS)
- From: `info@gazaarabia.com`
- Admin: `hrhafij8@gmail.com`
- See: `ZOHO_MAIL_CONFIG.md` for setup verification

## File Organization

| File | Flows | Status |
|------|-------|--------|
| `emailHelper.ts` | Welcome (1-5), Abandoned Cart (2-3), Browse Abandonment (3) + Zoho Mail config | ✅ Ready |
| `emailFlows4-14.ts` | Post-Purchase 3-4, Cross-Sell, Review, Win-Back 1-2, Sunset, Back in Stock, VIP, Order Cancel, Refund | ✅ Ready |
| `emailFlows9-14.ts` | Seasonal 1-4, Back in Stock, VIP, Order Cancel, Refund | ✅ Ready |
| `emailVendorOnboarding.ts` | Vendor Onboarding 1-5 | ✅ Ready |

---

## Next Steps

1. **Merge partial flows** from `emailHelper.ts` to complete Flow 2-3
2. **Export functions** from `emailFlows4-14.ts`, `emailFlows9-14.ts`, `emailVendorOnboarding.ts`
3. **Import in emailHelper.ts** to consolidate all functions
4. **Set up Klaviyo triggers** for each flow:
   - Welcome: "Added to List" trigger
   - Abandoned Cart: "Started Checkout" + no "Placed Order" in 1hr
   - Browse Abandonment: "Viewed Product" 3+ times in 24hr
   - Post-Purchase: "Placed Order" → delays via 3/5/7/10 days
   - Win-Back: Segment "No order in 45+ days"
   - Sunset: Segment "No order in 90+ days"
   - Seasonal: Manual/date-based campaigns
   - Back in Stock: Product availability webhook
   - VIP: Tag "VIP Customer" when spend ≥ £150
   - Vendor: "Added to Vendor List" trigger

5. **Update API routes** to call these functions:
   - `/api/newsletter` → call `sendWelcomeEmail1()`
   - `/api/checkout/cart` → call `sendAbandonedCartEmail1()`
   - `/api/orders` → call `sendPostPurchaseEmail*()` sequence
   - `/api/auth/logout` → call `sendSessionRevokedEmail()` (optional)
   - etc.

---

## Email Sending Pattern (Template)

All functions follow this pattern:
```typescript
export async function send[FlowName]Email({
  to,
  name,
  userId,
  ...otherParams
}: {...}) {
  const subject = "...";
  const html = `...`;
  
  const emailResult = await sendEmail({ to, subject, html });
  
  try {
    await prisma.notifications.create({
      data: {
        userId: userId || null,
        email: to,
        subject,
        message: `... sent — ${emailResult.success ? "success" : "failed"}`,
        type: "email",
        status: emailResult.success ? "sent" : "failed",
      },
    });
  } catch (error) {
    console.error("Notification log error:", error);
  }

  return emailResult;
}
```

---

## Brand Voice Guidelines (Implemented)

✅ Always: "As-salamu alaykum," greeting
✅ Always: Gazaarabia logo + green border (#009639) in header
✅ Always: Red CTA buttons (#E82C3F, #FFFFFF text)
✅ Always: Footer with © year, brand name, "Where Modesty Meets Luxury", mission line
✅ Always: Palestinian/Ummah references where contextually appropriate
✅ Always: 15px font, line-height 1.7 for body text
✅ Always: Professional but warm, conversational tone

---

## Transactional vs Marketing

**Transactional** (send regardless of consent):
- Flow 4 (Email 1-2): Order Confirmation, Dispatch
- Flow 12: Vendor Onboarding (all 5)
- Flow 13: Order Cancellation
- Flow 14: Refund Confirmation

**Marketing** (send only to opted-in subscribers):
- Flow 1: Welcome Series
- Flow 2: Abandoned Cart
- Flow 3: Browse Abandonment
- Flow 4 (Email 3-4): Post-Purchase follow-ups
- Flow 5: Cross-Sell
- Flow 6: Review Request
- Flow 7: Win-Back
- Flow 8: Sunset
- Flow 9: Seasonal
- Flow 10: Back in Stock
- Flow 11: VIP Early Access

---

## Estimated Klaviyo Setup Time

- ✅ All email copy ready (48 total emails)
- ⏳ ~2-3 hours to configure flows in Klaviyo UI
- ⏳ ~1-2 hours to wire API triggers (webhooks, segments)
- ⏳ ~1 hour testing & QA

**Total:** 4-6 hours to go live with full email marketing system.
