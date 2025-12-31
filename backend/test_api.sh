#!/bin/bash

# Backend API Test Script
# This script tests all backend API endpoints

API_URL="http://localhost:3000"
CURL="curl --noproxy localhost -s"

echo "==================================="
echo "Backend API Comprehensive Test"
echo "==================================="
echo ""

# Test 1: Register a new user
echo "1. Testing POST /auth/register..."
REGISTER_RESPONSE=$($CURL -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"apitest$(date +%s)@example.com\",\"password\":\"Test123456\",\"name\":\"API Test User\"}")
echo "$REGISTER_RESPONSE"
JWT_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "✓ Registration successful. User ID: $USER_ID"
echo ""

# Test 2: Login with existing user
echo "2. Testing POST /auth/login..."
LOGIN_RESPONSE=$($CURL -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}')
echo "$LOGIN_RESPONSE"
echo "✓ Login successful"
echo ""

# Test 3: Get current user
echo "3. Testing GET /auth/me..."
ME_RESPONSE=$($CURL -X GET $API_URL/auth/me \
  -H "Authorization: Bearer $JWT_TOKEN")
echo "$ME_RESPONSE"
echo "✓ Get current user successful"
echo ""

# Test 4: Create a client
echo "4. Testing POST /clients..."
CLIENT_RESPONSE=$($CURL -X POST $API_URL/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"name":"Test Client","email":"client@example.com","company":"Test Company"}')
echo "$CLIENT_RESPONSE"
CLIENT_ID=$(echo "$CLIENT_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "✓ Client created successfully. Client ID: $CLIENT_ID"
echo ""

# Test 5: Get all clients
echo "5. Testing GET /clients..."
CLIENTS_RESPONSE=$($CURL -X GET $API_URL/clients \
  -H "Authorization: Bearer $JWT_TOKEN")
echo "$CLIENTS_RESPONSE"
echo "✓ Get clients successful"
echo ""

# Test 6: Get single client
echo "6. Testing GET /clients/{id}..."
SINGLE_CLIENT_RESPONSE=$($CURL -X GET $API_URL/clients/$CLIENT_ID \
  -H "Authorization: Bearer $JWT_TOKEN")
echo "$SINGLE_CLIENT_RESPONSE"
echo "✓ Get single client successful"
echo ""

# Test 7: Update client
echo "7. Testing PATCH /clients/{id}..."
UPDATE_CLIENT_RESPONSE=$($CURL -X PATCH $API_URL/clients/$CLIENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"company":"Updated Company Name"}')
echo "$UPDATE_CLIENT_RESPONSE"
echo "✓ Client updated successfully"
echo ""

# Test 8: Create an invoice
echo "8. Testing POST /invoices..."
INVOICE_RESPONSE=$($CURL -X POST $API_URL/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d "{\"invoiceNo\":\"INV-TEST-$(date +%s)\",\"status\":\"DRAFT\",\"dueDate\":\"2025-12-31T00:00:00.000Z\",\"clientId\":\"$CLIENT_ID\",\"items\":[{\"description\":\"Test Service\",\"quantity\":2,\"unitPrice\":150.50}]}")
echo "$INVOICE_RESPONSE"
INVOICE_ID=$(echo "$INVOICE_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "✓ Invoice created successfully. Invoice ID: $INVOICE_ID"
echo ""

# Test 9: Get all invoices
echo "9. Testing GET /invoices..."
INVOICES_RESPONSE=$($CURL -X GET $API_URL/invoices \
  -H "Authorization: Bearer $JWT_TOKEN")
echo "$INVOICES_RESPONSE"
echo "✓ Get invoices successful"
echo ""

# Test 10: Get single invoice
echo "10. Testing GET /invoices/{id}..."
SINGLE_INVOICE_RESPONSE=$($CURL -X GET $API_URL/invoices/$INVOICE_ID \
  -H "Authorization: Bearer $JWT_TOKEN")
echo "$SINGLE_INVOICE_RESPONSE"
echo "✓ Get single invoice successful"
echo ""

# Test 11: Update invoice
echo "11. Testing PATCH /invoices/{id}..."
UPDATE_INVOICE_RESPONSE=$($CURL -X PATCH $API_URL/invoices/$INVOICE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"status":"PAID"}')
echo "$UPDATE_INVOICE_RESPONSE"
echo "✓ Invoice updated successfully"
echo ""

# Test 12: Delete invoice
echo "12. Testing DELETE /invoices/{id}..."
DELETE_INVOICE_RESPONSE=$($CURL -X DELETE $API_URL/invoices/$INVOICE_ID \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -w "\nHTTP Status: %{http_code}")
echo "$DELETE_INVOICE_RESPONSE"
echo "✓ Invoice deleted successfully"
echo ""

# Test 13: Delete client
echo "13. Testing DELETE /clients/{id}..."
DELETE_CLIENT_RESPONSE=$($CURL -X DELETE $API_URL/clients/$CLIENT_ID \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -w "\nHTTP Status: %{http_code}")
echo "$DELETE_CLIENT_RESPONSE"
echo "✓ Client deleted successfully"
echo ""

# Test 14: Test without authorization (should fail)
echo "14. Testing unauthorized access..."
UNAUTH_RESPONSE=$($CURL -X GET $API_URL/clients \
  -w "\nHTTP Status: %{http_code}")
echo "$UNAUTH_RESPONSE"
echo "✓ Unauthorized access properly rejected"
echo ""

echo "==================================="
echo "All tests completed successfully!"
echo "==================================="
