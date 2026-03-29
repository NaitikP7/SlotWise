# Quick Reference: Venue Refactoring

## What Changed?

| Aspect | Before | After |
|--------|--------|-------|
| **FK Column** | `department_id` | `institute_id` |
| **Entity Relationship** | Venue → Department | Venue → Institute |
| **DTO Field** | `departmentId` | `instituteId` |
| **API Endpoint** | `/api/venues/department/{id}` | `/api/venues/institute/{id}` |

---

## Database Schema Change

**Old:**
```sql
ALTER TABLE venues 
FOREIGN KEY (department_id) REFERENCES departments(id);
```

**New:**
```sql
ALTER TABLE venues 
FOREIGN KEY (institute_id) REFERENCES institutes(id);
```

---

## Files Changed

✅ `Venue.java` - Entity
✅ `VenueRequestDTO.java` - Request DTO
✅ `VenueResponseDTO.java` - Response DTO
✅ `VenueService.java` - Service
✅ `VenueRepository.java` - Repository
✅ `VenueController.java` - Controller

---

## API Usage

### Create Venue
```bash
POST /api/venues
{
  "name": "Auditorium A",
  "capacity": 500,
  "location": "Building 1",
  "instituteId": 1          # CHANGED from departmentId
}
```

### Get Venues by Institute
```bash
GET /api/venues/institute/1        # CHANGED from /department/1
```

---

## Database Migration

### Automatic (Recommended):
```bash
mvn spring-boot:run
# Hibernate handles schema update automatically
```

### Manual SQL:
```sql
-- Add new column
ALTER TABLE venues ADD COLUMN institute_id BIGINT;

-- Migrate data
UPDATE venues v JOIN departments d ON v.department_id = d.id
SET v.institute_id = d.institute_id;

-- Drop old
ALTER TABLE venues DROP FOREIGN KEY venues_ibfk_1;
ALTER TABLE venues DROP COLUMN department_id;

-- Add new FK
ALTER TABLE venues 
ADD CONSTRAINT venues_institute_fk 
FOREIGN KEY (institute_id) REFERENCES institutes(id);
```

---

## Event Creation

### Required Fields:
```json
{
  "title": "Conference",
  "startTime": "2026-04-15T09:00:00",
  "endTime": "2026-04-15T18:00:00",
  "organizerId": 1,           # User ID
  "venueId": 1                # Must exist
}
```

### Common Errors:
- **"Venue not found"**: Check venueId exists
- **"Organizer not found"**: Check organizerId exists
- **"End time must be after start"**: Fix time range

---

## Testing

```bash
# 1. Start app
mvn spring-boot:run

# 2. Create Institute
curl -X POST http://localhost:8080/api/institutes \
  -H "Content-Type: application/json" \
  -d '{"name":"Tech Institute"}'

# 3. Create Venue
curl -X POST http://localhost:8080/api/venues \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Main Hall",
    "capacity":100,
    "location":"Bldg A",
    "instituteId":1
  }'

# 4. Create Event
curl -X POST http://localhost:8080/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Tech Day",
    "startTime":"2026-04-15T09:00:00",
    "endTime":"2026-04-15T17:00:00",
    "organizerId":1,
    "venueId":1
  }'
```

---

## Verification

Check schema:
```sql
DESCRIBE venues;
-- Should show: institute_id (BIGINT, NO, MUL)
-- Should NOT show: department_id
```

Check relationships:
```sql
SELECT v.name, i.name as institute
FROM venues v
JOIN institutes i ON v.institute_id = i.id;
```

---

## Rollback (If Needed)

If migration fails:
```bash
# Stop application
# Run automatic rollback (Hibernate create-drop for fresh DB)
mvn clean install
mvn spring-boot:run
```

Or restore manually:
```sql
DROP TABLE venues;
RENAME TABLE venues_backup TO venues;
```

---

## Next Steps

1. ✅ Rebuild: `mvn clean compile`
2. ✅ Test: Run application
3. ✅ Verify: Check database schema
4. ✅ Deploy: Update client code with new `instituteId` parameter
5. ✅ Test APIs: Create venues and events

---

## Why This Change?

**Better Architecture:**
- Venues are physical locations (belong to Institute)
- Departments are organizational units (within Institute)
- Multiple departments can use same venue
- Cleaner data model

**Before:**
```
Event → Venue → Department → Institute
```

**After:**
```
Event → Venue → Institute
Event → Organizer(User) → Department
```

---

## Support

For issues:
1. Check `DATABASE_MIGRATION_GUIDE.md` for detailed migration steps
2. Check `VENUE_REFACTORING_COMPLETE.md` for troubleshooting
3. Check application logs for Hibernate schema update messages

