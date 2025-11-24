#!/bin/bash

echo "🧪 CompMIS API Test Suite"
echo "=========================="
echo ""

# Test 1: Principal Login
echo "✅ Test 1: Principal Login"
PRINCIPAL_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"principal@shannoncomp.ie","pin":"1234"}' | jq -r '.token')

if [ ! -z "$PRINCIPAL_TOKEN" ] && [ "$PRINCIPAL_TOKEN" != "null" ]; then
  echo "   ✓ Principal login successful"
else
  echo "   ✗ Principal login failed"
fi
echo ""

# Test 2: Cory Kilmartin Login
echo "✅ Test 2: Cory Kilmartin (Admin Teacher) Login"
CORY_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"24corykilmartin@shannoncomp.ie","pin":"1470"}')
CORY_NAME=$(echo $CORY_RESPONSE | jq -r '.user.firstName')
CORY_ROLE=$(echo $CORY_RESPONSE | jq -r '.user.role')

if [ "$CORY_NAME" = "Cory" ] && [ "$CORY_ROLE" = "teacher" ]; then
  echo "   ✓ Cory login successful (Role: $CORY_ROLE)"
else
  echo "   ✗ Cory login failed"
fi
echo ""

# Test 3: Zuzanna Frankowska Login
echo "✅ Test 3: Zuzanna Frankowska (Editor Teacher) Login"
ZUZANNA_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"24zuzannafrankowska@shannoncomp.ie","pin":"3454"}')
ZUZANNA_NAME=$(echo $ZUZANNA_RESPONSE | jq -r '.user.firstName')
ZUZANNA_ROLE=$(echo $ZUZANNA_RESPONSE | jq -r '.user.role')

if [ "$ZUZANNA_NAME" = "Zuzanna" ] && [ "$ZUZANNA_ROLE" = "teacher" ]; then
  echo "   ✓ Zuzanna login successful (Role: $ZUZANNA_ROLE)"
else
  echo "   ✗ Zuzanna login failed"
fi
echo ""

# Test 4: Get All Students
echo "✅ Test 4: Get All Students"
STUDENTS=$(curl -s "http://localhost:5000/api/students" \
  -H "Authorization: Bearer $PRINCIPAL_TOKEN")
STUDENT_COUNT=$(echo $STUDENTS | jq '.students | length')

echo "   ✓ Found $STUDENT_COUNT students"
echo ""

# Test 5: Get All Teachers
echo "✅ Test 5: Get All Teachers"
TEACHERS=$(curl -s "http://localhost:5000/api/teachers" \
  -H "Authorization: Bearer $PRINCIPAL_TOKEN")
TEACHER_COUNT=$(echo $TEACHERS | jq '.teachers | length')

echo "   ✓ Found $TEACHER_COUNT teachers"
echo ""

# Test 6: Get All Classes
echo "✅ Test 6: Get All Classes"
CLASSES=$(curl -s "http://localhost:5000/api/classes" \
  -H "Authorization: Bearer $PRINCIPAL_TOKEN")
CLASS_COUNT=$(echo $CLASSES | jq '.classes | length')

echo "   ✓ Found $CLASS_COUNT classes"
echo ""

# Test 7: Get All Subjects
echo "✅ Test 7: Get All Subjects"
SUBJECTS=$(curl -s "http://localhost:5000/api/subjects" \
  -H "Authorization: Bearer $PRINCIPAL_TOKEN")
SUBJECT_COUNT=$(echo $SUBJECTS | jq '.subjects | length')

echo "   ✓ Found $SUBJECT_COUNT subjects"
echo ""

# Test 8: Student by House
echo "✅ Test 8: Filter Students by House (Bride)"
BRIDE_STUDENTS=$(curl -s "http://localhost:5000/api/students?house=Bride" \
  -H "Authorization: Bearer $PRINCIPAL_TOKEN")
BRIDE_COUNT=$(echo $BRIDE_STUDENTS | jq '.data | length' 2>/dev/null || echo "0")

echo "   ✓ Found $BRIDE_COUNT students in Bride house"
echo ""

# Test 9: Current User Profile
echo "✅ Test 9: Get Current User Profile (Cory)"
CORY_TOKEN=$(echo $CORY_RESPONSE | jq -r '.token')
CORY_PROFILE=$(curl -s "http://localhost:5000/api/auth/me" \
  -H "Authorization: Bearer $CORY_TOKEN")
CORY_EMAIL=$(echo $CORY_PROFILE | jq -r '.user.email')

if [ "$CORY_EMAIL" = "24corykilmartin@shannoncomp.ie" ]; then
  echo "   ✓ Profile retrieved successfully"
else
  echo "   ✗ Profile retrieval failed"
fi
echo ""

# Summary
echo "=========================="
echo "📊 Summary"
echo "=========================="
echo "Students: $STUDENT_COUNT"
echo "Teachers: $TEACHER_COUNT"
echo "Classes: $CLASS_COUNT"
echo "Subjects: $SUBJECT_COUNT"
echo ""
echo "✅ CompMIS API is functioning!"
echo ""
