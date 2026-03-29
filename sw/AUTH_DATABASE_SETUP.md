# Authentication System - Database Setup & Testing Guide

## Database Setup

### Prerequisites
- MySQL Server running
- Database `slotwise` exists
- `Users` table created with proper schema

### Required User Table Schema

```sql
CREATE TABLE Users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    department_id BIGINT NOT NULL,
    role ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES Department(id)
);
```

### Insert Test Users

Run the following SQL commands in your MySQL client:

```sql
-- Test User 1: Admin (Active)
INSERT INTO Users (name, email, password, department_id, role, active, created_at, updated_at) 
VALUES ('Admin User', 'admin@example.com', 'admin123', 1, 'ADMIN', TRUE, NOW(), NOW());

-- Test User 2: Regular User (Active)
INSERT INTO Users (name, email, password, department_id, role, active, created_at, updated_at) 
VALUES ('John Doe', 'user@example.com', 'user123', 1, 'USER', TRUE, NOW(), NOW());

-- Test User 3: Inactive User
INSERT INTO Users (name, email, password, department_id, role, active, created_at, updated_at) 
VALUES ('Inactive User', 'inactive@example.com', 'pass123', 1, 'USER', FALSE, NOW(), NOW());

-- Test User 4: Engineering Department
INSERT INTO Users (name, email, password, department_id, role, active, created_at, updated_at) 
VALUES ('Engineer One', 'engineer@example.com', 'eng123', 2, 'USER', TRUE, NOW(), NOW());

-- Test User 5: HR Department
INSERT INTO Users (name, email, password, department_id, role, active, created_at, updated_at) 
VALUES ('HR Manager', 'hr@example.com', 'hr123', 3, 'ADMIN', TRUE, NOW(), NOW());
```

### Verify Data

```sql
-- Check all users
SELECT id, name, email, password, department_id, role, active FROM Users;

-- Check specific user
SELECT * FROM Users WHERE email = 'admin@example.com';
```

## Running the Application

### Option 1: Using Maven Spring Boot Plugin

```bash
cd C:\Users\naiti\Downloads\sw\sw
mvn spring-boot:run
```

The application will start at: `http://localhost:8080`

### Option 2: Using Java directly

```bash
cd C:\Users\naiti\Downloads\sw\sw
mvn clean package
java -jar target/sw-0.0.1-SNAPSHOT.jar
```

### Option 3: Using IDE

- Right-click on `Application.java`
- Select "Run" or "Run Application"

## Testing the API

### Health Check

Before testing login, verify the API is running:

```bash
curl -X GET http://localhost:8080/api/auth/health
```

Expected Response:
```
"Authentication service is running"
```

### Test Case 1: Valid Admin Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

Expected Status: **200 OK**

Expected Response:
```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@example.com",
  "departmentName": "Engineering",
  "role": "ADMIN",
  "active": true,
  "createdAt": "2026-03-27T10:30:00"
}
```

### Test Case 2: Valid User Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}'
```

Expected Status: **200 OK**

Expected Response:
```json
{
  "id": 2,
  "name": "John Doe",
  "email": "user@example.com",
  "departmentName": "Sales",
  "role": "USER",
  "active": true,
  "createdAt": "2026-03-27T10:30:00"
}
```

### Test Case 3: Invalid Password

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"wrongpassword"}'
```

Expected Status: **401 UNAUTHORIZED**

Expected Response:
```
"Invalid email or password"
```

### Test Case 4: Non-existent User

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"notfound@example.com","password":"password123"}'
```

Expected Status: **401 UNAUTHORIZED**

Expected Response:
```
"Invalid email or password"
```

### Test Case 5: Inactive User

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"inactive@example.com","password":"pass123"}'
```

Expected Status: **403 FORBIDDEN**

Expected Response:
```
"User account is deactivated"
```

### Test Case 6: Missing Email

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"admin123"}'
```

Expected Status: **400 BAD REQUEST**

Expected Response:
```
"Email and password are required"
```

### Test Case 7: Missing Password

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com"}'
```

Expected Status: **400 BAD REQUEST**

Expected Response:
```
"Email and password are required"
```

### Test Case 8: Empty Request

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected Status: **400 BAD REQUEST**

Expected Response:
```
"Email and password are required"
```

## Using Postman for Testing

### 1. Create New Request

- Method: **POST**
- URL: `http://localhost:8080/api/auth/login`

### 2. Set Headers

| Header | Value |
|--------|-------|
| Content-Type | application/json |

### 3. Set Body

Raw JSON:
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### 4. Send Request

Click "Send" button to test the endpoint.

## Common Issues & Solutions

### Issue 1: "Unknown database 'slotwise'"

**Cause:** MySQL database not created

**Solution:**
```sql
CREATE DATABASE slotwise;
USE slotwise;
```

### Issue 2: "Column 'department_id' doesn't exist"

**Cause:** Department table not created or Users table has wrong schema

**Solution:**
- Create Department table first
- Create Users table with correct foreign key

### Issue 3: "Connection refused"

**Cause:** MySQL server not running or application not started

**Solution:**
- Start MySQL: `net start MySQL80` (Windows)
- Start application: `mvn spring-boot:run`

### Issue 4: "Null pointer exception in login"

**Cause:** Missing required fields in request

**Solution:**
- Ensure both email and password are provided
- Check email and password are not null/empty

### Issue 5: "Status 500 Internal Server Error"

**Cause:** Database connection issue or unexpected error

**Solution:**
- Check database connection in application.properties
- Verify MySQL is running
- Check application logs for detailed error message

## Application Logs

When running with `mvn spring-boot:run`, you'll see logs like:

```
2026-03-27T10:30:00.000+05:30  INFO 1234 --- [main] ... Application started in 2.5 seconds
2026-03-27T10:30:05.000+05:30  INFO 1234 --- [nio-8080-exec-1] ... POST /api/auth/login
2026-03-27T10:30:05.000+05:30  INFO 1234 --- [nio-8080-exec-1] ... User authenticated: admin@example.com
```

## Debugging Tips

### Enable Debug Logging

Add to `application.properties`:

```properties
logging.level.com.slotwise.sw=DEBUG
logging.level.org.springframework.web=DEBUG
```

### Monitor Database Queries

Add to `application.properties`:

```properties
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

### Check Database Directly

```sql
-- Connect to MySQL
mysql -u root -p

-- Use database
USE slotwise;

-- Check users table
SELECT * FROM Users;

-- Check specific user
SELECT * FROM Users WHERE email = 'admin@example.com';
```

## Performance Testing

### Load Test with Apache JMeter

1. Download Apache JMeter
2. Create HTTP Request:
   - Method: POST
   - URL: http://localhost:8080/api/auth/login
   - Body: {"email":"admin@example.com","password":"admin123"}
3. Set number of threads (users) and ramp-up time
4. Run and view results

### Simple Load Test with cURL Loop

```bash
for i in {1..10}; do
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"admin123"}' \
    -w "\nStatus: %{http_code}\n"
done
```

## Success Indicators

✅ Health check returns 200
✅ Valid credentials return 200 with user data
✅ Invalid credentials return 401
✅ Inactive users return 403
✅ Missing fields return 400
✅ Password never in response
✅ All HTTP status codes correct
✅ Response includes: id, name, email, role, departmentName, active, createdAt
✅ No database errors in logs
✅ Application starts successfully

## Next Steps

1. ✅ Database setup (Users table with test data)
2. ✅ Start application (`mvn spring-boot:run`)
3. ✅ Test all endpoints with cURL or Postman
4. ✅ Verify correct HTTP status codes
5. ✅ Check response format matches documentation
6. Production hardening:
   - Implement password hashing (BCrypt)
   - Add HTTPS/TLS
   - Implement rate limiting
   - Add session management or JWT
   - Add audit logging
   - Implement password policies

## Quick Reference

| Endpoint | Method | Status | Purpose |
|----------|--------|--------|---------|
| /api/auth/login | POST | 200 | Login with credentials |
| /api/auth/login | POST | 401 | Invalid credentials |
| /api/auth/login | POST | 403 | User inactive |
| /api/auth/login | POST | 400 | Missing fields |
| /api/auth/health | GET | 200 | Health check |

