#!/bin/bash

echo "🧪 Testing SchoolWare API..."
echo ""

API_URL="http://localhost:5000"

# Check if server is running
echo "1. Checking server health..."
HEALTH=$(curl -s ${API_URL}/api/health)
if [ $? -eq 0 ]; then
    echo "   ✅ Server is running"
    echo "   Response: $HEALTH"
else
    echo "   ❌ Server is not responding"
    echo "   Please start the server first: npm run dev"
    exit 1
fi

echo ""
echo "2. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST ${API_URL}/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@schoolware.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }')

echo "   Response: ${REGISTER_RESPONSE:0:100}..."

echo ""
echo "3. Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST ${API_URL}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@schoolware.com",
    "password": "admin123"
  }')

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "   ✅ Login successful"
    echo "   Token: ${TOKEN:0:50}..."
else
    echo "   ❌ Login failed or user already exists"
fi

echo ""
echo "4. Testing authenticated endpoint..."
if [ -n "$TOKEN" ]; then
    ME_RESPONSE=$(curl -s ${API_URL}/api/auth/me \
      -H "Authorization: Bearer $TOKEN")
    echo "   Response: ${ME_RESPONSE:0:100}..."
else
    echo "   ⚠️  Skipping (no token available)"
fi

echo ""
echo "✅ API Testing Complete!"
echo ""
echo "Available endpoints:"
echo "  - POST /api/auth/register - Register new user"
echo "  - POST /api/auth/login - Login"
echo "  - GET  /api/auth/me - Get current user"
echo "  - GET  /api/students - Get all students"
echo "  - GET  /api/teachers - Get all teachers"
echo "  - GET  /api/classes - Get all classes"
echo "  - GET  /api/timetable - Get timetables"
echo "  - GET  /api/attendance - Get attendance records"
echo "  - GET  /api/behavior - Get behavior logs"
echo "  - GET  /api/assessments - Get assessments"
echo "  - GET  /api/messages - Get messages"
echo "  - GET  /api/payments - Get payments"
echo "  - GET  /api/reports/dashboard - Get dashboard stats"
echo ""
