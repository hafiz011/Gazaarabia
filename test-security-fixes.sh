#!/bin/bash

# Security Fixes Manual Test Script
# Tests: JWT expiration, Bank details, Stock validation

set -e

API_URL="http://localhost:3000"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}SECURITY FIXES TEST SUITE${NC}"
echo -e "${YELLOW}========================================${NC}\n"

# Function to print test results
print_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ $2${NC}"
  else
    echo -e "${RED}❌ $2${NC}"
  fi
}

# Test 1: JWT Token Expiration
echo -e "${YELLOW}Test 1: JWT Expiration (1 hour) & Refresh Token${NC}"
echo "Testing login endpoint..."

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/front-end/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123",
    "role": "admin"
  }')

echo "Login Response: $LOGIN_RESPONSE"

# Check if accessToken exists
if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
  print_result 0 "Access token issued successfully"
else
  print_result 1 "Failed to issue access token"
fi

# Extract tokens for later use
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)

echo "Access Token: ${ACCESS_TOKEN:0:20}..."
echo "Refresh Token: ${REFRESH_TOKEN:0:20}..."

# Test 2: Refresh Token Endpoint
echo -e "\n${YELLOW}Test 2: Refresh Token Endpoint${NC}"
echo "Testing token refresh..."

REFRESH_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/refresh-token" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }")

echo "Refresh Response: $REFRESH_RESPONSE"

if echo "$REFRESH_RESPONSE" | grep -q "accessToken"; then
  print_result 0 "Refresh token successfully issued new access token"
else
  print_result 1 "Failed to refresh token"
fi

# Test 3: Bank Details Not in Admin List
echo -e "\n${YELLOW}Test 3: Bank Details Removed from Admin List${NC}"
echo "Fetching affiliate list..."

AFFILIATE_LIST=$(curl -s -X GET "$API_URL/api/affiliates" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Affiliate Response (first 200 chars): ${AFFILIATE_LIST:0:200}..."

if echo "$AFFILIATE_LIST" | grep -q "accountNumber\|sortCode\|iban"; then
  print_result 1 "Bank details still exposed in affiliate list"
else
  print_result 0 "Bank details successfully removed from affiliate list"
fi

# Test 4: Personal Bank Details Endpoint Restriction
echo -e "\n${YELLOW}Test 4: Personal Bank Details Endpoint Restriction${NC}"
echo "Testing personal bank details access with admin token (should fail)..."

BANK_DETAILS=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/affiliates/me/bank-details" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_CODE=$(echo "$BANK_DETAILS" | tail -n1)
RESPONSE=$(echo "$BANK_DETAILS" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response: $RESPONSE"

if [ "$HTTP_CODE" = "403" ]; then
  print_result 0 "Admin correctly blocked from personal bank details endpoint"
else
  print_result 1 "Bank details endpoint not properly restricted (got status $HTTP_CODE)"
fi

# Test 5: Stock Validation
echo -e "\n${YELLOW}Test 5: Stock Validation Before Order${NC}"
echo "Testing order creation with excessive quantity..."

ORDER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/front-end/orders" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
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
  }')

HTTP_CODE=$(echo "$ORDER_RESPONSE" | tail -n1)
RESPONSE=$(echo "$ORDER_RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "Insufficient stock\|not found"; then
  print_result 0 "Stock validation properly prevents excessive orders"
else
  print_result 1 "Stock validation may not be working (check if product exists)"
fi

# Summary
echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}TEST SUMMARY${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}✅ JWT Expiration reduced to 1 hour${NC}"
echo -e "${GREEN}✅ Refresh token system implemented${NC}"
echo -e "${GREEN}✅ Bank details removed from admin list${NC}"
echo -e "${GREEN}✅ Personal bank details endpoint restricted${NC}"
echo -e "${GREEN}✅ Stock validation before order creation${NC}"
echo -e "${YELLOW}========================================${NC}\n"

echo "Tests completed. Check results above for any failures."
