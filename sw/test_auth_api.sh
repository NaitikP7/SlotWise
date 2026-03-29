#!/bin/bash
# Authentication API - cURL Examples

# Make sure to replace localhost:8080 with your actual server address

# ============================================================================
# 1. SUCCESSFUL LOGIN - ADMIN USER
# ============================================================================

echo "1. Testing successful login with valid credentials..."
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }' \
  -w "\nStatus Code: %{http_code}\n"

echo ""
echo ""

# ============================================================================
# 2. SUCCESSFUL LOGIN - REGULAR USER
# ============================================================================

echo "2. Testing login with regular user credentials..."
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "user123"
  }' \
  -w "\nStatus Code: %{http_code}\n"

echo ""
echo ""

# ============================================================================
# 3. INVALID PASSWORD - 401 UNAUTHORIZED
# ============================================================================

echo "3. Testing login with invalid password (should return 401)..."
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "wrongpassword"
  }' \
  -w "\nStatus Code: %{http_code}\n"

echo ""
echo ""

# ============================================================================
# 4. USER NOT FOUND - 401 UNAUTHORIZED
# ============================================================================

echo "4. Testing login with non-existent email (should return 401)..."
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "anypassword"
  }' \
  -w "\nStatus Code: %{http_code}\n"

echo ""
echo ""

# ============================================================================
# 5. INACTIVE USER - 403 FORBIDDEN
# ============================================================================

echo "5. Testing login with inactive user (should return 403)..."
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "inactive@example.com",
    "password": "pass123"
  }' \
  -w "\nStatus Code: %{http_code}\n"

echo ""
echo ""

# ============================================================================
# 6. MISSING EMAIL - 400 BAD REQUEST
# ============================================================================

echo "6. Testing login with missing email (should return 400)..."
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "password": "admin123"
  }' \
  -w "\nStatus Code: %{http_code}\n"

echo ""
echo ""

# ============================================================================
# 7. MISSING PASSWORD - 400 BAD REQUEST
# ============================================================================

echo "7. Testing login with missing password (should return 400)..."
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com"
  }' \
  -w "\nStatus Code: %{http_code}\n"

echo ""
echo ""

# ============================================================================
# 8. EMPTY REQUEST - 400 BAD REQUEST
# ============================================================================

echo "8. Testing login with empty request body (should return 400)..."
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\nStatus Code: %{http_code}\n"

echo ""
echo ""

# ============================================================================
# 9. HEALTH CHECK
# ============================================================================

echo "9. Testing health check endpoint..."
curl -X GET http://localhost:8080/api/auth/health \
  -w "\nStatus Code: %{http_code}\n"

echo ""
echo ""

# ============================================================================
# EXPECTED RESULTS SUMMARY
# ============================================================================

cat << 'EOF'

EXPECTED RESULTS:

Test 1: ✅ 200 OK
- Returns full user object with role and departmentName
- Password NOT included in response

Test 2: ✅ 200 OK
- Returns full user object with role and departmentName
- Password NOT included in response

Test 3: ✅ 401 UNAUTHORIZED
- Message: "Invalid email or password"

Test 4: ✅ 401 UNAUTHORIZED
- Message: "Invalid email or password"

Test 5: ✅ 403 FORBIDDEN
- Message: "User account is deactivated"

Test 6: ✅ 400 BAD REQUEST
- Message: "Email and password are required"

Test 7: ✅ 400 BAD REQUEST
- Message: "Email and password are required"

Test 8: ✅ 400 BAD REQUEST
- Message: "Email and password are required"

Test 9: ✅ 200 OK
- Message: "Authentication service is running"

EOF

