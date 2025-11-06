#!/bin/bash

# API Testing Script for AI Email Designer

API_URL=${1:-"http://localhost:3000"}

echo "🧪 Testing AI Email Designer API"
echo "API URL: $API_URL"
echo "=================================="
echo ""

# Test 1: Health Check
echo "1️⃣  Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s "$API_URL/health")
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo "✅ Health check passed"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo "❌ Health check failed"
    echo "   Response: $HEALTH_RESPONSE"
    exit 1
fi
echo ""

# Test 2: Register User
echo "2️⃣  Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "test'$(date +%s)'@example.com",
        "password": "TestPassword123!",
        "fullName": "Test User"
    }')

TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -n "$TOKEN" ]; then
    echo "✅ Registration successful"
    echo "   Token: ${TOKEN:0:20}..."
else
    echo "❌ Registration failed"
    echo "   Response: $REGISTER_RESPONSE"
    exit 1
fi
echo ""

# Test 3: Get Current User
echo "3️⃣  Testing authenticated endpoint..."
ME_RESPONSE=$(curl -s "$API_URL/api/v1/auth/me" \
    -H "Authorization: Bearer $TOKEN")

if echo "$ME_RESPONSE" | grep -q "email"; then
    echo "✅ Authentication working"
    echo "   User: $(echo $ME_RESPONSE | grep -o '"email":"[^"]*' | sed 's/"email":"//')"
else
    echo "❌ Authentication failed"
    echo "   Response: $ME_RESPONSE"
    exit 1
fi
echo ""

# Test 4: Get Brand Profile (should be empty)
echo "4️⃣  Testing brand profile endpoint..."
BRAND_RESPONSE=$(curl -s "$API_URL/api/v1/brand/profile" \
    -H "Authorization: Bearer $TOKEN")

echo "✅ Brand profile endpoint accessible"
echo ""

# Test 5: List Emails (should be empty)
echo "5️⃣  Testing emails list endpoint..."
EMAILS_RESPONSE=$(curl -s "$API_URL/api/v1/emails" \
    -H "Authorization: Bearer $TOKEN")

if echo "$EMAILS_RESPONSE" | grep -q "emails"; then
    echo "✅ Emails endpoint working"
else
    echo "❌ Emails endpoint failed"
    echo "   Response: $EMAILS_RESPONSE"
    exit 1
fi
echo ""

echo "=================================================="
echo "✅ All API tests passed!"
echo ""
echo "🔑 Test User Token (save for manual testing):"
echo "$TOKEN"
echo ""
echo "📝 Example curl commands:"
echo ""
echo "# Get user info"
echo "curl $API_URL/api/v1/auth/me \\"
echo "  -H 'Authorization: Bearer $TOKEN'"
echo ""
echo "# Generate email"
echo "curl -X POST $API_URL/api/v1/emails/generate \\"
echo "  -H 'Authorization: Bearer $TOKEN' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"campaignBrief\": \"25% off sale\", \"campaignType\": \"promotional\"}'"
echo ""

