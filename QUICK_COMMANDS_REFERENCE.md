# 🎯 QUICK COMMANDS REFERENCE

## BUILD & RUN

### Clean Build
```bash
cd C:\Users\naiti\Downloads\sw\sw
mvn clean compile
```

### Run Application
```bash
mvn spring-boot:run
```

### Expected Output
```
Tomcat started on port(s): 8080
Application availability state LivenessState: CORRECT
```

---

## TESTING ENDPOINTS

### Using curl (5-Step Test Sequence)

#### Step 1: Create Institute
```bash
curl -X POST http://localhost:8080/api/institutes \
  -H "Content-Type: application/json" \
  -d '{"name":"Engineering Institute"}'
```

#### Step 2: Create Department (with instituteId)
```bash
curl -X POST http://localhost:8080/api/departments \
  -H "Content-Type: application/json" \
  -d '{"name":"Computer Science","instituteId":1}'
```

#### Step 3: Create User (with departmentId)
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@test.com","password":"pass123","departmentId":1,"role":"ADMIN"}'
```

#### Step 4: Create Venue (with NEW instituteId - NOT departmentId) ⭐
```bash
curl -X POST http://localhost:8080/api/venues \
  -H "Content-Type: application/json" \
  -d '{"name":"Main Hall","capacity":500,"location":"Building A","instituteId":1}'
```

#### Step 5: Create Event (with organizerId and venueId)
```bash
curl -X POST http://localhost:8080/api/events \
  -H "Content-Type: application/json" \
  -d '{"title":"Tech Conference","startTime":"2026-04-15T09:00:00","endTime":"2026-04-15T18:00:00","organizerId":1,"venueId":1,"active":true}'
```

---

## DATABASE VERIFICATION

### Connect to MySQL
```bash
mysql -u root -p
```

### Select Database
```sql
use slotwise;
```

### Check Venues Schema
```sql
DESCRIBE venues;
```

**Should show**: `institute_id` (NOT `department_id`)

### Verify Foreign Key
```sql
SHOW CREATE TABLE venues\G
```

**Should contain**: `venues_institute_fk FOREIGN KEY (institute_id) REFERENCES institutes`

### Check Data Relationships
```sql
SELECT v.id, v.name, i.name as institute
FROM venues v
JOIN institutes i ON v.institute_id = i.id;
```

---

## COMMON API CALLS

### Get All Institutes
```bash
curl http://localhost:8080/api/institutes
```

### Get All Venues
```bash
curl http://localhost:8080/api/venues
```

### Get Venues by Institute (NEW)
```bash
curl http://localhost:8080/api/venues/institute/1
```

### Get All Events
```bash
curl http://localhost:8080/api/events
```

### Get All Active Events
```bash
curl http://localhost:8080/api/events/active
```

---

## KEY CHANGES AT A GLANCE

| Aspect | Old | New |
|--------|-----|-----|
| **Entity Field** | `Department department` | `Institute institute` |
| **FK Column** | `department_id` | `institute_id` |
| **DTO Parameter** | `departmentId` | `instituteId` |
| **Endpoint** | `/api/venues/department/1` | `/api/venues/institute/1` |
| **Service Method** | `getVenuesByDepartment()` | `getVenuesByInstitute()` |
| **Repository Method** | `findByDepartmentId()` | `findByInstituteId()` |

---

## TROUBLESHOOTING QUICK FIXES

### Won't Compile?
```bash
mvn clean compile
```

### App Won't Start?
- Verify MySQL running: `mysql -u root -p`
- Create DB: `CREATE DATABASE slotwise;`
- Check port 8080 free: `netstat -ano | findstr :8080`

### Venue Creation Fails?
- ✅ Institute exists? `POST /api/institutes` first
- ✅ Using `instituteId`? (Not `departmentId`)

### Event Creation Fails?
- ✅ User exists? `POST /api/users` first
- ✅ Venue exists? `POST /api/venues` first
- ✅ Time range valid? `endTime > startTime`

---

## FILE LOCATIONS

| File | Path |
|------|------|
| **Source** | `C:\Users\naiti\Downloads\sw\sw\src\main\java\com\slotwise\sw` |
| **Config** | `C:\Users\naiti\Downloads\sw\sw\src\main\resources\application.properties` |
| **Target** | `C:\Users\naiti\Downloads\sw\sw\target` |
| **Documentation** | `C:\Users\naiti\Downloads\sw\` |

---

## IMPORTANT CHANGES MADE

✅ **Venue.java** - Entity field updated
✅ **VenueRequestDTO.java** - Request parameter updated
✅ **VenueResponseDTO.java** - Response model updated
✅ **VenueService.java** - Service logic updated
✅ **VenueRepository.java** - Database query updated
✅ **VenueController.java** - Endpoint path updated

---

## DATABASE MIGRATION

### Automatic (On App Startup)
- Hibernate detects schema mismatch
- Drops old `department_id` FK
- Drops old `department_id` column
- Creates new `institute_id` column
- Creates new FK to `institutes`

### No Manual SQL Needed ✅

---

## DEPLOYMENT CHECKLIST

- [ ] Run: `mvn clean compile` (should say BUILD SUCCESS)
- [ ] Run: `mvn spring-boot:run` (should start on port 8080)
- [ ] Test: Follow 5-step sequence above
- [ ] Verify: `DESCRIBE venues;` shows `institute_id`
- [ ] Confirm: All 5 test steps pass
- [ ] Monitor: Check application logs for errors
- [ ] Success: Ready for production!

---

## DOCUMENTATION FILES

| File | Purpose |
|------|---------|
| `FINAL_IMPLEMENTATION_REPORT.md` | Complete implementation report |
| `DEPLOYMENT_AND_TESTING_GUIDE.md` | Step-by-step deployment guide |
| `DATABASE_MIGRATION_GUIDE.md` | Migration instructions |
| `VENUE_REFACTORING_COMPLETE.md` | Refactoring summary |
| `VENUE_CHANGES_QUICK_REF.md` | Quick reference |
| `DATABASE_SCHEMA_CHANGES.md` | Schema change details |

---

## EXECUTION SUMMARY

```
mvn clean compile           ← BUILD SUCCESS
  ↓
mvn spring-boot:run        ← TOMCAT STARTED
  ↓
Test 5 Steps (curl)        ← ALL ENDPOINTS WORK
  ↓
Verify Database            ← SCHEMA UPDATED
  ↓
DEPLOYMENT READY ✅        ← GO LIVE!
```

---

**Last Updated**: March 23, 2026
**Status**: ✅ Ready for Production
**Build**: 0.0.1-SNAPSHOT

