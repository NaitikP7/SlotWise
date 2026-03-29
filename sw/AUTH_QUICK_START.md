# Authentication API - Quick Reference

## Login Endpoint

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## Success Response (200 OK)

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

## Error Responses

| Status | Message | Reason |
|--------|---------|--------|
| 400 | Email and password are required | Missing fields |
| 401 | Invalid email or password | User not found OR password mismatch |
| 403 | User account is deactivated | User exists but active = false |
| 500 | An error occurred during login | Server error |

## Files Created

| File | Purpose |
|------|---------|
| `dto/LoginRequest.java` | Request DTO |
| `dto/LoginResponse.java` | Response DTO |
| `service/AuthService.java` | Authentication logic |
| `controller/AuthController.java` | REST endpoints |

## No Password in Response

✅ Password is NEVER returned to client
✅ Only safe user information is returned
✅ 5 fields returned: id, name, email, departmentName, role, active, createdAt

## Integration Points

- Uses existing `UserRepository.findByEmail(String email)`
- Works with existing `User` entity
- Works with existing `UserRole` enum
- No Spring Security or JWT required
- Clean separation: Controller → Service → Repository

## Testing with cURL

```bash
# Success
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Invalid password
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"wrong"}'

# Health check
curl -X GET http://localhost:8080/api/auth/health
```

## Key Features

✅ No Spring Security overhead
✅ No JWT tokens
✅ No sessions required
✅ Simple and straightforward
✅ Proper HTTP status codes
✅ Input validation
✅ Error handling
✅ Password never exposed
✅ User active status check
✅ Department name included in response

## Next Steps for Production

1. Hash passwords with BCrypt
2. Add HTTPS
3. Implement rate limiting
4. Add audit logging
5. Add email validation
6. Implement token-based authentication (if needed)
7. Add password expiration policies

