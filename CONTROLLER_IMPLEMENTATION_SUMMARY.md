# Controller Layer Implementation Summary

## Overview
Complete implementation of REST API controllers for all entities with full CRUD operations, service layer integration, and comprehensive error handling.

---

## Controllers Created

### 1. **InstituteController**
**File:** `src/main/java/com/slotwise/sw/controller/InstituteController.java`
**Base Path:** `/api/institutes`

**Service Injected:** `@Autowired private InstituteService instituteService;`

**Endpoints:**
- `GET /` - Get all institutes
- `GET /{id}` - Get institute by ID
- `GET /name/{name}` - Get institute by name
- `POST /` - Create new institute
- `PUT /{id}` - Update institute
- `DELETE /{id}` - Delete institute
- `GET /exists/{name}` - Check if institute exists

**Key Features:**
- ✅ CORS enabled
- ✅ Full error handling (400, 404, 500)
- ✅ Service layer integration
- ✅ Duplicate name validation via service

---

### 2. **DepartmentController**
**File:** `src/main/java/com/slotwise/sw/controller/DepartmentController.java`
**Base Path:** `/api/departments`

**Service Injected:** `@Autowired private DepartmentService departmentService;`

**Endpoints:**
- `GET /` - Get all departments
- `GET /{id}` - Get department by ID
- `GET /name/{name}` - Get department by name
- `GET /institute/{instituteId}` - Get departments by institute
- `POST /` - Create new department
- `PUT /{id}` - Update department
- `DELETE /{id}` - Delete department
- `GET /exists/{name}` - Check if department exists

**Key Features:**
- ✅ CORS enabled
- ✅ Institute validation (referenced institute must exist)
- ✅ Duplicate name prevention
- ✅ Query by institute support
- ✅ Full error handling

---

### 3. **UserController**
**File:** `src/main/java/com/slotwise/sw/controller/UserController.java`
**Base Path:** `/api/users`

**Service Injected:** `@Autowired private UserService userService;`

**Endpoints:**
- `GET /` - Get all users
- `GET /{id}` - Get user by ID
- `GET /email/{email}` - Get user by email
- `GET /department/{departmentId}` - Get users by department
- `GET /role/{role}` - Get users by role (ADMIN/USER)
- `GET /status/active` - Get all active users
- `GET /status/inactive` - Get all inactive users
- `POST /` - Create new user (default role=ADMIN, active=true)
- `PUT /{id}` - Update user
- `DELETE /{id}` - Delete user
- `PUT /{id}/activate` - Activate user
- `PUT /{id}/deactivate` - Deactivate user
- `GET /exists/{email}` - Check if user exists

**Key Features:**
- ✅ CORS enabled
- ✅ Default role set to ADMIN on creation
- ✅ Default active status set to true
- ✅ Email uniqueness validation
- ✅ Department validation
- ✅ User activation/deactivation endpoints
- ✅ Role-based queries
- ✅ Status-based queries
- ✅ Full error handling

---

### 4. **VenueController**
**File:** `src/main/java/com/slotwise/sw/controller/VenueController.java`
**Base Path:** `/api/venues`

**Service Injected:** `@Autowired private VenueService venueService;`

**Endpoints:**
- `GET /` - Get all venues
- `GET /{id}` - Get venue by ID
- `GET /name/{name}` - Get venue by name
- `GET /department/{departmentId}` - Get venues by department
- `POST /` - Create new venue
- `PUT /{id}` - Update venue
- `DELETE /{id}` - Delete venue
- `GET /exists/{name}` - Check if venue exists

**Key Features:**
- ✅ CORS enabled
- ✅ Department validation (referenced department must exist)
- ✅ Duplicate name prevention
- ✅ Query by department support
- ✅ Full error handling

---

## Common Patterns

### 1. **Service Injection**
```java
@Autowired
private EntityService entityService;
```

### 2. **REST Controller Setup**
```java
@RestController
@RequestMapping("/api/entities")
@CrossOrigin(origins = "*", maxAge = 3600)
public class EntityController {
    // endpoints
}
```

### 3. **GET All Entities**
```java
@GetMapping
public ResponseEntity<List<Entity>> getAll() {
    List<Entity> entities = entityService.getAll();
    return new ResponseEntity<>(entities, HttpStatus.OK);
}
```

### 4. **GET by ID with Optional**
```java
@GetMapping("/{id}")
public ResponseEntity<Entity> getById(@PathVariable Long id) {
    Optional<Entity> entity = entityService.getById(id);
    return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
            .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
}
```

### 5. **POST Create with Validation**
```java
@PostMapping
public ResponseEntity<Entity> create(@RequestBody Entity entity) {
    try {
        Entity created = entityService.create(entity);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    } catch (IllegalArgumentException e) {
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    } catch (RuntimeException e) {
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

### 6. **PUT Update with Error Handling**
```java
@PutMapping("/{id}")
public ResponseEntity<Entity> update(@PathVariable Long id, @RequestBody Entity details) {
    try {
        Entity updated = entityService.update(id, details);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    } catch (IllegalArgumentException e) {
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    } catch (RuntimeException e) {
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
```

### 7. **DELETE with Error Handling**
```java
@DeleteMapping("/{id}")
public ResponseEntity<Void> delete(@PathVariable Long id) {
    try {
        entityService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    } catch (RuntimeException e) {
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
```

---

## Error Handling Strategy

### Exception Order (Specificity Rule)
Catch specific exceptions before generic ones:

```java
try {
    // operation
} catch (IllegalArgumentException e) {  // More specific
    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
} catch (RuntimeException e) {  // More generic
    return new ResponseEntity<>(HttpStatus.NOT_FOUND);
}
```

### HTTP Status Mapping
| Exception Type | HTTP Status |
|---|---|
| IllegalArgumentException | 400 Bad Request |
| RuntimeException (not found) | 404 Not Found |
| Other RuntimeException | 500 Internal Server Error |

---

## CORS Configuration

All controllers include:
```java
@CrossOrigin(origins = "*", maxAge = 3600)
```

**Benefits:**
- ✅ Allows requests from any origin
- ✅ Cache preflight requests for 1 hour (3600 seconds)
- ✅ Enables frontend applications to interact with API

---

## Request/Response Examples

### Example 1: Create Department with Institute

**Request:**
```http
POST /api/departments HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "name": "Computer Science",
  "institute": {
    "id": 1
  }
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Computer Science",
  "institute": {
    "id": 1,
    "name": "University ABC",
    "createdAt": "2026-03-18T21:00:00",
    "updatedAt": "2026-03-18T21:00:00"
  },
  "createdAt": "2026-03-18T21:00:00",
  "updatedAt": "2026-03-18T21:00:00"
}
```

### Example 2: Create User with Default Role

**Request:**
```http
POST /api/users HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "department": {
    "id": 1
  }
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "ADMIN",
  "active": true,
  "createdAt": "2026-03-18T21:00:00",
  "updatedAt": "2026-03-18T21:00:00"
}
```

### Example 3: Query Users by Role

**Request:**
```http
GET /api/users/role/ADMIN HTTP/1.1
Host: localhost:8080
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "ADMIN",
    "active": true
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "ADMIN",
    "active": true
  }
]
```

---

## Layer Integration Flow

```
HTTP Request
    ↓
Controller (REST Endpoint)
    ↓
Service Layer (Business Logic & Validation)
    ↓
Repository Layer (Data Access)
    ↓
Database
    ↓
Repository Response
    ↓
Service Processing
    ↓
Controller Response (JSON)
    ↓
HTTP Response
```

---

## File Structure

```
src/main/java/com/slotwise/sw/
├── controller/
│   ├── InstituteController.java
│   ├── DepartmentController.java
│   ├── UserController.java
│   ├── VenueController.java
│   └── EventController.java (existing)
├── service/
│   ├── InstituteService.java
│   ├── DepartmentService.java
│   ├── UserService.java
│   └── VenueService.java
├── repository/
│   ├── InstituteRepository.java
│   ├── DepartmentRepository.java
│   ├── UserRepository.java
│   ├── VenueRepository.java
│   └── EventRepository.java (existing)
└── entity/
    ├── Institute.java
    ├── Department.java
    ├── User.java
    ├── Venue.java
    ├── Event.java (existing)
    └── UserRole.java
```

---

## Compilation Status
✅ **BUILD SUCCESS** - All controllers compile successfully with zero errors.

All 4 controllers are fully functional and ready to handle REST API requests!


