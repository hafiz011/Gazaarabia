# Email Technical Workflow — How Actions Trigger Emails

## Flow 1: User Signup → Welcome Email

### Action
User submits signup form at `/api/front-end/signup`

### Code Flow
```
1. POST /api/front-end/signup
   ├─ Validate email/password
   ├─ Hash password with bcrypt
   ├─ Create user in database
   ├─ Create affiliate record (auto-subscribe)
   ├─ Create subscriber record
   └─ SEND EMAIL: sendWelcomeEmail1()

2. sendWelcomeEmail1()
   ├─ Build email HTML (branded template)
   ├─ Create Zoho SMTP connection
   ├─ Send via transporter.sendMail()
   ├─ Log to notifications table
   └─ Return {success: true/false}

3. Response to client
   └─ Return user object + success message
```

### Database Changes
```sql
-- Users table
INSERT INTO users (email, password, name, phone, roleId, createdAt)
VALUES ('user@example.com', 'hashed_password', 'Ahmed', '07123456789', 3, NOW());

-- Affiliate table (auto-created for non-sellers)
INSERT INTO affiliate (userId, baseCommission, shareCommission, isActive, referralCode)
VALUES (123, 10, 7, true, 'REF_ABC123');

-- Subscriber table (auto-subscribed)
INSERT INTO subscriber (email, name, phone, isActive, createdAt)
VALUES ('user@example.com', 'Ahmed', '07123456789', true, NOW());

-- Notifications table (email log)
INSERT INTO notifications 
(userId, email, subject, message, type, status, createdAt)
VALUES (123, 'user@example.com', 'Welcome — your 10% code is inside 🇵🇸', 
  'Welcome email 1/5 sent to user@example.com — success', 
  'email', 'sent', NOW());
```

### Email Details
- **To:** user@example.com
- **Subject:** Welcome — your 10% code is inside 🇵🇸
- **Content:** 
  - Greeting with name
  - 10% discount code (WELCOME10)
  - Brand mission statement
  - Call to action to shop
- **Delay:** 0 seconds (immediate)
- **Retry:** If fails, logged as 'failed' in notifications table

---

## Flow 2: Order Placed → Order Confirmation Email

### Action
Customer places order via `/api/front-end/orders`

### Code Flow
```
1. POST /api/front-end/orders
   ├─ Authenticate user (JWT token)
   ├─ Validate payment details
   ├─ Validate stock (atomic transaction)
   ├─ Fetch user with email
   ├─ Generate invoice PDF
   ├─ Create order in database
   ├─ Create order items
   └─ SEND EMAIL: sendOrderConfirmationEmail()

2. sendOrderConfirmationEmail(email, {
     name: 'Ahmed',
     orderId: 456,
     total: 99.99,
     invoiceNumber: 'INV-001',
     invoiceUrl: '/invoices/456.pdf',
     address: '123 Test St, London',
     userId: 123,
     charityAmount: 5.00
   })
   ├─ Build HTML email template
   ├─ Include order summary table
   ├─ Include charity donation line item
   ├─ Generate invoice download link
   ├─ Send via Zoho SMTP
   ├─ Log to notifications
   └─ Return {success: true}

3. Response to client
   └─ Return order object + success message
```

### Database Changes
```sql
-- Orders table
INSERT INTO orders (userId, totalAmount, itemsTotal, subtotal, 
  paymentMethod, transactionId, status, deliveryAddress, createdAt)
VALUES (123, 99.99, 89.99, 84.99, 'card', 'txn_123abc', 'paid', 
  '123 Test St, London', NOW());

-- OrderItems table
INSERT INTO orderItem (orderId, variantId, quantity, price)
VALUES (456, 1, 1, 89.99);

-- Notifications table
INSERT INTO notifications 
(userId, email, subject, message, type, status, createdAt)
VALUES (123, 'user@example.com', 'Order confirmed ✅ — and it's already working',
  'Order #456 confirmation email sent successfully',
  'email', 'sent', NOW());
```

### Email Details
- **To:** user@example.com
- **Subject:** Order confirmed ✅ — and it's already working
- **Content:**
  - Order number & date
  - Product list with quantities & prices
  - Subtotal, tax, total
  - Charity donation amount
  - Delivery address
  - Estimated delivery (3-5 days)
  - Download invoice link
  - Mission statement
- **Delay:** 0 seconds (immediate)

---

## Flow 3: Admin Dispatches Order → Shipping Email

### Action
Admin updates order status to "dispatched" via `/api/orders/update`

### Code Flow
```
1. PATCH /api/orders/update
   ├─ Authenticate admin (Bearer token)
   ├─ Validate admin role
   ├─ Get order + user details
   ├─ Update order status to "dispatched"
   ├─ Store tracking number
   ├─ IF status == "dispatched"
   │  └─ SEND EMAIL: sendOrderShippedEmail()
   └─ Return updated order

2. sendOrderShippedEmail({
     to: 'user@example.com',
     name: 'Ahmed',
     userId: 123,
     trackingNumber: 'ABC123XYZ'
   })
   ├─ Build HTML with tracking info
   ├─ Include delivery timeline
   ├─ Include fabric care guide
   ├─ Send via Zoho SMTP
   ├─ Log to notifications
   └─ Return {success: true}

3. Response to admin
   └─ Return order with new status
```

### Database Changes
```sql
-- Orders table (update)
UPDATE orders 
SET status = 'dispatched', trackingNumber = 'ABC123XYZ', updatedAt = NOW()
WHERE id = 456;

-- Notifications table
INSERT INTO notifications 
(userId, email, subject, message, type, status, createdAt)
VALUES (123, 'user@example.com', 'Your order is on its way 🎁',
  'Order shipped notification sent to user@example.com — success',
  'email', 'sent', NOW());
```

### Email Details
- **To:** user@example.com
- **Subject:** Your order is on its way 🎁
- **Content:**
  - Tracking number in large font
  - Delivery timeline
  - Fabric care instructions
  - Support email
- **Delay:** 0 seconds (immediate upon admin update)
- **Triggered by:** Admin action, not automatic

---

## Flow 4: Admin Cancels Order → Cancellation Email

### Action
Admin cancels order via `/api/orders/cancel`

### Code Flow
```
1. POST /api/orders/cancel
   ├─ Authenticate admin
   ├─ Get order + user details
   ├─ Update order.status = "cancelled"
   └─ SEND EMAIL: sendOrderCancellationEmail()

2. sendOrderCancellationEmail({
     to: 'user@example.com',
     orderId: 456,
     reason: 'Out of stock',
     userId: 123
   })
   ├─ Include cancellation reason
   ├─ Explain refund timeline (5 working days)
   ├─ Provide support email
   ├─ Send via Zoho SMTP
   └─ Log to notifications

3. Response to admin
   └─ Return cancelled order
```

### Database Changes
```sql
-- Orders table
UPDATE orders 
SET status = 'cancelled', cancelledAt = NOW(), updatedAt = NOW()
WHERE id = 456;

-- Notifications table
INSERT INTO notifications 
(userId, email, subject, message, type, status, createdAt)
VALUES (123, 'user@example.com', 'Your order has been cancelled — #456',
  'Order cancellation email sent — success',
  'email', 'sent', NOW());
```

### Email Details
- **To:** user@example.com
- **Subject:** Your order has been cancelled — #456
- **Content:**
  - Cancellation confirmation
  - Reason provided
  - Refund timeline (5 working days)
  - Support contact
- **Delay:** 0 seconds (immediate)

---

## Flow 5: Admin Processes Refund → Refund Email

### Action
Admin processes refund via `/api/refunds/process`

### Code Flow
```
1. POST /api/refunds/process
   ├─ Authenticate admin
   ├─ Get order + user details
   ├─ Update order.status = "refunded"
   └─ SEND EMAIL: sendRefundConfirmationEmail()

2. sendRefundConfirmationEmail({
     to: 'user@example.com',
     orderId: 456,
     refundAmount: 99.99,
     paymentMethod: 'card',
     userId: 123
   })
   ├─ Show refund amount (£99.99)
   ├─ Show payment method
   ├─ Explain timeline (3-5 working days)
   ├─ Send via Zoho SMTP
   └─ Log to notifications

3. Response to admin
   └─ Return refunded order
```

### Database Changes
```sql
-- Orders table
UPDATE orders 
SET status = 'refunded', refundedAt = NOW(), updatedAt = NOW()
WHERE id = 456;

-- Notifications table
INSERT INTO notifications 
(userId, email, subject, message, type, status, createdAt)
VALUES (123, 'user@example.com', 'Your refund has been processed 🇵🇸',
  'Refund confirmation email sent — success',
  'email', 'sent', NOW());
```

### Email Details
- **To:** user@example.com
- **Subject:** Your refund has been processed 🇵🇸
- **Content:**
  - Refund amount (£99.99)
  - Payment method (card, PayPal, etc)
  - Timeline (3-5 working days)
  - What to do if delayed
- **Delay:** 0 seconds (immediate)

---

## Flow 6: Admin Approves Seller → Vendor Onboarding Email

### Action
Admin approves seller via `/api/seller/approve`

### Code Flow
```
1. POST /api/seller/approve
   ├─ Authenticate admin
   ├─ Get seller + user details
   ├─ Update seller.isApproved = true
   ├─ Store commission rate
   ├─ Store approval timestamp
   └─ SEND EMAIL: sendVendorOnboardingEmail1()

2. sendVendorOnboardingEmail1({
     to: 'seller@example.com',
     vendorName: 'Ahmed Store',
     commission: 15
   })
   ├─ Welcome message
   ├─ Dashboard login link
   ├─ Setup steps (3 steps)
   ├─ Commission percentage
   ├─ Payout schedule info
   ├─ Send via Zoho SMTP
   └─ Log to notifications

3. Response to admin
   └─ Return approved seller
```

### Database Changes
```sql
-- Seller table
UPDATE seller 
SET isApproved = true, commission = 15, approvedAt = NOW()
WHERE id = 5;

-- Notifications table
INSERT INTO notifications 
(email, subject, message, type, status, createdAt)
VALUES ('seller@example.com', 'Welcome to GAZAARABIA — your dashboard is ready',
  'Vendor onboarding 1/5 sent — success',
  'email', 'sent', NOW());
```

### Email Details
- **To:** seller@example.com
- **Subject:** Welcome to GAZAARABIA — your dashboard is ready
- **Content:**
  - Approval confirmation
  - Dashboard link
  - 3 setup steps
  - Commission rate (15%)
  - Payout schedule (monthly on 15th)
- **Delay:** 0 seconds (immediate)

---

## Flow 7: User Resets Password → Password Changed Email

### Action
User resets password via `/api/front-end/reset-password`

### Code Flow
```
1. POST /api/front-end/reset-password
   ├─ Validate reset token (not expired)
   ├─ Hash new password
   ├─ Update user.password
   ├─ Clear reset token
   └─ SEND EMAIL: sendPasswordChangedEmail()

2. sendPasswordChangedEmail({
     to: 'user@example.com',
     name: 'Ahmed',
     userId: 123
   })
   ├─ Confirm password change
   ├─ Security notice
   ├─ Link to reset again if unauthorized
   ├─ Send via Zoho SMTP
   └─ Log to notifications

3. Response to user
   └─ Return success message
```

### Database Changes
```sql
-- Users table
UPDATE users 
SET password = 'new_hashed_password', 
    resetToken = NULL, 
    resetTokenExpiry = NULL,
    updatedAt = NOW()
WHERE id = 123;

-- Notifications table
INSERT INTO notifications 
(userId, email, subject, message, type, status, createdAt)
VALUES (123, 'user@example.com', 'Your Password Has Been Updated — Gazaarabia',
  'Password changed email sent — success',
  'email', 'sent', NOW());
```

### Email Details
- **To:** user@example.com
- **Subject:** Your Password Has Been Updated — Gazaarabia
- **Content:**
  - Confirmation of change
  - "If you didn't do this, click here"
  - Security notice
- **Delay:** 0 seconds (immediate)

---

## Email Sending Process (Behind the Scenes)

### Step 1: Trigger Event
User/Admin action occurs → Email function called

### Step 2: Email Building
```javascript
const html = `<html>...email template...</html>`
const subject = "Email subject line"
```

### Step 3: Zoho SMTP Connection
```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 587,
  secure: false,
  auth: {
    user: "info@gazaarabia.com",
    pass: "app_password"
  }
})
```

### Step 4: Send Email
```javascript
await transporter.sendMail({
  from: '"Gazaarabia" <info@gazaarabia.com>',
  to: "user@example.com",
  subject: "Your order confirmed",
  html: "<html>...</html>"
})
```

### Step 5: Log to Database
```sql
INSERT INTO notifications (userId, email, subject, message, type, status)
VALUES (123, 'user@example.com', 'Order confirmed', '...message...', 'email', 'sent')
```

### Step 6: Return to Client
```json
{
  "success": true,
  "order": {...}
}
```

---

## Error Handling

### If Email Send Fails

```javascript
try {
  const result = await sendEmail({to, subject, html})
} catch (error) {
  // Log as 'failed' in notifications table
  status: 'failed',
  message: error.message
  // Continue order processing
  // Alert admin to manual send
}
```

### If Zoho Connection Fails
- Error: `535 Authentication Failed` → Wrong password
- Error: `Connection timeout` → Wrong host/port
- Error: `Network unreachable` → Firewall/ISP blocking

---

## Monitoring & Logging

### Check Email Status
```sql
SELECT * FROM notifications 
WHERE type = 'email' 
ORDER BY createdAt DESC 
LIMIT 10;
```

### Count Sent vs Failed
```sql
SELECT 
  status, 
  COUNT(*) as count
FROM notifications 
WHERE type = 'email'
GROUP BY status;
```

### Check Specific User's Emails
```sql
SELECT * FROM notifications 
WHERE userId = 123 AND type = 'email'
ORDER BY createdAt DESC;
```

---

## Summary: Email Actions & Triggers

| # | Action | Endpoint | Email | Immediate? | Logged? |
|---|--------|----------|-------|-----------|---------|
| 1 | User signup | `/api/front-end/signup` POST | Welcome | ✅ Yes | ✅ Yes |
| 2 | Order placed | `/api/front-end/orders` POST | Confirmation | ✅ Yes | ✅ Yes |
| 3 | Order dispatched | `/api/orders/update` PATCH | Shipping | ✅ Yes | ✅ Yes |
| 4 | Order cancelled | `/api/orders/cancel` POST | Cancellation | ✅ Yes | ✅ Yes |
| 5 | Refund processed | `/api/refunds/process` POST | Refund | ✅ Yes | ✅ Yes |
| 6 | Seller approved | `/api/seller/approve` POST | Onboarding | ✅ Yes | ✅ Yes |
| 7 | Password reset | `/api/front-end/reset-password` POST | Password | ✅ Yes | ✅ Yes |
