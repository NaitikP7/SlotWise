# Authentication API Documentation

## Overview
Simple authentication system implemented WITHOUT Spring Security, JWT, or sessions.

## Implemented Components

### 1. LoginRequest DTO
**File:** `com.slotwise.sw.dto.LoginRequest`

Request body for login endpoint:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 2. LoginResponse DTO
**File:** `com.slotwise.sw.dto.LoginResponse`

Response sent after successful login (password is NOT returned):
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "departmentName": "Engineering",
  "role": "ADMIN",
  "active": true,
  "createdAt": "2026-03-27T10:30:00"
}
```

### 3. AuthService
**File:** `com.slotwise.sw.service.AuthService`

**Method:** `LoginResponse login(LoginRequest loginRequest)`

**Logic:**
1. Validates input (email and password required)
2. Fetches user from database by email
3. Validates password matches
4. Checks if user is active
5. Returns LoginResponse without password

**Exceptions:**
- `IllegalArgumentException`: Invalid credentials or inactive user

### 4. AuthController
**File:** `com.slotwise.sw.controller.AuthController`

**Endpoint:** `POST /api/auth/login`

**HTTP Status Codes:**
- `200 OK`: Successful login, returns LoginResponse
- `400 BAD REQUEST`: Missing email or password
- `401 UNAUTHORIZED`: Invalid email/password combination
- `403 FORBIDDEN`: User account is deactivated
- `500 INTERNAL SERVER ERROR`: Unexpected error

### 5. UserRepository
**File:** `com.slotwise.sw.repository.UserRepository`

**Required Method (Already Present):**
```java
Optional<User> findByEmail(String email);
```

## API Usage Examples

### Successful Login
**Request:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "departmentName": "Engineering",
  "role": "ADMIN",
  "active": true,
  "createdAt": "2026-03-27T10:30:00"
}
```

### Invalid Credentials
**Request:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"wrongpassword"}'
```

**Response (401 UNAUTHORIZED):**
```json
"Invalid email or password"
```

### User Not Found
**Request:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@example.com","password":"password123"}'
```

**Response (401 UNAUTHORIZED):**
```json
"Invalid email or password"
```

### Inactive User
**Request:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"inactive@example.com","password":"password123"}'
```

**Response (403 FORBIDDEN):**
```json
"User account is deactivated"
```

### Health Check
**Request:**
```bash
curl -X GET http://localhost:8080/api/auth/health
```

**Response (200 OK):**
```json
"Authentication service is running"
```

## Database Requirements

User table must have:
- `email` column (unique, indexed for performance)
- `password` column (stores plain text - consider hashing in production)
- `active` column (boolean, default true)
- Other required fields (name, role, department_id, etc.)

### Sample User in Database
```sql
INSERT INTO Users (name, email, password, department_id, role, active, created_at, updated_at) 
VALUES ('John Doe', 'user@example.com', 'password123', 1, 'ADMIN', true, NOW(), NOW());
```

## Security Notes

⚠️ **IMPORTANT:** This is a simple authentication system for development/learning purposes.

For production, consider:
1. **Password Hashing:** Use BCrypt or similar (BCryptPasswordEncoder in Spring)
2. **HTTPS Only:** Always use HTTPS in production
3. **Rate Limiting:** Implement rate limiting on login endpoint
4. **Session Management:** Add session tokens or JWT for stateful authentication
5. **Audit Logging:** Log all login attempts
6. **Input Validation:** Add Spring Validation (e.g., @Email, @NotBlank)
7. **Password Requirements:** Enforce strong password policies

## Implementation Steps (Already Done)

✅ Created `LoginRequest` DTO
✅ Created `LoginResponse` DTO
✅ Created `AuthService` with login logic
✅ Created `AuthController` with login endpoint
✅ `UserRepository.findByEmail()` already exists
✅ Proper exception handling with appropriate HTTP status codes
✅ Password NOT returned in response
✅ Clean package structure maintained

## Testing

To test the authentication system:

1. Start the application: `mvn spring-boot:run`
2. Ensure MySQL database is running with users table populated
3. Use curl or Postman to test endpoints
4. Verify status codes match documentation

## Future Enhancements

1. Add password hashing with BCrypt
2. Implement JWT tokens for stateless authentication
3. Add email verification
4. Implement password reset functionality
5. Add two-factor authentication
6. Implement rate limiting
7. Add audit logging for login attempts

