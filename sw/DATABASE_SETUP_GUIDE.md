  # Spring Boot MySQL JPA Configuration Guide

## Project Setup Summary

This Spring Boot REST API project is now configured to connect to a MySQL database using Spring Data JPA with Hibernate.

---

## 1. Database Configuration (`application.properties`)

```properties
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
```

**Configuration Details:**
- **Database URL**: Connects to `slotwise` database on `localhost:3306`
- **useSSL=false**: Disables SSL (for local development)
- **serverTimezone=UTC**: Sets server timezone to UTC
- **ddl-auto=update**: Automatically creates/updates database tables based on entities
  - Use `create-drop` for development (drops and recreates on startup)
  - Use `validate` for production (only validates, no changes)

---

## 2. Maven Dependencies (`pom.xml`)

The following key dependencies have been added:

```xml
<!-- Spring Data JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- Spring Web -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- MySQL Connector -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- Spring Boot Test -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

---

## 3. Entity Class - Event

**Location**: `src/main/java/com/slotwise/sw/entity/Event.java`

The `Event` entity includes:
- **@Entity**: Marks as JPA entity
- **@Table**: Maps to `events` table in database
- **@Id**: Primary key with auto-increment
- **Fields**:
  - `id`: Unique identifier (auto-generated)
  - `title`: Event name (required, 255 chars)
  - `description`: Event details (text field)
  - `startTime`: Event start time (required)
  - `endTime`: Event end time (required)
  - `location`: Event location (255 chars)
  - `active`: Boolean flag for active/inactive
  - `createdAt`: Auto-set on creation
  - `updatedAt`: Auto-updated on modifications

**Lifecycle Callbacks**:
- `@PrePersist`: Automatically sets `createdAt` and `updatedAt`
- `@PreUpdate`: Automatically updates `updatedAt` on modifications

---

## 4. JpaRepository Interface - EventRepository

**Location**: `src/main/java/com/slotwise/sw/repository/EventRepository.java`

Provides the following query methods:

### Basic Queries
- `findAll()`: Get all events
- `findById(Long id)`: Get event by ID
- `save(Event event)`: Create or update event
- `deleteById(Long id)`: Delete event by ID

### Custom Queries
- `findByActiveTrue()`: Get all active events
- `findByActiveFalse()`: Get all inactive events
- `findByTitleIgnoreCase(String title)`: Search by title
- `findByLocation(String location)`: Search by location
- `findByStartTimeAfter(LocalDateTime)`: Events starting after date
- `findByEndTimeBefore(LocalDateTime)`: Events ending before date
- `findEventsBetweenDates(start, end)`: Events within date range
- `findActiveEventsBetweenDates(start, end)`: Active events within date range
- `countByActiveTrue()`: Count active events

---

## 5. REST Controller - EventController

**Location**: `src/main/java/com/slotwise/sw/controller/EventController.java`

**Base URL**: `/api/events`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get all events |
| GET | `/api/events/{id}` | Get event by ID |
| POST | `/api/events` | Create new event |
| PUT | `/api/events/{id}` | Update event |
| DELETE | `/api/events/{id}` | Delete event |
| GET | `/api/events/active` | Get all active events |
| GET | `/api/events/search/title?title=X` | Search by title |
| GET | `/api/events/search/location?location=X` | Search by location |
| GET | `/api/events/search/date-range?start=X&end=Y` | Search by date range |
| GET | `/api/events/count/active` | Count active events |

---

## Setup Instructions

### 1. Create Database
```sql
CREATE DATABASE slotwise;
```

### 2. Update Credentials (if needed)
Edit `application.properties` to match your MySQL credentials:
```properties
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 3. Build Project
```bash
mvn clean install
```

### 4. Run Application
```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080` by default.

---

## Sample API Requests

### Create Event
```bash
curl -X POST http://localhost:8080/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Spring Boot Workshop",
    "description": "Learn Spring Boot fundamentals",
    "startTime": "2026-03-20T10:00:00",
    "endTime": "2026-03-20T12:00:00",
    "location": "Tech Hub"
  }'
```

### Get All Active Events
```bash
curl http://localhost:8080/api/events/active
```

### Search by Title
```bash
curl "http://localhost:8080/api/events/search/title?title=Workshop"
```

### Update Event
```bash
curl -X PUT http://localhost:8080/api/events/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced Spring Boot",
    "description": "Advanced topics",
    "startTime": "2026-03-21T10:00:00",
    "endTime": "2026-03-21T14:00:00",
    "location": "Tech Hub",
    "active": true
  }'
```

### Delete Event
```bash
curl -X DELETE http://localhost:8080/api/events/1
```

---

## Hibernate Configuration Details

The following Hibernate properties are configured:

- **Database Dialect**: `org.hibernate.dialect.MySQL8Dialect` - Optimized for MySQL 8.0+
- **DDL Auto**: `update` - Automatically updates schema
- **Show SQL**: `true` - Logs all SQL queries
- **Format SQL**: `true` - Formats SQL output for readability
- **SQL Comments**: `true` - Adds helpful comments to SQL queries

---

## Logging

The application logs Hibernate SQL queries at DEBUG level:

```properties
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

Check console output for SQL statements and parameter binding information.

---

## Project Structure

```
src/
├── main/
│   ├── java/com/slotwise/sw/
│   │   ├── Application.java (Main Spring Boot class)
│   │   ├── entity/
│   │   │   └── Event.java (JPA Entity)
│   │   ├── repository/
│   │   │   └── EventRepository.java (JpaRepository)
│   │   └── controller/
│   │       └── EventController.java (REST Controller)
│   └── resources/
│       └── application.properties (Database configuration)
└── test/
    └── java/...
```

---

## Next Steps

1. **Add More Entities**: Create additional JPA entity classes for your domain model
2. **Create Services**: Add business logic layers with @Service classes
3. **Add Validation**: Use @Valid and validation annotations
4. **Implement DTOs**: Create Data Transfer Objects for API responses
5. **Add Authentication**: Implement Spring Security
6. **Write Tests**: Add unit and integration tests

---

## Troubleshooting

### Connection Issues
- Ensure MySQL is running on `localhost:3306`
- Verify database `slotwise` exists
- Check credentials in `application.properties`

### Table Creation Issues
- Check logs for Hibernate DDL execution
- Ensure entity is properly annotated with `@Entity` and `@Table`
- Verify column constraints are valid

### Timezone Issues
- The connection URL includes `serverTimezone=UTC`
- Modify if your server uses a different timezone

---

## Additional Resources

- [Spring Data JPA Documentation](https://spring.io/projects/spring-data-jpa)
- [Hibernate Documentation](https://hibernate.org/)
- [Spring Boot MySQL Guide](https://spring.io/guides/gs/accessing-data-mysql/)

