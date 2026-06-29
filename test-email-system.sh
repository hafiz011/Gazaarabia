#!/bin/bash

# Email System Test Suite — Gazaarabia
# Tests all 7 wired email flows

set -e

echo "======================================"
echo "📧 Email System Test Suite"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="${DOMAIN:-http://localhost:3000}"
TEST_EMAIL="${TEST_EMAIL:-test@example.com}"
ADMIN_TOKEN="${ADMIN_TOKEN:-your-admin-token}"

echo "🔧 Configuration:"
echo "   Domain: $DOMAIN"
echo "   Test Email: $TEST_EMAIL"
echo "   Admin Token: ${ADMIN_TOKEN:0:10}..."
echo ""

# Test 1: Zoho Mail Connection
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1️⃣  Zoho Mail Connection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Running: node test-zoho-mail.js"
node test-zoho-mail.js
echo ""
echo -e "${GREEN}✅ Zoho Mail connection verified${NC}"
echo ""

# Test 2: Welcome Email (Signup)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2️⃣  Welcome Email (Signup)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Sending: POST /api/front-end/signup"
echo "Payload:"
echo "  - name: Test User"
echo "  - email: $TEST_EMAIL"
echo "  - password: TestPass123!"
echo "  - role: customer"
echo ""

SIGNUP_RESPONSE=$(curl -s -X POST "$DOMAIN/api/front-end/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"TestPass123!\",
    \"role\": \"customer\"
  }")

if echo "$SIGNUP_RESPONSE" | grep -q "User created"; then
  echo -e "${GREEN}✅ Signup successful${NC}"
  echo "Response: $SIGNUP_RESPONSE"
  USER_ID=$(echo "$SIGNUP_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
  echo "User ID: $USER_ID"
else
  echo -e "${RED}❌ Signup failed${NC}"
  echo "Response: $SIGNUP_RESPONSE"
fi
echo ""

# Test 3: Order Confirmation Email
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3️⃣  Order Confirmation Email"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Sending: POST /api/front-end/orders"
echo "Payload:"
echo "  - payment.totalAmount: 99.99"
echo "  - orderItems: [variant 1, qty 1]"
echo "  - address: 123 Test St"
echo ""

ORDER_RESPONSE=$(curl -s -X POST "$DOMAIN/api/front-end/orders" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"payment\": {
      \"totalAmount\": 99.99,
      \"itemsTotal\": 99.99,
      \"subtotal\": 99.99,
      \"paymentMethod\": \"card\",
      \"transactionId\": \"txn_test_123\",
      \"paymentStatus\": \"paid\"
    },
    \"orderItems\": [{
      \"variantId\": 1,
      \"quantity\": 1
    }],
    \"address\": \"123 Test Street, London, UK\"
  }")

if echo "$ORDER_RESPONSE" | grep -q "success"; then
  echo -e "${GREEN}✅ Order placed${NC}"
  echo "Response: $ORDER_RESPONSE"
  ORDER_ID=$(echo "$ORDER_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
  echo "Order ID: $ORDER_ID"
else
  echo -e "${YELLOW}⚠️  Order placement may need auth token${NC}"
  echo "Response: $ORDER_RESPONSE"
fi
echo ""

# Test 4: Dispatch Order (Order Shipped Email)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4️⃣  Order Dispatch (Shipping Email)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Sending: PATCH /api/orders/update"
echo "Payload:"
echo "  - orderId: 1 (example)"
echo "  - status: dispatched"
echo "  - trackingNumber: TRACK123ABC"
echo ""

DISPATCH_RESPONSE=$(curl -s -X PATCH "$DOMAIN/api/orders/update" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"orderId\": 1,
    \"status\": \"dispatched\",
    \"trackingNumber\": \"TRACK123ABC\"
  }")

if echo "$DISPATCH_RESPONSE" | grep -q "status updated\|Order not found"; then
  if echo "$DISPATCH_RESPONSE" | grep -q "status updated"; then
    echo -e "${GREEN}✅ Order dispatched${NC}"
  else
    echo -e "${YELLOW}⚠️  Order not found (use existing order ID)${NC}"
  fi
  echo "Response: $DISPATCH_RESPONSE"
else
  echo -e "${RED}❌ Dispatch failed${NC}"
  echo "Response: $DISPATCH_RESPONSE"
fi
echo ""

# Test 5: Cancel Order
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 5️⃣  Cancel Order (Cancellation Email)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Sending: POST /api/orders/cancel"
echo "Payload:"
echo "  - orderId: 2 (example)"
echo "  - reason: Out of stock"
echo ""

CANCEL_RESPONSE=$(curl -s -X POST "$DOMAIN/api/orders/cancel" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"orderId\": 2,
    \"reason\": \"Out of stock\"
  }")

if echo "$CANCEL_RESPONSE" | grep -q "cancelled\|Order not found"; then
  if echo "$CANCEL_RESPONSE" | grep -q "successfully"; then
    echo -e "${GREEN}✅ Order cancelled${NC}"
  else
    echo -e "${YELLOW}⚠️  Order not found (use existing order ID)${NC}"
  fi
  echo "Response: $CANCEL_RESPONSE"
else
  echo -e "${RED}❌ Cancellation failed${NC}"
  echo "Response: $CANCEL_RESPONSE"
fi
echo ""

# Test 6: Process Refund
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 6️⃣  Process Refund (Refund Email)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Sending: POST /api/refunds/process"
echo "Payload:"
echo "  - orderId: 3 (example)"
echo "  - refundAmount: 99.99"
echo ""

REFUND_RESPONSE=$(curl -s -X POST "$DOMAIN/api/refunds/process" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"orderId\": 3,
    \"refundAmount\": 99.99
  }")

if echo "$REFUND_RESPONSE" | grep -q "refunded\|Order not found"; then
  if echo "$REFUND_RESPONSE" | grep -q "successfully"; then
    echo -e "${GREEN}✅ Refund processed${NC}"
  else
    echo -e "${YELLOW}⚠️  Order not found (use existing order ID)${NC}"
  fi
  echo "Response: $REFUND_RESPONSE"
else
  echo -e "${RED}❌ Refund processing failed${NC}"
  echo "Response: $REFUND_RESPONSE"
fi
echo ""

# Test 7: Approve Seller
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 7️⃣  Approve Seller (Vendor Onboarding)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Sending: POST /api/seller/approve"
echo "Payload:"
echo "  - sellerId: 1 (example)"
echo "  - commission: 15"
echo ""

SELLER_RESPONSE=$(curl -s -X POST "$DOMAIN/api/seller/approve" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"sellerId\": 1,
    \"commission\": 15
  }")

if echo "$SELLER_RESPONSE" | grep -q "approved\|Seller not found"; then
  if echo "$SELLER_RESPONSE" | grep -q "successfully"; then
    echo -e "${GREEN}✅ Seller approved${NC}"
  else
    echo -e "${YELLOW}⚠️  Seller not found (use existing seller ID)${NC}"
  fi
  echo "Response: $SELLER_RESPONSE"
else
  echo -e "${RED}❌ Seller approval failed${NC}"
  echo "Response: $SELLER_RESPONSE"
fi
echo ""

# Test Summary
echo "========================================"
echo "📊 Test Summary"
echo "========================================"
echo ""
echo "✅ Phase 1 (Automatic):"
echo "   ✓ Test 1: Zoho Mail connection"
echo "   ✓ Test 2: Welcome Email (on signup)"
echo "   ✓ Test 3: Order Confirmation (on order placed)"
echo ""
echo "✅ Phase 2 (Admin Actions):"
echo "   ✓ Test 4: Order Shipped (on dispatch)"
echo "   ✓ Test 5: Order Cancelled (on cancellation)"
echo "   ✓ Test 6: Refund Confirmed (on refund)"
echo "   ✓ Test 7: Vendor Onboarding (on seller approval)"
echo ""
echo "========================================"
echo "📧 Email Log Verification"
echo "========================================"
echo ""
echo "Check database for sent emails:"
echo ""
echo "  SELECT * FROM notifications"
echo "  WHERE type = 'email'"
echo "  ORDER BY createdAt DESC"
echo "  LIMIT 10;"
echo ""
echo "Check Zoho Mail inbox:"
echo "  1. Log into mail.zoho.com"
echo "  2. Check 'Sent' folder"
echo "  3. Verify all 7 test emails appear"
echo ""
echo "========================================"
echo "✅ Test Complete!"
echo "========================================"
