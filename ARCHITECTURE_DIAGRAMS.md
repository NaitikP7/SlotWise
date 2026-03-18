# Architecture & Data Flow Diagrams

## 🏗️ Spring Boot REST API Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│                    (Postman / Browser / cURL)                    │
└────────────────────────────┬──────────────────────────────────────┘
                             │
                    HTTP Request/Response
                             │
        ┌────────────────────▼──────────────────────┐
        │     REST CONTROLLER LAYER                 │
        │   (EventController)                       │
        │                                           │
        │  ├─ GET    /api/events                    │
        │  ├─ POST   /api/events                    │
        │  ├─ GET    /api/events/{id}               │
        │  ├─ PUT    /api/events/{id}               │
        │  ├─ DELETE /api/events/{id}               │
        │  ├─ GET    /api/events/active             │
        │  ├─ GET    /api/events/search/title       │
        │  ├─ GET    /api/events/search/location    │
        │  ├─ GET    /api/events/search/date-range  │
        │  └─ GET    /api/events/count/active       │
        │                                           │
        │  Handles HTTP requests & responses        │
        │  Calls Repository for data access         │
        └────────────────────┬──────────────────────┘
                             │
                    Object/Entity Mapping
                             │
        ┌────────────────────▼──────────────────────┐
        │  REPOSITORY LAYER                         │
        │  (EventRepository extends                 │
        │   JpaRepository<Event, Long>)             │
        │                                           │
        │  Database Query Methods:                  │
        │  ├─ save()                                │
        │  ├─ findAll()                             │
        │  ├─ findById()                            │
        │  ├─ findByActiveTrue()                    │
        │  ├─ findByTitleIgnoreCase()               │
        │  ├─ findByLocation()                      │
        │  ├─ findEventsBetweenDates()              │
        │  ├─ findByStartTimeAfter()                │
        │  ├─ findByEndTimeBefore()                 │
        │  ├─ countByActiveTrue()                   │
        │  └─ deleteById()                          │
        │                                           │
        │  Delegates to Hibernate/JPA               │
        └────────────────────┬──────────────────────┘
                             │
                    SQL Generation & Execution
                             │
        ┌────────────────────▼──────────────────────┐
        │  ENTITY/MODEL LAYER                       │
        │  (Event Entity)                           │
        │                                           │
        │  Fields:                                  │
        │  ├─ id: Long                              │
        │  ├─ title: String                         │
        │  ├─ description: String                   │
        │  ├─ startTime: LocalDateTime              │
        │  ├─ endTime: LocalDateTime                │
        │  ├─ location: String                      │
        │  ├─ active: Boolean                       │
        │  ├─ createdAt: LocalDateTime (auto)       │
        │  └─ updatedAt: LocalDateTime (auto)       │
        │                                           │
        │  @Entity - Maps to database table         │
        └────────────────────┬──────────────────────┘
                             │
                    Hibernate ORM Mapping
                             │
        ┌────────────────────▼──────────────────────┐
        │  DATABASE LAYER                           │
        │  (MySQL 8.0+)                             │
        │                                           │
        │  Database: slotwise                       │
        │  Table: events                            │
        │                                           │
        │  Schema:                                  │
        │  ├─ id: BIGINT AUTO_INCREMENT             │
        │  ├─ title: VARCHAR(255) NOT NULL          │
        │  ├─ description: LONGTEXT                 │
        │  ├─ start_time: DATETIME NOT NULL         │
        │  ├─ end_time: DATETIME NOT NULL           │
        │  ├─ location: VARCHAR(255)                │
        │  ├─ active: BOOLEAN DEFAULT 1             │
        │  ├─ created_at: DATETIME NOT NULL         │
        │  └─ updated_at: DATETIME                  │
        │                                           │
        │  Connection:                              │
        │  jdbc:mysql://localhost:3306/slotwise     │
        │  Driver: com.mysql.cj.jdbc.Driver         │
        └───────────────────────────────────────────┘
```

---

## 🔄 Request-Response Flow

### Create Event (POST)
```
┌─────────────────────────────────────────────────────────┐
│ Client sends JSON payload with event details            │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ EventController.createEvent() receives @RequestBody     │
│ Validates incoming Event object                         │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ EventRepository.save(event) is called                   │
│ Delegates to JPA/Hibernate                              │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Hibernate generates INSERT SQL:                         │
│ INSERT INTO events (title, description, ...) VALUES ... │
│ @PrePersist sets createdAt & updatedAt                 │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ MySQL executes INSERT statement                         │
│ Returns generated ID (auto_increment)                   │
│ Row added to events table                               │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ JPA converts result to Event entity object              │
│ Returns to Controller                                   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Controller returns ResponseEntity with:                 │
│ ├─ HTTP Status: 201 CREATED                            │
│ └─ Body: Complete Event object (JSON)                  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Client receives JSON response with created event        │
│ Including generated ID and timestamps                   │
└─────────────────────────────────────────────────────────┘
```

---

## 📖 Get All Events Flow (GET)

```
Client Request: GET /api/events
       │
       ▼
EventController.getAllEvents()
       │
       ▼
EventRepository.findAll()
       │
       ▼
Hibernate generates: SELECT * FROM events
       │
       ▼
MySQL executes query
       │
       ▼
Returns all rows from events table
       │
       ▼
JPA converts rows to List<Event>
       │
       ▼
Controller wraps in ResponseEntity
       │
       ▼
HTTP 200 OK + JSON array
       │
       ▼
Client receives all events
```

---

## 🔍 Search Query Flow (GET with Query Method)

```
Client: GET /api/events/search/title?title=Meeting
           │
           ▼
EventController.getEventsByTitle("Meeting")
           │
           ▼
EventRepository.findByTitleIgnoreCase("Meeting")
           │
           ▼
Spring Data JPA query derivation
           │
           ▼
Hibernate generates:
SELECT e FROM Event e WHERE LOWER(e.title) = LOWER('Meeting')
           │
           ▼
MySQL executes:
SELECT * FROM events WHERE LOWER(title) = LOWER('Meeting')
           │
           ▼
Returns matching rows
           │
           ▼
JPA converts to List<Event>
           │
           ▼
Controller returns HTTP 200 + JSON
           │
           ▼
Client receives matching events
```

---

## 🔄 Update Event Flow (PUT)

```
Client sends: PUT /api/events/1 with updated data
       │
       ▼
EventController.updateEvent(1, updatedEventDetails)
       │
       ▼
EventRepository.findById(1)  ◄─── First, find existing event
       │
       ▼
MySQL: SELECT * FROM events WHERE id = 1
       │
       ▼
Event found ✓
       │
       ▼
Update properties of found event
(title, description, startTime, etc.)
       │
       ▼
EventRepository.save(existingEvent)  ◄─── Save updated
       │
       ▼
Hibernate detects UPDATE needed (not INSERT)
       │
       ▼
@PreUpdate sets updatedAt = NOW()
       │
       ▼
MySQL executes: UPDATE events SET title='...', updated_at=NOW() WHERE id=1
       │
       ▼
Return updated Event object
       │
       ▼
Controller returns HTTP 200 + updated Event JSON
       │
       ▼
Client receives updated event
```

---

## 🗑️ Delete Event Flow (DELETE)

```
Client: DELETE /api/events/1
       │
       ▼
EventController.deleteEvent(1)
       │
       ▼
Check if exists: EventRepository.existsById(1)
       │
       ▼
MySQL: SELECT 1 FROM events WHERE id = 1 LIMIT 1
       │
       ▼
If exists:
       │
       ▼
EventRepository.deleteById(1)
       │
       ▼
MySQL: DELETE FROM events WHERE id = 1
       │
       ▼
Return HTTP 204 NO CONTENT
       │
       ▼
Client confirms deletion
```

---

## 🗄️ Entity to Database Mapping

```
JAVA ENTITY                        DATABASE TABLE
─────────────────────────────────────────────────────────────
Event class                    ◄──► events table
  │
  ├─ @Entity                      
  ├─ @Table(name="events")
  │
  ├─ id: Long                  ◄──► id: BIGINT (PK, AUTO_INCREMENT)
  │   @Id
  │   @GeneratedValue(IDENTITY)
  │
  ├─ title: String             ◄──► title: VARCHAR(255) NOT NULL
  │   @Column(nullable=false, length=255)
  │
  ├─ description: String       ◄──► description: LONGTEXT
  │   @Column(columnDefinition="TEXT")
  │
  ├─ startTime: LocalDateTime  ◄──► start_time: DATETIME NOT NULL
  │   @Column(nullable=false)
  │
  ├─ endTime: LocalDateTime    ◄──► end_time: DATETIME NOT NULL
  │   @Column(nullable=false)
  │
  ├─ location: String          ◄──► location: VARCHAR(255)
  │   @Column(length=255)
  │
  ├─ active: Boolean           ◄──► active: BOOLEAN DEFAULT 1
  │   @Column(nullable=false)
  │
  ├─ createdAt: LocalDateTime  ◄──► created_at: DATETIME NOT NULL
  │   @Column(nullable=false, updatable=false)
  │   @PrePersist sets this
  │
  └─ updatedAt: LocalDateTime  ◄──► updated_at: DATETIME
      @Column
      @PrePersist & @PreUpdate set this
```

---

## 🔌 Spring Boot Application Startup Sequence

```
1. JVM starts Application.class
   └─ @SpringBootApplication annotation detected
   
2. Spring Boot auto-configuration kicks in
   ├─ DataSource auto-configured from application.properties
   ├─ JPA/Hibernate auto-configured
   └─ Embedded Tomcat prepared
   
3. Database connection established
   └─ jdbc:mysql://localhost:3306/slotwise?...
   
4. Hibernate initialization
   ├─ Scans for @Entity classes (finds Event.java)
   ├─ DDL auto-execution (ddl-auto=update)
   │  ├─ CREATE TABLE events IF NOT EXISTS
   │  └─ ALTER TABLE if schema changed
   └─ SessionFactory created
   
5. Spring container initialization
   ├─ EventRepository bean created (JpaRepository proxy)
   ├─ EventController bean created (@RestController)
   └─ Component scan finds all @Component/@Service/@Repository
   
6. Tomcat server started
   └─ Listening on http://localhost:8080
   
7. Application ready
   └─ Ready to accept HTTP requests
   
Console shows:
Hibernate: CREATE TABLE events ...
Hibernate: SELECT ... FROM events ...
Started Application in 2.5 seconds
```

---

## 📊 Query Methods Mapping

```
JAVA METHOD NAME              SQL GENERATED
────────────────────────────────────────────────────────────
findAll()
└─► SELECT * FROM events

findById(id)
└─► SELECT * FROM events WHERE id = ?

findByActiveTrue()
└─► SELECT * FROM events WHERE active = true

findByActiveFalse()
└─► SELECT * FROM events WHERE active = false

findByTitleIgnoreCase(title)
└─► SELECT * FROM events WHERE LOWER(title) = LOWER(?)

findByLocation(location)
└─► SELECT * FROM events WHERE location = ?

findByStartTimeAfter(dateTime)
└─► SELECT * FROM events WHERE start_time > ?

findByEndTimeBefore(dateTime)
└─► SELECT * FROM events WHERE end_time < ?

findEventsBetweenDates(start, end)
└─► SELECT * FROM events 
    WHERE start_time BETWEEN ? AND ? 
    ORDER BY start_time ASC

findActiveEventsBetweenDates(start, end)
└─► SELECT * FROM events 
    WHERE active = true 
    AND start_time BETWEEN ? AND ? 
    ORDER BY start_time ASC

countByActiveTrue()
└─► SELECT COUNT(*) FROM events WHERE active = true

save(event)
└─► INSERT INTO events (...) VALUES (...)
    OR UPDATE events SET ... WHERE id = ?

deleteById(id)
└─► DELETE FROM events WHERE id = ?

existsById(id)
└─► SELECT 1 FROM events WHERE id = ? LIMIT 1
```

---

## 🔐 Request Authentication & CORS

```
INCOMING REQUEST
       │
       ▼
CORS Check (EventController)
├─ @CrossOrigin(origins = "*", maxAge = 3600)
└─ Allows all origins for 1 hour
       │
       ▼
HTTP Method Routing
├─ GET    ► EventController.getXXX()
├─ POST   ► EventController.createEvent()
├─ PUT    ► EventController.updateEvent()
└─ DELETE ► EventController.deleteEvent()
       │
       ▼
@RequestBody Deserialization
├─ Convert JSON to Event object
└─ Apply default values
       │
       ▼
Business Logic Execution
├─ Call appropriate Repository method
└─ Interact with database
       │
       ▼
Response Object Creation
├─ Wrap result in ResponseEntity
├─ Set HTTP Status Code
└─ Convert to JSON
       │
       ▼
CORS Headers Added
├─ Access-Control-Allow-Origin: *
├─ Access-Control-Max-Age: 3600
└─ Access-Control-Allow-Methods: GET, POST, PUT, DELETE
       │
       ▼
CLIENT RECEIVES RESPONSE
```

---

## 📈 Performance & Logging

```
APPLICATION LOGGING LEVELS
────────────────────────────────

DEBUG (Detailed):
├─ SQL: org.hibernate.SQL = DEBUG
│  └─ Shows: INSERT INTO events (title, ...) VALUES (...)
│
└─ Binding: org.hibernate.type.descriptor.sql = TRACE
   └─ Shows: binding parameter [1] as [VARCHAR] - [Meeting]

INFO (General):
├─ Spring Boot startup messages
├─ Application ready messages
└─ Port information

WARN (Warnings):
├─ Deprecated methods
└─ Configuration issues

ERROR (Failures):
├─ Database connection errors
├─ SQL syntax errors
└─ Validation failures

Console Output Example:
[INFO] Starting Application v0.0.1-SNAPSHOT
[INFO] Using MySQL 8.0.28 driver
[DEBUG] Hibernate: INSERT INTO events (title, ...) VALUES (?)
[DEBUG] Binding parameter [1] as [VARCHAR] - [Team Meeting]
[INFO] Application started in 2.5 seconds
```

---

## 🎯 Request/Response Lifecycle Summary

```
TIME LINE:
──────────────────────────────────────────────────────────────

T0:   Client sends HTTP request
      GET/POST/PUT/DELETE /api/events[/...]
      
T1:   DispatcherServlet receives request
      Routes to appropriate controller method
      
T2:   EventController processes request
      Calls EventRepository method
      
T3:   EventRepository delegates to JPA
      Spring Data generates SQL from method name
      
T4:   Hibernate translates to native SQL
      Parameters bound to placeholders
      
T5:   MySQL JDBC Driver executes SQL
      Database processes query
      
T6:   MySQL returns result set
      Driver processes rows
      
T7:   Hibernate maps rows to Entity objects
      Creates Java object instances
      
T8:   JPA returns result to Repository
      Repository returns to Controller
      
T9:   Controller wraps in ResponseEntity
      Converts to JSON
      Adds HTTP status code
      
T10:  Spring serializes response
      Adds CORS headers if needed
      
T11:  Client receives HTTP response
      Status code + JSON body
      
TOTAL TIME: ~50-100ms (typical)
```

---

This architecture provides:
- ✅ Clean separation of concerns
- ✅ Automatic SQL generation
- ✅ Easy to test and maintain
- ✅ Scalable design
- ✅ Spring Boot conventions
- ✅ Database abstraction via JPA

