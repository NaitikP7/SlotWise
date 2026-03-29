# Database Migration Guide: Venue Department → Institute

## Overview
This guide provides both automatic (Hibernate) and manual (SQL) migration paths for converting the Venue entity from Department to Institute relationship.

---

## Option 1: Automatic Migration (Recommended)

### How It Works:
- **Spring Boot Configuration**: `spring.jpa.hibernate.ddl-auto=update`
- **Hibernate Action**: Automatically detects schema changes and applies them
- **User Action**: Just run the application

### Steps:
1. Ensure MySQL is running
2. Ensure database exists: `CREATE DATABASE IF NOT EXISTS slotwise;`
3. Run the application: `mvn spring-boot:run`
4. Check logs for successful schema update
5. Hibernate will:
   - ✅ Drop old `department_id` foreign key
   - ✅ Drop `department_id` column
   - ✅ Create `institute_id` column
   - ✅ Create new foreign key

### Expected Log Output:
```
...
[main] o.h.d.e.TableMetaData : columns: [id, name, capacity, location, institute_id, created_at, updated_at]
[main] o.h.d.e.TableMetaData : Foreign keys: [[institute_id] -> INSTITUTES(id)]
...
Hibernate: alter table venues drop foreign key venues_ibfk_1
Hibernate: alter table venues drop column department_id
Hibernate: alter table venues add column institute_id bigint not null
Hibernate: alter table venues add constraint venues_institute_fk foreign key (institute_id) references institutes (id)
...
```

---

## Option 2: Manual SQL Migration

### Use If:
- You prefer manual control over schema changes
- You have production data to migrate carefully
- Automatic migration fails

### Pre-Migration Checks:
```sql
-- Check current schema
DESCRIBE venues;
SHOW CREATE TABLE venues\G

-- Check for existing data
SELECT COUNT(*) FROM venues;
SELECT * FROM venues LIMIT 5;
```

### Migration Steps:

#### Step 1: Backup Existing Data
```sql
-- Create backup table
CREATE TABLE venues_backup AS SELECT * FROM venues;

-- Verify backup
SELECT COUNT(*) FROM venues_backup;
```

#### Step 2: Add New Column
```sql
-- Add institute_id column
ALTER TABLE venues ADD COLUMN institute_id BIGINT;

-- Verify column added
DESCRIBE venues;
```

#### Step 3: Migrate Data
```sql
-- Update institute_id from department's institute_id
UPDATE venues v
JOIN departments d ON v.department_id = d.id
SET v.institute_id = d.institute_id
WHERE v.institute_id IS NULL;

-- Verify migration
SELECT COUNT(*) FROM venues WHERE institute_id IS NULL;
SELECT COUNT(*) FROM venues WHERE institute_id IS NOT NULL;

-- Check a few records
SELECT v.id, v.name, v.department_id, v.institute_id, d.name as dept_name, i.name as inst_name
FROM venues v
LEFT JOIN departments d ON v.department_id = d.id
LEFT JOIN institutes i ON v.institute_id = i.id
LIMIT 5;
```

#### Step 4: Update Foreign Key Constraints
```sql
-- Drop old foreign key
ALTER TABLE venues DROP FOREIGN KEY venues_ibfk_1;

-- Verify dropped
SHOW CREATE TABLE venues\G

-- Add new foreign key
ALTER TABLE venues 
ADD CONSTRAINT venues_institute_fk 
FOREIGN KEY (institute_id) REFERENCES institutes(id);

-- Verify added
SHOW CREATE TABLE venues\G
```

#### Step 5: Make institute_id NOT NULL
```sql
-- Update column to NOT NULL
ALTER TABLE venues MODIFY COLUMN institute_id BIGINT NOT NULL;

-- Verify
DESCRIBE venues;
```

#### Step 6: Drop Old Column
```sql
-- Drop department_id column
ALTER TABLE venues DROP COLUMN department_id;

-- Verify
DESCRIBE venues;
SHOW CREATE TABLE venues\G
```

#### Step 7: Verify Final Schema
```sql
-- Check final structure
DESCRIBE venues;

-- Expected output:
-- Field        | Type       | Null | Key | Default | Extra
-- id           | bigint     | NO   | PRI | NULL    | auto_increment
-- name         | varchar(255) | NO | | NULL |
-- capacity     | int        | NO   | | NULL |
-- location     | varchar(255) | NO | | NULL |
-- institute_id | bigint     | NO   | MUL | NULL |
-- created_at   | datetime   | NO   | | NULL |
-- updated_at   | datetime   | YES  | | NULL |

-- Verify foreign key
SELECT CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'venues' AND COLUMN_NAME = 'institute_id';
```

---

## Option 3: Zero-Downtime Migration (Advanced)

### For Production Environments:

#### Phase 1: Add New Infrastructure (No Changes Needed)
```sql
-- Add institute_id column (allows nulls initially)
ALTER TABLE venues ADD COLUMN institute_id BIGINT;
ALTER TABLE venues ADD INDEX idx_institute (institute_id);
```

#### Phase 2: Dual Write
- Update application code to write to both `department_id` and `institute_id`
- Deploy new code
- Keep old column for backward compatibility

#### Phase 3: Backfill Historical Data
```sql
-- Migrate existing data in batches
UPDATE venues v
JOIN departments d ON v.department_id = d.id
SET v.institute_id = d.institute_id
WHERE v.institute_id IS NULL
LIMIT 1000;

-- Repeat until all rows updated
-- Check progress:
SELECT 
  (SELECT COUNT(*) FROM venues WHERE institute_id IS NULL) as remaining,
  (SELECT COUNT(*) FROM venues) as total;
```

#### Phase 4: Validate Data Integrity
```sql
-- Check for mismatches
SELECT v.id, v.name, v.department_id, v.institute_id, d.institute_id as expected_institute
FROM venues v
JOIN departments d ON v.department_id = d.id
WHERE v.institute_id != d.institute_id;

-- Should return 0 rows
```

#### Phase 5: Switch Over
```sql
-- Make institute_id NOT NULL
ALTER TABLE venues MODIFY COLUMN institute_id BIGINT NOT NULL;

-- Drop old constraints and column
ALTER TABLE venues DROP FOREIGN KEY venues_ibfk_1;
ALTER TABLE venues DROP COLUMN department_id;

-- Add new constraint
ALTER TABLE venues 
ADD CONSTRAINT venues_institute_fk 
FOREIGN KEY (institute_id) REFERENCES institutes(id);
```

#### Phase 6: Deploy Final Code
- Update application to remove dual-write code
- Update DTOs and services to use `instituteId`
- Deploy and verify

---

## Rollback Plan (If Needed)

### If Migration Fails:

```sql
-- Restore from backup
DROP TABLE venues;
RENAME TABLE venues_backup TO venues;

-- Verify
SELECT COUNT(*) FROM venues;
DESCRIBE venues;
```

### Or Manual Rollback:

```sql
-- If partial migration, restore department_id
UPDATE venues v
JOIN departments d ON v.institute_id = d.institute_id
SET v.department_id = d.id
WHERE v.department_id IS NULL;

-- Add back old foreign key
ALTER TABLE venues 
ADD CONSTRAINT venues_ibfk_1 
FOREIGN KEY (department_id) REFERENCES departments(id);
```

---

## Verification Checklist

After migration, verify:

```sql
-- Check schema
DESCRIBE venues;
-- Should show: institute_id (BIGINT, NO, MUL)
-- Should NOT show: department_id

-- Check data
SELECT COUNT(*) FROM venues WHERE institute_id IS NULL;
-- Should return: 0

-- Check foreign key
SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'venues' AND COLUMN_NAME = 'institute_id';
-- Should return: venues_institute_fk

-- Check relationships
SELECT v.id, v.name, i.name as institute_name
FROM venues v
JOIN institutes i ON v.institute_id = i.id
LIMIT 5;
-- Should return venues with their institutes
```

---

## Common Issues and Solutions

### Issue 1: Foreign Key Constraint Error
```
Error: Cannot delete or update a parent row
```
**Solution**: Check if any venues have null institute_id before setting NOT NULL

```sql
SELECT COUNT(*) FROM venues WHERE institute_id IS NULL;
-- Fix any nulls before proceeding
```

### Issue 2: Duplicate Key Error
```
Error: Duplicate entry for key
```
**Solution**: Data migration might be creating duplicates. Review:

```sql
SELECT institute_id, COUNT(*) as count
FROM venues
GROUP BY institute_id
HAVING count > 1;
```

### Issue 3: Lock Timeout
```
Error: Lock wait timeout exceeded
```
**Solution**: Use smaller batch sizes for large tables

```sql
-- Migrate in smaller batches
UPDATE venues v
JOIN departments d ON v.department_id = d.id
SET v.institute_id = d.institute_id
WHERE v.institute_id IS NULL
LIMIT 100;

-- Wait a few seconds, then repeat
```

---

## Application Changes Required

### Update Entity:
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "institute_id", nullable = false)  // Changed from department_id
private Institute institute;
```

### Update DTOs:
```java
// VenueRequestDTO
private Long instituteId;  // Changed from departmentId

// VenueResponseDTO
private Long instituteId;  // Changed from departmentId
private String instituteName;  // Changed from departmentName
```

### Update Service:
```java
// Fetch institute instead of department
Institute institute = instituteRepository.findById(dto.getInstituteId())
    .orElseThrow(() -> new RuntimeException("Institute not found"));
venue.setInstitute(institute);
```

### Update Repository:
```java
// Changed method signature
List<Venue> findByInstituteId(Long instituteId);  // Was findByDepartmentId()
```

---

## Testing

### Test SQL Queries:

```sql
-- Create test institute
INSERT INTO institutes (name, created_at, updated_at) VALUES 
('Test Institute', NOW(), NOW());

-- Create test department
INSERT INTO departments (name, institute_id, created_at, updated_at) VALUES 
('Test Department', LAST_INSERT_ID(), NOW(), NOW());

-- Create test venue (with new schema)
INSERT INTO venues (name, capacity, location, institute_id, created_at, updated_at) VALUES 
('Test Venue', 100, 'Test Location', 1, NOW(), NOW());

-- Verify relationships
SELECT v.id, v.name, i.name as institute, d.name as department
FROM venues v
JOIN institutes i ON v.institute_id = i.id
LEFT JOIN departments d ON d.institute_id = i.id
LIMIT 10;
```

---

## Performance Considerations

- **Index**: `institute_id` is indexed automatically (MUL in DESCRIBE)
- **Query Performance**: Joins on `institute_id` will be fast
- **Migration Time**: For large tables (100k+ rows), use batch processing
- **Downtime**: ~1-5 seconds for typical installations with automatic migration

---

## Final Confirmation

When migration is complete:

✅ Database schema updated
✅ All code changes deployed
✅ No errors in application logs
✅ API endpoints working with new `instituteId` parameter
✅ Events can be created with venues
✅ All tests passing

