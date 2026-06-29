# Security Fixes Verification Guide

## Overview
This guide provides step-by-step instructions to verify the three critical security fixes have been properly implemented.

---

## Fix 1: JWT Expiration (1 hour) & Refresh Token System

### What Was Fixed
- ✅ Reduced JWT access token expiration from **7 days** to **1 hour**
- ✅ Implemented refresh token system (7-day validity)
- ✅ New endpoint: `POST /api/auth/refresh-token`

### How to Verify

#### Step 1: Login and Check Token Expiration
```bash
curl -X POST http://localhost:3000/api/front-end/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123",
    "role": "admin"
  }'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "user": {...},
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Step 2: Decode Token to Verify 1-Hour Expiration
Use [jwt.io](https://jwt.io) to decode the `accessToken`:
- Look for `exp` claim
- Calculate: `(exp - iat)` should be approximately **3600 seconds (1 hour)**

**Expected:**
- `iat`: Current timestamp (e.g., 1719698400)
- `exp`: `iat + 3600` (e.g., 1719702000)

#### Step 3: Test Refresh Token Endpoint
```bash
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

**Expected Response:**
```json
{
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

**Verification:**
- ✅ Refresh returns a new access token
- ✅ New token is different from the original
- ✅ New token also has 1-hour expiration

---

## Fix 2: Bank Details Exposure Prevention

### What Was Fixed
- ✅ Removed sensitive bank details from admin affiliate list
- ✅ Created separate personal endpoint for bank details access
- ✅ Restricted access: Only affiliates can see their own details

### How to Verify

#### Step 1: Verify Bank Details NOT in Admin List
```bash
curl -X GET http://localhost:3000/api/affiliates \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (excerpt):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": {
        "id": 2,
        "name": "John Doe",
        "email": "affiliate@example.com",
        "phone": null
      },
      "totalEarnings": 1500,
      "pendingEarnings": 300
      // ❌ NO bankAccount field should be present
      // ❌ NO accountNumber, sortCode, iban, paypalEmail
    }
  ]
}
```

**Verification:**
- ✅ Response does NOT contain `bankAccount`
- ✅ Response does NOT contain `accountNumber`
- ✅ Response does NOT contain `sortCode`
- ✅ Response does NOT contain `iban`

#### Step 2: Verify Admin Blocked from Personal Endpoint
```bash
curl -X GET http://localhost:3000/api/affiliates/me/bank-details \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "message": "Forbidden"
}
```

**Expected HTTP Status:** `403`

#### Step 3: Verify Affiliate Can Access Own Details
```bash
# Login as affiliate
curl -X POST http://localhost:3000/api/front-end/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "affiliate@example.com",
    "password": "password123",
    "role": "affiliate"
  }'

# Use the returned accessToken to access personal bank details
curl -X GET http://localhost:3000/api/affiliates/me/bank-details \
  -H "Authorization: Bearer YOUR_AFFILIATE_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "bankAccount": {
      "accountName": "John Doe",
      "accountNumber": "12345678",
      "sortCode": "12-34-56",
      "iban": "GB82WEST12345698765432",
      "paypalEmail": "john@example.com"
    }
  }
}
```

**Verification:**
- ✅ Affiliate can see their own bank details
- ✅ All sensitive fields are present for affiliate
- ✅ HTTP Status: `200`

---

## Fix 3: Stock Race Condition Prevention

### What Was Fixed
- ✅ Added atomic transaction-based stock validation
- ✅ Prevents overselling under concurrent requests
- ✅ Stock checked immediately before order creation
- ✅ Applied to both authenticated (`/api/front-end/orders`) and guest checkout

### How to Verify

#### Step 1: Verify Stock Validation Error Message
```bash
# Attempt to order more items than available stock
curl -X POST http://localhost:3000/api/front-end/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment": {
      "totalAmount": 999999,
      "itemsTotal": 999999,
      "subtotal": 999999,
      "paymentMethod": "stripe",
      "paymentStatus": "paid"
    },
    "address": {"id": 1},
    "orderItems": [
      {
        "productId": 1,
        "variantId": 1,
        "quantity": 999999,
        "price": 1,
        "subtotal": 999999
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Insufficient stock for variant 1. Available: X, Requested: 999999"
}
```

**Expected HTTP Status:** `400`

**Verification:**
- ✅ Stock validation prevents order creation
- ✅ Detailed error message about insufficient stock
- ✅ Returns 400 Bad Request

#### Step 2: Verify Concurrent Order Protection (Advanced)
Run this script to simulate concurrent orders (requires `ab` tool):

```bash
# First, create a test order JSON
cat > /tmp/order.json << 'EOF'
{
  "payment": {
    "totalAmount": 100,
    "itemsTotal": 100,
    "subtotal": 100,
    "paymentMethod": "stripe",
    "paymentStatus": "paid"
  },
  "address": {"id": 1},
  "orderItems": [
    {"productId": 1, "variantId": 1, "quantity": 1, "price": 100, "subtotal": 100}
  ]
}
EOF

# Send 10 concurrent requests
ab -n 10 -c 10 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -p /tmp/order.json \
  http://localhost:3000/api/front-end/orders
```

**Verification:**
- ✅ Not all requests succeed (some should fail with 400 if stock is limited)
- ✅ Total orders created ≤ actual stock available
- ✅ No overselling occurs

#### Step 3: Test Guest Checkout Stock Validation
```bash
curl -X POST http://localhost:3000/api/front-end/guest-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "address": {
      "email": "guest@example.com",
      "firstName": "Guest",
      "address1": "123 Main St",
      "city": "London",
      "country": "GB",
      "postalCode": "SW1A 1AA",
      "phone": "02012345678"
    },
    "payment": {
      "totalAmount": 999999,
      "itemsTotal": 999999,
      "subtotal": 999999,
      "paymentMethod": "stripe",
      "paymentStatus": "paid"
    },
    "orderItems": [
      {
        "productId": 1,
        "variantId": 1,
        "quantity": 999999,
        "price": 1,
        "subtotal": 999999
      }
    ]
  }'
```

**Expected Response:** Same as authenticated checkout - stock validation error

**Verification:**
- ✅ Guest checkout also validates stock
- ✅ Cannot create orders with insufficient stock

---

## Test Checklist

### Security Fix 1: JWT Expiration ✅
- [ ] Login returns both `accessToken` and `refreshToken`
- [ ] Token expiration is 3600 seconds (1 hour)
- [ ] Refresh endpoint successfully issues new token
- [ ] Old token cannot be used after 1 hour

### Security Fix 2: Bank Details ✅
- [ ] Admin list does NOT include `bankAccount` field
- [ ] Admin list does NOT include `accountNumber`, `sortCode`, `iban`
- [ ] Admin cannot access `/api/affiliates/me/bank-details` (403 error)
- [ ] Affiliate can access `/api/affiliates/me/bank-details` (200 success)
- [ ] Affiliate sees full bank details in personal endpoint

### Security Fix 3: Stock Validation ✅
- [ ] Order with excessive quantity is rejected (400 error)
- [ ] Error message mentions "Insufficient stock"
- [ ] Concurrent orders don't exceed available stock
- [ ] Guest checkout also validates stock
- [ ] Stock validation works in both authenticated and guest flows

---

## Files Modified

### 1. JWT & Refresh Token
- `src/app/api/front-end/login/route.ts` - Reduced expiration to 1h, added refresh token
- `src/app/api/auth/refresh-token/route.ts` - New refresh endpoint
- `prisma/schema.prisma` - Added RefreshToken model

### 2. Bank Details
- `src/app/api/affiliates/route.ts` - Removed bank details from response
- `src/app/api/affiliates/me/bank-details/route.ts` - New personal endpoint

### 3. Stock Validation
- `src/lib/helpers/validateAndReserveStock.ts` - Stock validation helper
- `src/app/api/front-end/orders/route.ts` - Added stock validation
- `src/app/api/front-end/guest-checkout/route.ts` - Added stock validation

---

## Troubleshooting

### Issue: Refresh token endpoint returns 404
**Solution:** Ensure Prisma client is regenerated:
```bash
npx prisma generate
```

### Issue: Bank details still visible in admin list
**Solution:** Verify the edit was applied correctly:
```bash
grep "bankAccount" src/app/api/affiliates/route.ts
# Should NOT find a match in the GET method
```

### Issue: Stock validation doesn't prevent overselling
**Solution:** Check that validateStockInTransaction import is present:
```bash
grep "validateStockInTransaction" src/app/api/front-end/orders/route.ts
grep "validateStockInTransaction" src/app/api/front-end/guest-checkout/route.ts
```

---

## Security Summary

| Fix | Before | After | Status |
|-----|--------|-------|--------|
| JWT Expiration | 7 days | 1 hour | ✅ Fixed |
| Refresh Token | None | 7 days | ✅ Added |
| Bank Details Leak | Exposed to admins | Personal endpoint only | ✅ Fixed |
| Stock Race Condition | No protection | Atomic validation | ✅ Fixed |

All three critical security vulnerabilities have been remediated.
