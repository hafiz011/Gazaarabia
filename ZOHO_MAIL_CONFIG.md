# Zoho Mail Configuration ✅

## Current Setup

✅ **SMTP Host:** `smtp.zoho.com`  
✅ **SMTP Port:** `587` (TLS)  
✅ **From Email:** `info@gazaarabia.com`  
✅ **Admin Email:** `hrhafij8@gmail.com`  

## emailHelper.ts Updated

The transporter has been updated from Gmail to Zoho Mail:

```typescript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.zoho.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,  // TLS on port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
```

## Verify Configuration

### Step 1: Check Environment Variables
Your `.env` file must have:
```
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=info@gazaarabia.com
SMTP_PASS=your-zoho-app-password
ADMIN_EMAIL=devsoftware603@gmail.com
```

### Step 2: Get App Password from Zoho Mail
1. Log in to **Zoho Mail** (mail.zoho.com)
2. Go to **Settings** → **Security** → **App Passwords**
3. Generate a new app password for "Nodemailer" or "Custom App"
4. Use this password in `SMTP_PASS` (NOT your account password)

### Step 3: Test Connection
```bash
node test-zoho-mail.js
```

**Expected output:**
```
✅ Zoho Mail connection successful!
📧 Ready to send emails:
   From: info@gazaarabia.com
   SMTP: smtp.zoho.com:587
✨ All email flows can now use Zoho Mail
```

### Step 4: Test Send Email
```bash
npm run dev
```

Then call:
```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your-test@email.com","subject":"Test","html":"<p>Test</p>"}'
```

## Common Issues

### ❌ "Invalid credentials"
- [ ] Used account password instead of app password?
- [ ] Check Zoho Mail → Settings → Security → App Passwords
- [ ] Generate new app password if expired

### ❌ "Connection refused on port 587"
- [ ] SMTP_PORT is 587 (not 465, 25, or 993)
- [ ] SMTP_HOST is `smtp.zoho.com` (not mail.zoho.com)
- [ ] Your firewall/ISP allows port 587 outbound

### ❌ "Email sent but not received"
- [ ] Check SMTP_USER (from address)
- [ ] Verify SPF/DKIM records in Zoho Mail settings
- [ ] Check spam folder
- [ ] Review Zoho Mail activity log

## Email Sending Flow

All 48 emails now use Zoho Mail:

1. **User triggers event** (signup, order, etc.)
2. **API calls email function** (e.g., `sendWelcomeEmail1()`)
3. **Function uses transporter** to send via Zoho SMTP
4. **Log created** in `notifications` table (audit trail)
5. **Zoho Mail** queues and delivers the email

```typescript
// Example: Newsletter signup
await sendWelcomeEmail1({
  to: user.email,
  name: user.name,
  userId: user.id,
});
```

## Security Notes

✅ **Never commit** `.env` with real credentials  
✅ **Use environment variables** in production  
✅ **App passwords** are safer than account passwords  
✅ **TLS (port 587)** is more secure than plain text (port 25)  
✅ All emails logged in `notifications` table for compliance

## Production Deployment

Before deploying to production:

1. [ ] Verify all env vars are set on production server
2. [ ] Test email sending in staging environment
3. [ ] Set up email templates in Zoho Mail (optional, for branded headers)
4. [ ] Configure SPF/DKIM records for your domain
5. [ ] Monitor deliverability in Zoho Mail dashboard
6. [ ] Set up bounce/complaint handling (optional)

---

**Status:** ✅ **Zoho Mail configured and ready to use**

All 14 email flows (48 emails) can now send through Zoho Mail.
