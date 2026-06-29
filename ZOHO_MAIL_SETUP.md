# Zoho Mail Setup & Troubleshooting

**Current Status:** ❌ Authentication Failed (535)

---

## Problem

```
❌ Connection failed:
   Invalid login: 535 Authentication Failed
```

**Cause:** The `SMTP_PASS` in `.env` is incorrect.

---

## Solution: Get Correct App Password

### Step 1: Log into Zoho Mail
1. Go to **mail.zoho.com**
2. Log in with `info@gazaarabia.com`
3. Enter your Zoho Mail password

### Step 2: Navigate to Security Settings
1. Click your **Profile** (top right)
2. Click **Settings**
3. Go to **Security**
4. Look for **"App Passwords"** or **"Generate App Password"**

### Step 3: Create/Get App Password
1. If you see existing app passwords, look for one named "Nodemailer" or "Custom App"
2. If not found, click **"Generate New App Password"**
   - App name: `Nodemailer` or `Gazaarabia Email`
   - Device: Select your app/service
3. **Copy the generated password** (NOT your account password)

### Step 4: Update .env
Replace the current `SMTP_PASS` with the app password you copied:

```
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=info@gazaarabia.com
SMTP_PASS=your-zoho-app-password-here
ADMIN_EMAIL=hrhafij8@gmail.com
```

**⚠️ Important:** This must be the **APP PASSWORD**, not your Zoho Mail account password.

### Step 5: Test Connection
```bash
node test-zoho-mail.js
```

Expected success output:
```
✅ Zoho Mail connection successful!
📧 Ready to send emails: From: info@gazaarabia.com
✨ All email flows can now use Zoho Mail
```

---

## Common Issues & Fixes

### ❌ "Invalid login: 535 Authentication Failed"
**Cause:** Wrong password  
**Fix:** 
- Use Zoho **app password**, not account password
- Regenerate app password in Security settings
- Verify no extra spaces in password

### ❌ "Connection timeout"
**Cause:** Wrong SMTP server or port  
**Fix:**
- SMTP_HOST must be: `smtp.zoho.com` (not mail.zoho.com)
- SMTP_PORT must be: `587` (not 465, 25, or 993)

### ❌ "535 Incorrect authentication data"
**Cause:** App password expired or revoked  
**Fix:**
- Generate a new app password
- Delete old app passwords if more than 10 exist
- Check if 2FA is enabled (may affect app passwords)

### ❌ "Connection refused port 587"
**Cause:** Firewall/ISP blocking SMTP port  
**Fix:**
- Try port 465 (SSL) or 25 (plain text) if 587 fails
- Contact your ISP or network admin
- Test connection from different network

### ❌ "Emails sent but not received"
**Cause:** SPF/DKIM not configured  
**Fix:**
- Set up SPF record: `v=spf1 include:zoho.com ~all`
- Set up DKIM in Zoho Mail settings
- Wait 24-48 hours for DNS propagation
- Check recipient spam folder

---

## Zoho Mail Best Practices

1. **Security:**
   - Never share app password
   - Regenerate app password annually
   - Use different app password per service (not one for all)

2. **Deliverability:**
   - Set up SPF/DKIM records
   - Add "Reply-To" header to emails
   - Keep bounce rate below 1%

3. **Monitoring:**
   - Check "Sent" folder regularly
   - Monitor delivery reports
   - Track bounce/complaint rates

4. **Compliance:**
   - Implement unsubscribe links (already in Gazaarabia emails)
   - Include physical address (already in footer)
   - Honor unsubscribe requests within 10 days

---

## Verify Setup is Complete

After updating `.env` and testing connection:

✅ Run connection test:
```bash
node test-zoho-mail.js
```

✅ Should see:
```
✅ Zoho Mail connection successful!
📧 Ready to send emails
✨ All email flows can now use Zoho Mail
```

✅ Then run full test suite:
```bash
bash test-email-system.sh
```

✅ Verify emails in Zoho Mail "Sent" folder

---

## Support

**Zoho Mail Help:**
- https://help.zoho.com/portal/en/community/topic/app-passwords

**SMTP Configuration:**
- https://www.zoho.com/mail/help/zoho-mail-smtp.html

**Common SMTP Errors:**
- 535 = Authentication failure
- 554 = Email rejected
- 552 = Too many recipients
- 551 = Invalid sender

---

## Next Steps

1. Get correct app password from Zoho Mail
2. Update `.env` with app password
3. Run `node test-zoho-mail.js` to verify
4. Run `bash test-email-system.sh` to test all 7 emails
5. Check Zoho Mail "Sent" folder for emails
6. Deploy to production when verified ✅
