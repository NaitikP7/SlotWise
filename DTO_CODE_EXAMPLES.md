# DTO Implementation Reference - Code Examples

## Department Entity Example (Reference)

This shows how the Department layer has been refactored with DTOs:

---

## 1. DTOs for Department

### DepartmentRequestDTO (Input)
```java
public class DepartmentRequestDTO {
    private String name;
    private Long instituteId;
    // Constructors, getters, setters...
}
```

### DepartmentResponseDTO (Output)
```java
public class DepartmentResponseDTO {
    private Long id;
    private String name;
    private Long instituteId;
    private String instituteName;        // Related entity name
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // Constructors, getters, setters...
}
```

---

## 2. Service Layer - DepartmentService

### Conversion Methods
```java
// Entity → ResponseDTO
private DepartmentResponseDTO convertToResponseDTO(Department department) {
    if (department == null) {
        return null;
    }
    String instituteName = department.getInstitute() != null ? 
        department.getInstitute().getName() : null;
    Long instituteId = department.getInstitute() != null ? 
        department.getInstitute().getId() : null;
    
    return new DepartmentResponseDTO(
            department.getId(),
            department.getName(),
            instituteId,
            instituteName,
            department.getCreatedAt(),
            department.getUpdatedAt()
    );
}

// RequestDTO → Entity
private Department convertToEntity(DepartmentRequestDTO dto) {
    if (dto == null) {
        return null;
    }
    
    // Fetch institute by ID with error handling
    Institute institute = null;
    if (dto.getInstituteId() != null) {
        institute = instituteRepository.findById(dto.getInstituteId())
                .orElseThrow(() -> new RuntimeException(
                    "Institute not found with ID: " + dto.getInstituteId()));
    } else {
        throw new IllegalArgumentException("Institute ID is required");
    }

    Department department = new Department();
    department.setName(dto.getName());
    department.setInstitute(institute);
    return department;
}
```

### Create Method
```java
public DepartmentResponseDTO createDepartment(DepartmentRequestDTO requestDTO) {
    // Validate input
    if (requestDTO.getName() == null || requestDTO.getName().isBlank()) {
        throw new IllegalArgumentException("Department name is required");
    }

    // Check for duplicates
    if (departmentRepository.existsByName(requestDTO.getName())) {
        throw new IllegalArgumentException(
            "Department with name '" + requestDTO.getName() + "' already exists");
    }

    // Convert to entity and save
    Department department = convertToEntity(requestDTO);
    Department savedDepartment = departmentRepository.save(department);
    
    // Convert back to ResponseDTO for response
    return convertToResponseDTO(savedDepartment);
}
```

### Get All Method
```java
public List<DepartmentResponseDTO> getAllDepartments() {
    return departmentRepository.findAll()
            .stream()
            .map(this::convertToResponseDTO)
            .collect(Collectors.toList());
}
```

### Update Method
```java
public DepartmentResponseDTO updateDepartment(Long id, DepartmentRequestDTO requestDTO) {
    // Find existing department
    Department department = departmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Department not found with ID: " + id));

    // Check for duplicate name
    if (!department.getName().equals(requestDTO.getName()) &&
            departmentRepository.existsByName(requestDTO.getName())) {
        throw new IllegalArgumentException(
            "Department with name '" + requestDTO.getName() + "' already exists");
    }

    // Update fields
    department.setName(requestDTO.getName());

    // Update institute if provided
    if (requestDTO.getInstituteId() != null) {
        Institute institute = instituteRepository.findById(requestDTO.getInstituteId())
                .orElseThrow(() -> new RuntimeException(
                    "Institute not found with ID: " + requestDTO.getInstituteId()));
        department.setInstitute(institute);
    }

    // Save and return response
    Department updatedDepartment = departmentRepository.save(department);
    return convertToResponseDTO(updatedDepartment);
}
```

---

## 3. Controller Layer - DepartmentController

### Create Endpoint
```java
@PostMapping
public ResponseEntity<DepartmentResponseDTO> createDepartment(
        @RequestBody DepartmentRequestDTO requestDTO) {
    try {
        DepartmentResponseDTO createdDepartment = departmentService.createDepartment(requestDTO);
        return new ResponseEntity<>(createdDepartment, HttpStatus.CREATED);
    } catch (IllegalArgumentException e) {
        // Validation error
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    } catch (RuntimeException e) {
        // Server error (e.g., related entity not found)
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

### Get All Endpoint
```java
@GetMapping
public ResponseEntity<List<DepartmentResponseDTO>> getAllDepartments() {
    List<DepartmentResponseDTO> departments = departmentService.getAllDepartments();
    return new ResponseEntity<>(departments, HttpStatus.OK);
}
```

### Get By ID Endpoint
```java
@GetMapping("/{id}")
public ResponseEntity<DepartmentResponseDTO> getDepartmentById(@PathVariable Long id) {
    Optional<DepartmentResponseDTO> department = departmentService.getDepartmentById(id);
    return department.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
            .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
}
```

### Update Endpoint
```java
@PutMapping("/{id}")
public ResponseEntity<DepartmentResponseDTO> updateDepartment(
        @PathVariable Long id, 
        @RequestBody DepartmentRequestDTO requestDTO) {
    try {
        DepartmentResponseDTO updatedDepartment = 
            departmentService.updateDepartment(id, requestDTO);
        return new ResponseEntity<>(updatedDepartment, HttpStatus.OK);
    } catch (IllegalArgumentException e) {
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    } catch (RuntimeException e) {
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
```

### Delete Endpoint
```java
@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
    try {
        departmentService.deleteDepartment(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    } catch (RuntimeException e) {
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
```

---

## 4. API Usage Examples

### Create Department
```bash
POST /api/departments
Content-Type: application/json

{
  "name": "Computer Science",
  "instituteId": 1
}
```

**Response (201 Created):**
```json
{
  "id": 5,
  "name": "Computer Science",
  "instituteId": 1,
  "instituteName": "MIT",
  "createdAt": "2026-03-22T21:41:32",
  "updatedAt": "2026-03-22T21:41:32"
}
```

### Get All Departments
```bash
GET /api/departments
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Engineering",
    "instituteId": 1,
    "instituteName": "MIT",
    "createdAt": "2026-03-20T10:00:00",
    "updatedAt": "2026-03-20T10:00:00"
  },
  {
    "id": 5,
    "name": "Computer Science",
    "instituteId": 1,
    "instituteName": "MIT",
    "createdAt": "2026-03-22T21:41:32",
    "updatedAt": "2026-03-22T21:41:32"
  }
]
```

### Update Department
```bash
PUT /api/departments/5
Content-Type: application/json

{
  "name": "Computer Science & AI",
  "instituteId": 1
}
```

**Response (200 OK):**
```json
{
  "id": 5,
  "name": "Computer Science & AI",
  "instituteId": 1,
  "instituteName": "MIT",
  "createdAt": "2026-03-22T21:41:32",
  "updatedAt": "2026-03-22T21:45:00"
}
```

### Error: Missing Required Field
```bash
POST /api/departments
Content-Type: application/json

{
  "name": "Data Science"
}
```

**Response (400 Bad Request):**
```
{
  "timestamp": "2026-03-22T21:42:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Institute ID is required for department creation"
}
```

### Error: Duplicate Name
```bash
POST /api/departments
Content-Type: application/json

{
  "name": "Computer Science",
  "instituteId": 1
}
```

**Response (400 Bad Request):**
```
{
  "timestamp": "2026-03-22T21:43:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Department with name 'Computer Science' already exists"
}
```

### Error: Related Entity Not Found
```bash
POST /api/departments
Content-Type: application/json

{
  "name": "Mathematics",
  "instituteId": 999
}
```

**Response (500 Internal Server Error):**
```
{
  "timestamp": "2026-03-22T21:44:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Institute not found with ID: 999"
}
```

---

## 5. Key Implementation Patterns

### Pattern 1: Null Safety for Related Entities
```java
String instituteName = department.getInstitute() != null ? 
    department.getInstitute().getName() : null;
```

### Pattern 2: Fetch and Validate
```java
Institute institute = instituteRepository.findById(dto.getInstituteId())
    .orElseThrow(() -> new RuntimeException(
        "Institute not found with ID: " + dto.getInstituteId()));
```

### Pattern 3: Stream Conversion
```java
return departmentRepository.findAll()
    .stream()
    .map(this::convertToResponseDTO)
    .collect(Collectors.toList());
```

### Pattern 4: Conditional Update
```java
if (requestDTO.getInstituteId() != null) {
    Institute institute = instituteRepository.findById(requestDTO.getInstituteId())
        .orElseThrow(() -> new RuntimeException("Institute not found"));
    department.setInstitute(institute);
}
```

### Pattern 5: Duplicate Check
```java
if (departmentRepository.existsByName(requestDTO.getName())) {
    throw new IllegalArgumentException(
        "Department with name '" + requestDTO.getName() + "' already exists");
}
```

---

## 6. Comparison: Before vs After

### Before (Entity-Based)
```java
// Request/Response used same entity
@PostMapping
public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
    return new ResponseEntity<>(departmentService.createDepartment(department), 
        HttpStatus.CREATED);
}
```

**Issues:**
- ❌ Clients could send unnecessary fields (id, timestamps)
- ❌ Clients see full entity structure including relationships
- ❌ Password exposed for User entity
- ❌ Circular references possible

### After (DTO-Based)
```java
// Request and response use dedicated DTOs
@PostMapping
public ResponseEntity<DepartmentResponseDTO> createDepartment(
        @RequestBody DepartmentRequestDTO requestDTO) {
    try {
        DepartmentResponseDTO created = departmentService.createDepartment(requestDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    } catch (IllegalArgumentException e) {
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    } catch (RuntimeException e) {
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

**Improvements:**
- ✅ Clear input/output contracts
- ✅ Security: sensitive data not exposed
- ✅ Flexibility: DTOs can differ from entities
- ✅ No circular references
- ✅ Better error handling

---

## 7. All Endpoints Summary

### Department API
- `GET /api/departments` - Get all departments
- `GET /api/departments/{id}` - Get by ID
- `GET /api/departments/name/{name}` - Get by name
- `GET /api/departments/institute/{instituteId}` - Get by institute
- `POST /api/departments` - Create
- `PUT /api/departments/{id}` - Update
- `DELETE /api/departments/{id}` - Delete
- `GET /api/departments/exists/{name}` - Check existence

### All other entities follow the same pattern
- Institute, User, Venue, Event

---

## 8. Testing with cURL

```bash
# Set base URL
BASE_URL="http://localhost:8080"

# Create Institute
curl -X POST $BASE_URL/api/institutes \
  -H "Content-Type: application/json" \
  -d '{"name": "MIT"}'

# Create Department
curl -X POST $BASE_URL/api/departments \
  -H "Content-Type: application/json" \
  -d '{"name": "Computer Science", "instituteId": 1}'

# Get all departments
curl $BASE_URL/api/departments

# Update department
curl -X PUT $BASE_URL/api/departments/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "CS & AI", "instituteId": 1}'

# Delete department
curl -X DELETE $BASE_URL/api/departments/1

# Create User
curl -X POST $BASE_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@mit.edu",
    "password": "secure123",
    "departmentId": 1,
    "role": "ADMIN"
  }'

# Get user
curl "$BASE_URL/api/users/1"
```

---

This reference document provides complete examples for understanding and using the DTO pattern in this project.

