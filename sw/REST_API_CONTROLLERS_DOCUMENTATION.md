# REST API Controllers Documentation

## Overview
Complete implementation of REST API controllers for all entities with full CRUD operations and service layer integration.

---

## Base URL
```
http://localhost:8080/api
```

---

## 1. Institute Controller
**Base Endpoint:** `/api/institutes`

### Endpoints

#### Get All Institutes
```
GET /api/institutes
```
**Response:** `200 OK` - List of all institutes
```json
[
  {
    "id": 1,
    "name": "University ABC",
    "createdAt": "2026-03-18T21:00:00",
    "updatedAt": "2026-03-18T21:00:00"
  }
]
```

#### Get Institute by ID
```
GET /api/institutes/{id}
```
**Parameters:**
- `id` (path): Institute ID (Long)

**Response:** `200 OK` or `404 NOT_FOUND`

#### Get Institute by Name
```
GET /api/institutes/name/{name}
```
**Parameters:**
- `name` (path): Institute name (String)

**Response:** `200 OK` or `404 NOT_FOUND`

#### Create New Institute
```
POST /api/institutes
Content-Type: application/json
```
**Request Body:**
```json
{
  "name": "University ABC"
}
```
**Response:** `201 CREATED` or `400 BAD_REQUEST` (if name already exists)

#### Update Institute
```
PUT /api/institutes/{id}
Content-Type: application/json
```
**Parameters:**
- `id` (path): Institute ID (Long)

**Request Body:**
```json
{
  "name": "Updated University Name"
}
```
**Response:** `200 OK`, `400 BAD_REQUEST`, or `404 NOT_FOUND`

#### Delete Institute
```
DELETE /api/institutes/{id}
```
**Parameters:**
- `id` (path): Institute ID (Long)

**Response:** `204 NO_CONTENT` or `404 NOT_FOUND`

#### Check Institute Existence
```
GET /api/institutes/exists/{name}
```
**Parameters:**
- `name` (path): Institute name (String)

**Response:** `200 OK` with Boolean value

---

## 2. Department Controller
**Base Endpoint:** `/api/departments`

### Endpoints

#### Get All Departments
```
GET /api/departments
```
**Response:** `200 OK` - List of all departments

#### Get Department by ID
```
GET /api/departments/{id}
```
**Parameters:**
- `id` (path): Department ID (Long)

**Response:** `200 OK` or `404 NOT_FOUND`

#### Get Department by Name
```
GET /api/departments/name/{name}
```
**Parameters:**
- `name` (path): Department name (String)

**Response:** `200 OK` or `404 NOT_FOUND`

#### Get All Departments by Institute
```
GET /api/departments/institute/{instituteId}
```
**Parameters:**
- `instituteId` (path): Institute ID (Long)

**Response:** `200 OK` - List of departments in the institute

#### Create New Department
```
POST /api/departments
Content-Type: application/json
```
**Request Body:**
```json
{
  "name": "Computer Science",
  "institute": {
    "id": 1
  }
}
```
**Response:** `201 CREATED`, `400 BAD_REQUEST`, or `500 INTERNAL_SERVER_ERROR`

#### Update Department
```
PUT /api/departments/{id}
Content-Type: application/json
```
**Parameters:**
- `id` (path): Department ID (Long)

**Request Body:**
```json
{
  "name": "Updated Department Name",
  "institute": {
    "id": 1
  }
}
```
**Response:** `200 OK`, `400 BAD_REQUEST`, or `404 NOT_FOUND`

#### Delete Department
```
DELETE /api/departments/{id}
```
**Parameters:**
- `id` (path): Department ID (Long)

**Response:** `204 NO_CONTENT` or `404 NOT_FOUND`

#### Check Department Existence
```
GET /api/departments/exists/{name}
```
**Parameters:**
- `name` (path): Department name (String)

**Response:** `200 OK` with Boolean value

---

## 3. User Controller
**Base Endpoint:** `/api/users`

### Endpoints

#### Get All Users
```
GET /api/users
```
**Response:** `200 OK` - List of all users

#### Get User by ID
```
GET /api/users/{id}
```
**Parameters:**
- `id` (path): User ID (Long)

**Response:** `200 OK` or `404 NOT_FOUND`

#### Get User by Email
```
GET /api/users/email/{email}
```
**Parameters:**
- `email` (path): User email (String)

**Response:** `200 OK` or `404 NOT_FOUND`

#### Get All Users by Department
```
GET /api/users/department/{departmentId}
```
**Parameters:**
- `departmentId` (path): Department ID (Long)

**Response:** `200 OK` - List of users in the department

#### Get All Users by Role
```
GET /api/users/role/{role}
```
**Parameters:**
- `role` (path): User role - `ADMIN` or `USER` (UserRole enum)

**Response:** `200 OK` - List of users with the specified role

#### Get All Active Users
```
GET /api/users/status/active
```
**Response:** `200 OK` - List of active users

#### Get All Inactive Users
```
GET /api/users/status/inactive
```
**Response:** `200 OK` - List of inactive users

#### Create New User
```
POST /api/users
Content-Type: application/json
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "department": {
    "id": 1
  },
  "role": "ADMIN",
  "active": true
}
```
**Note:** Default role is `ADMIN` if not specified. Default active is `true` if not specified.

**Response:** `201 CREATED`, `400 BAD_REQUEST`, or `500 INTERNAL_SERVER_ERROR`

#### Update User
```
PUT /api/users/{id}
Content-Type: application/json
```
**Parameters:**
- `id` (path): User ID (Long)

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "newpassword123",
  "department": {
    "id": 1
  },
  "role": "USER",
  "active": true
}
```
**Response:** `200 OK`, `400 BAD_REQUEST`, or `404 NOT_FOUND`

#### Delete User
```
DELETE /api/users/{id}
```
**Parameters:**
- `id` (path): User ID (Long)

**Response:** `204 NO_CONTENT` or `404 NOT_FOUND`

#### Activate User
```
PUT /api/users/{id}/activate
```
**Parameters:**
- `id` (path): User ID (Long)

**Response:** `200 OK` with activated user object or `404 NOT_FOUND`

#### Deactivate User
```
PUT /api/users/{id}/deactivate
```
**Parameters:**
- `id` (path): User ID (Long)

**Response:** `200 OK` with deactivated user object or `404 NOT_FOUND`

#### Check User Existence
```
GET /api/users/exists/{email}
```
**Parameters:**
- `email` (path): User email (String)

**Response:** `200 OK` with Boolean value

---

## 4. Venue Controller
**Base Endpoint:** `/api/venues`

### Endpoints

#### Get All Venues
```
GET /api/venues
```
**Response:** `200 OK` - List of all venues

#### Get Venue by ID
```
GET /api/venues/{id}
```
**Parameters:**
- `id` (path): Venue ID (Long)

**Response:** `200 OK` or `404 NOT_FOUND`

#### Get Venue by Name
```
GET /api/venues/name/{name}
```
**Parameters:**
- `name` (path): Venue name (String)

**Response:** `200 OK` or `404 NOT_FOUND`

#### Get All Venues by Department
```
GET /api/venues/department/{departmentId}
```
**Parameters:**
- `departmentId` (path): Department ID (Long)

**Response:** `200 OK` - List of venues in the department

#### Create New Venue
```
POST /api/venues
Content-Type: application/json
```
**Request Body:**
```json
{
  "name": "Auditorium A",
  "capacity": 500,
  "location": "Building 1, Floor 3",
  "department": {
    "id": 1
  }
}
```
**Response:** `201 CREATED`, `400 BAD_REQUEST`, or `500 INTERNAL_SERVER_ERROR`

#### Update Venue
```
PUT /api/venues/{id}
Content-Type: application/json
```
**Parameters:**
- `id` (path): Venue ID (Long)

**Request Body:**
```json
{
  "name": "Auditorium B",
  "capacity": 600,
  "location": "Building 2, Floor 1",
  "department": {
    "id": 1
  }
}
```
**Response:** `200 OK`, `400 BAD_REQUEST`, or `404 NOT_FOUND`

#### Delete Venue
```
DELETE /api/venues/{id}
```
**Parameters:**
- `id` (path): Venue ID (Long)

**Response:** `204 NO_CONTENT` or `404 NOT_FOUND`

#### Check Venue Existence
```
GET /api/venues/exists/{name}
```
**Parameters:**
- `name` (path): Venue name (String)

**Response:** `200 OK` with Boolean value

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource successfully created |
| 204 | No Content - Successful deletion |
| 400 | Bad Request - Invalid input or duplicate resource |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## Error Handling

All controllers implement consistent error handling:
- **Validation Errors** → `400 BAD_REQUEST`
- **Not Found Errors** → `404 NOT_FOUND`
- **Duplicate Name/Email** → `400 BAD_REQUEST`
- **Server Errors** → `500 INTERNAL_SERVER_ERROR`

---

## Cross-Origin Resource Sharing (CORS)

All controllers are configured with CORS enabled:
```
@CrossOrigin(origins = "*", maxAge = 3600)
```
- Allows requests from any origin
- Cache preflight requests for 1 hour

---

## Integration with Service Layer

All controllers are fully integrated with their respective service layers:
- **InstituteController** ↔ InstituteService
- **DepartmentController** ↔ DepartmentService
- **UserController** ↔ UserService
- **VenueController** ↔ VenueService

Services handle:
- Business logic
- Data validation
- Transaction management
- Exception handling

---

## Example Usage

### Creating a Complete Department Hierarchy

```bash
# 1. Create an Institute
curl -X POST http://localhost:8080/api/institutes \
  -H "Content-Type: application/json" \
  -d '{"name": "University ABC"}'

# Response: Institute with id=1

# 2. Create a Department
curl -X POST http://localhost:8080/api/departments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Computer Science",
    "institute": {"id": 1}
  }'

# Response: Department with id=1

# 3. Create a Venue
curl -X POST http://localhost:8080/api/venues \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Auditorium A",
    "capacity": 500,
    "location": "Building 1, Floor 3",
    "department": {"id": 1}
  }'

# Response: Venue with id=1

# 4. Create a User (default role=ADMIN, active=true)
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "department": {"id": 1}
  }'

# Response: User with id=1, role=ADMIN, active=true
```

---

## Compilation Status
✅ **BUILD SUCCESS** - All controllers compile successfully with zero errors.


