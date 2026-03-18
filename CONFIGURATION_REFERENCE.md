# Configuration Files Reference

## 1. application.properties

**Location**: `src/main/resources/application.properties`

```properties
# Spring Boot Application Name
spring.application.name=slotwise-api

# MySQL Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/slotwise?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.use_sql_comments=true

# Logging Configuration
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

---

## 2. pom.xml (Dependencies Section)

**Location**: `pom.xml`

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- MySQL Database Driver -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- Test Dependencies -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

## 3. Event Entity Class

**Location**: `src/main/java/com/slotwise/sw/entity/Event.java`

```java
package com.slotwise.sw.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Column(length = 255)
    private String location;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public Event() {}

    public Event(String title, String description, LocalDateTime startTime, 
                 LocalDateTime endTime, String location) {
        this.title = title;
        this.description = description;
        this.startTime = startTime;
        this.endTime = endTime;
        this.location = location;
    }

    // JPA Lifecycle Callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters...
    // (Full code available in the project)
}
```

---

## 4. EventRepository Interface

**Location**: `src/main/java/com/slotwise/sw/repository/EventRepository.java`

```java
package com.slotwise.sw.repository;

import com.slotwise.sw.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByActiveTrue();
    List<Event> findByActiveFalse();
    List<Event> findByTitleIgnoreCase(String title);
    List<Event> findByLocation(String location);
    List<Event> findByStartTimeAfter(LocalDateTime startTime);
    List<Event> findByEndTimeBefore(LocalDateTime endTime);

    @Query("SELECT e FROM Event e WHERE e.startTime BETWEEN :startDate AND :endDate ORDER BY e.startTime ASC")
    List<Event> findEventsBetweenDates(@Param("startDate") LocalDateTime startDate, 
                                       @Param("endDate") LocalDateTime endDate);

    @Query("SELECT e FROM Event e WHERE e.active = true AND e.startTime BETWEEN :startDate AND :endDate ORDER BY e.startTime ASC")
    List<Event> findActiveEventsBetweenDates(@Param("startDate") LocalDateTime startDate, 
                                             @Param("endDate") LocalDateTime endDate);

    long countByActiveTrue();
}
```

---

## 5. EventController REST API

**Location**: `src/main/java/com/slotwise/sw/controller/EventController.java`

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get all events |
| GET | `/api/events/{id}` | Get event by ID |
| GET | `/api/events/active` | Get active events |
| POST | `/api/events` | Create new event |
| PUT | `/api/events/{id}` | Update event |
| DELETE | `/api/events/{id}` | Delete event |
| GET | `/api/events/search/title?title=X` | Search by title |
| GET | `/api/events/search/location?location=X` | Search by location |
| GET | `/api/events/search/date-range?start=X&end=Y` | Filter by date |
| GET | `/api/events/count/active` | Count active events |

### Sample Controller Method

```java
@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*", maxAge = 3600)
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        List<Event> events = eventRepository.findAll();
        return new ResponseEntity<>(events, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        Event savedEvent = eventRepository.save(event);
        return new ResponseEntity<>(savedEvent, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody Event eventDetails) {
        Optional<Event> event = eventRepository.findById(id);
        if (event.isPresent()) {
            Event existingEvent = event.get();
            existingEvent.setTitle(eventDetails.getTitle());
            existingEvent.setDescription(eventDetails.getDescription());
            existingEvent.setStartTime(eventDetails.getStartTime());
            existingEvent.setEndTime(eventDetails.getEndTime());
            existingEvent.setLocation(eventDetails.getLocation());
            existingEvent.setActive(eventDetails.getActive());
            
            Event updatedEvent = eventRepository.save(existingEvent);
            return new ResponseEntity<>(updatedEvent, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        if (eventRepository.existsById(id)) {
            eventRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
```

---

## 6. Application.java (Main Class)

**Location**: `src/main/java/com/slotwise/sw/Application.java`

```java
package com.slotwise.sw;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

---

## Configuration Property Explanations

### Database Properties
- `spring.datasource.url` - JDBC connection string to MySQL database
- `spring.datasource.username` - MySQL user (default: root)
- `spring.datasource.password` - MySQL password
- `spring.datasource.driver-class-name` - MySQL JDBC driver class

### JPA/Hibernate Properties
- `spring.jpa.database-platform` - Hibernate dialect for MySQL 8
- `spring.jpa.hibernate.ddl-auto=update` - Auto-create/update tables
- `spring.jpa.show-sql=true` - Log all SQL queries
- `spring.jpa.properties.hibernate.format_sql=true` - Pretty-print SQL

### Logging Properties
- `logging.level.org.hibernate.SQL=DEBUG` - Show SQL statements
- `logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE` - Show parameter values

---

## URL Connection String Breakdown

```
jdbc:mysql://localhost:3306/slotwise?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
```

- `jdbc:mysql://` - JDBC protocol for MySQL
- `localhost:3306` - Host and port
- `slotwise` - Database name
- `useSSL=false` - Disable SSL (for local development)
- `serverTimezone=UTC` - Set server timezone to UTC
- `allowPublicKeyRetrieval=true` - Allow public key authentication

---

## Dependencies Summary

| Dependency | Purpose |
|------------|---------|
| spring-boot-starter-data-jpa | JPA/Hibernate ORM framework |
| spring-boot-starter-web | Spring Web MVC for REST API |
| mysql-connector-j | MySQL JDBC driver |
| spring-boot-starter-test | Unit testing support |

---

## Entity Properties

| Property | Type | Nullable | Auto-Generated | Notes |
|----------|------|----------|---|-------|
| id | Long | No | Yes | Primary Key, BIGINT AUTO_INCREMENT |
| title | String | No | No | VARCHAR(255), Required |
| description | String | Yes | No | LONGTEXT |
| startTime | LocalDateTime | No | No | DATETIME, Required |
| endTime | LocalDateTime | No | No | DATETIME, Required |
| location | String | Yes | No | VARCHAR(255) |
| active | Boolean | No | No | BOOLEAN, Default: true |
| createdAt | LocalDateTime | No | Yes | Auto-set on @PrePersist |
| updatedAt | LocalDateTime | Yes | Yes | Auto-set on @PrePersist/@PreUpdate |

---

## Quick SQL Verification

After application starts, check database:

```sql
-- Show database
SHOW DATABASES;

-- Use database
USE slotwise;

-- Show created table
SHOW TABLES;

-- Show table structure
DESC events;

-- Insert test event
INSERT INTO events (title, description, start_time, end_time, location, active, created_at)
VALUES ('Test Event', 'Description', NOW(), DATE_ADD(NOW(), INTERVAL 1 HOUR), 'Test Location', true, NOW());

-- Query events
SELECT * FROM events;
```

---

## Common Modifications

### Change Database Credentials
```properties
spring.datasource.username=your_user
spring.datasource.password=your_password
```

### Change DDL Strategy (for production)
```properties
spring.jpa.hibernate.ddl-auto=validate
```

### Change Server Port
```properties
server.port=8081
```

### Disable SQL Logging
```properties
spring.jpa.show-sql=false
```

---

## Testing the API with Postman

1. **Create Event**: POST to `http://localhost:8080/api/events`
2. **Get Events**: GET to `http://localhost:8080/api/events`
3. **Get by ID**: GET to `http://localhost:8080/api/events/1`
4. **Update**: PUT to `http://localhost:8080/api/events/1`
5. **Delete**: DELETE to `http://localhost:8080/api/events/1`

---

All configurations are complete and verified! ✅

