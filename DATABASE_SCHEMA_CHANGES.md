# Database Schema Changes: Venue Entity Refactoring

## Summary
The Venue entity has been refactored to belong to **Institute** instead of **Department**. This is more logical because venues are physical locations/buildings that belong to an entire institute, not a specific department within it.

---

## Database Schema Changes

### Before:
```sql
CREATE TABLE venues (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    department_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);
```

### After:
```sql
CREATE TABLE venues (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    institute_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (institute_id) REFERENCES institutes(id)
);
```

### Change Details:
- **Column Changed**: `department_id` → `institute_id`
- **Foreign Key Updated**: Points to `institutes` table instead of `departments` table
- **Relationship Type**: Remains `@ManyToOne` (many venues belong to one institute)

---

## How Hibernate Will Apply These Changes

Since `spring.jpa.hibernate.ddl-auto=update` is configured:

1. **On Application Startup**, Hibernate will:
   - Detect that the `department_id` column exists but `institute_id` is expected
   - Drop the old foreign key constraint on `department_id`
   - Drop the old `department_id` column
   - Create the new `institute_id` column
   - Create a new foreign key constraint pointing to `institutes` table

2. **Required Steps**:
   - Ensure MySQL is running
   - Ensure the `slotwise` database exists
   - Run the Spring Boot application
   - Let Hibernate handle the schema migration automatically

---

## Entity Relationship Changes

### New Relationship Structure:

```
Institute (1) ──────────── (Many) Venue
   ↓
   ├── Venues (physical locations)
   └── Departments (organizational units)
```

### Before (Incorrect):
- Event → Venue → Department → Institute (Confusing path)

### After (Logical):
- Event → Venue → Institute (Direct path)
- Event → Organizer (User) → Department → Institute

---

## Code Changes Made

### 1. Entity Layer
- **Venue.java**: Changed from `Department department` to `Institute institute`
- Join column: `@JoinColumn(name = "institute_id", nullable = false)`

### 2. DTO Layer
- **VenueRequestDTO.java**: 
  - `private Long departmentId` → `private Long instituteId`
  - Getters/setters updated
  
- **VenueResponseDTO.java**:
  - `private Long departmentId` → `private Long instituteId`
  - `private String departmentName` → `private String instituteName`
  - Getters/setters updated

### 3. Service Layer
- **VenueService.java**:
  - Imports updated to use `InstituteRepository`
  - `convertToEntity()`: Fetches Institute by `instituteId`
  - `convertToResponseDTO()`: Maps `institute.name` to `instituteName`
  - Method renamed: `getVenuesByDepartment()` → `getVenuesByInstitute()`

### 4. Repository Layer
- **VenueRepository.java**:
  - Method signature: `findByDepartmentId()` → `findByInstituteId()`

### 5. Controller Layer
- **VenueController.java**:
  - Endpoint updated: `/api/venues/department/{id}` → `/api/venues/institute/{id}`

---

## Migration Commands (If Manual Migration Needed)

If you need to manually apply the changes to an existing database:

```sql
-- Add new institute_id column
ALTER TABLE venues ADD COLUMN institute_id BIGINT;

-- Copy data from departments to institutes (departments have institute_id)
UPDATE venues v
JOIN departments d ON v.department_id = d.id
SET v.institute_id = d.institute_id;

-- Drop old foreign key
ALTER TABLE venues DROP FOREIGN KEY venues_ibfk_1;

-- Drop old column
ALTER TABLE venues DROP COLUMN department_id;

-- Add new foreign key
ALTER TABLE venues 
ADD CONSTRAINT venues_institute_fk 
FOREIGN KEY (institute_id) REFERENCES institutes(id);

-- Make institute_id NOT NULL (if needed)
ALTER TABLE venues MODIFY COLUMN institute_id BIGINT NOT NULL;
```

---

## API Usage Examples

### Create a Venue (New Format):

**Request:**
```json
POST /api/venues
{
  "name": "Main Auditorium",
  "capacity": 500,
  "location": "Building A, Floor 3",
  "instituteId": 1
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Main Auditorium",
  "capacity": 500,
  "location": "Building A, Floor 3",
  "instituteId": 1,
  "instituteName": "Engineering Institute",
  "createdAt": "2026-03-23T10:00:00",
  "updatedAt": "2026-03-23T10:00:00"
}
```

### Get Venues by Institute:

```
GET /api/venues/institute/1

Response:
[
  {
    "id": 1,
    "name": "Main Auditorium",
    "capacity": 500,
    "location": "Building A, Floor 3",
    "instituteId": 1,
    "instituteName": "Engineering Institute",
    ...
  },
  {
    "id": 2,
    "name": "Lab Room 101",
    "capacity": 50,
    "location": "Building B, Floor 1",
    "instituteId": 1,
    "instituteName": "Engineering Institute",
    ...
  }
]
```

---

## Verification Checklist

After changes are applied:

- [ ] Application starts successfully
- [ ] No SQL errors in logs
- [ ] Venues table is updated with `institute_id` column
- [ ] Foreign key constraint on `institutes` table is created
- [ ] Old `department_id` column is removed
- [ ] Create venue endpoint works with new `instituteId` parameter
- [ ] Get venues by institute endpoint works
- [ ] Events can be created with associated venues

---

## Important Notes

1. **Data Loss**: Any existing venue data will need to be migrated during the schema update
2. **Backward Compatibility**: Old API calls using `departmentId` will fail - update client code
3. **Cascading**: If cascade delete is set on Institute, deleting an institute will delete all its venues
4. **Null Safety**: Venues MUST have an `institute_id` (not nullable by default)

---

## Event Creation Error Troubleshooting

If you receive errors when creating events, check:

1. **Venue Must Exist**: Ensure the `venueId` provided in EventRequestDTO points to an existing venue
2. **Organizer Must Exist**: Ensure the `organizerId` points to an existing user
3. **Time Validation**: Ensure `endTime` is after `startTime`
4. **Database Connection**: Verify MySQL is running and the database exists

Example EventRequestDTO:
```json
{
  "title": "Conference 2026",
  "description": "Annual tech conference",
  "startTime": "2026-04-15T09:00:00",
  "endTime": "2026-04-15T18:00:00",
  "location": "Main Hall",
  "organizerId": 1,
  "venueId": 1,
  "active": true
}
```

