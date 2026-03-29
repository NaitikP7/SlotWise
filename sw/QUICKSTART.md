# Quick Start Guide

## What Was Created

Your Spring Boot REST API project has been fully configured for MySQL with Spring Data JPA. Here's what was generated:

### 1. **Database Configuration** 
- File: `src/main/resources/application.properties`
- Connects to MySQL database `slotwise` on `localhost:3306`
- Auto-creates/updates tables based on entity definitions

### 2. **Maven Dependencies** (pom.xml)
- ✅ Spring Boot Data JPA
- ✅ Spring Boot Web MVC
- ✅ MySQL Connector/J driver
- ✅ Spring Boot Test

### 3. **Entity Class** - Event
- File: `src/main/java/com/slotwise/sw/entity/Event.java`
- Represents an event with title, description, time, location
- Includes automatic timestamp tracking (createdAt, updatedAt)

### 4. **Repository Interface** - EventRepository
- File: `src/main/java/com/slotwise/sw/repository/EventRepository.java`
- Provides database access methods
- Includes custom query methods for searching

### 5. **REST Controller** - EventController
- File: `src/main/java/com/slotwise/sw/controller/EventController.java`
- Full CRUD endpoints for events
- Search and filter endpoints

### 6. **Documentation**
- File: `DATABASE_SETUP_GUIDE.md` - Comprehensive guide with examples

---

## Before Running

### Step 1: Create MySQL Database
```sql
CREATE DATABASE slotwise;
```

### Step 2: Verify MySQL Connection Settings
Open `src/main/resources/application.properties` and update if needed:
```properties
spring.datasource.username=root          # Your MySQL username
spring.datasource.password=              # Your MySQL password (if any)
```

---

## Running the Application

### Option 1: Using Maven
```bash
cd C:\Users\naiti\Downloads\sw\sw
mvn clean install
mvn spring-boot:run
```

### Option 2: Using IDE
1. Open the project in IntelliJ IDEA / Eclipse
2. Run `Application.java` as a Java Application

### Application Starts On
```
http://localhost:8080
```

---

## Test the API

### Create an Event
```bash
curl -X POST http://localhost:8080/api/events \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Team Meeting\",
    \"description\": \"Quarterly planning meeting\",
    \"startTime\": \"2026-03-20T14:00:00\",
    \"endTime\": \"2026-03-20T15:00:00\",
    \"location\": \"Conference Room A\",
    \"active\": true
  }"
```

### Get All Events
```bash
curl http://localhost:8080/api/events
```

### Get All Active Events
```bash
curl http://localhost:8080/api/events/active
```

### Get Event by ID
```bash
curl http://localhost:8080/api/events/1
```

### Update Event
```bash
curl -X PUT http://localhost:8080/api/events/1 \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Updated Meeting\",
    \"description\": \"Updated description\",
    \"startTime\": \"2026-03-20T15:00:00\",
    \"endTime\": \"2026-03-20T16:00:00\",
    \"location\": \"Conference Room B\",
    \"active\": true
  }"
```

### Delete Event
```bash
curl -X DELETE http://localhost:8080/api/events/1
```

### Search by Title
```bash
curl "http://localhost:8080/api/events/search/title?title=Meeting"
```

---

## Project Structure

```
sw/
├── src/
│   ├── main/
│   │   ├── java/com/slotwise/sw/
│   │   │   ├── Application.java              (Main Spring Boot class)
│   │   │   ├── entity/
│   │   │   │   └── Event.java               (JPA Entity - Database model)
│   │   │   ├── repository/
│   │   │   │   └── EventRepository.java     (Data access layer)
│   │   │   └── controller/
│   │   │       └── EventController.java     (REST API endpoints)
│   │   └── resources/
│   │       └── application.properties       (Database & JPA configuration)
│   └── test/
│       └── java/... (Unit tests)
├── pom.xml                                   (Maven dependencies)
└── DATABASE_SETUP_GUIDE.md                  (Comprehensive documentation)
```

---

## What Happens Automatically

When you run the application:

1. **Database Connection**: Connects to MySQL `slotwise` database
2. **Table Creation**: Creates `events` table if it doesn't exist
3. **Schema Updates**: Updates table structure if entity changes (ddl-auto=update)
4. **Logging**: Displays SQL queries in console

Check the console output for:
```
Hibernate: CREATE TABLE events (...)
Hibernate: SELECT * FROM events ...
```

---

## Key Features Included

✅ **Automatic Timestamps** - `createdAt` and `updatedAt` are set automatically
✅ **Query Methods** - Find events by title, location, date range
✅ **REST API** - Full CRUD operations
✅ **SQL Logging** - See all SQL queries in console
✅ **Timezone Handling** - UTC timezone configured
✅ **Validation Ready** - Easy to add @Valid annotations

---

## Database Schema Generated

The application will automatically create this table:

```sql
CREATE TABLE events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description LONGTEXT,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  location VARCHAR(255),
  active BOOLEAN NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL,
  updated_at DATETIME
);
```

---

## Next Steps

### Add More Features:
1. **Service Layer** - Add business logic
2. **Validation** - Add @NotBlank, @NotNull annotations
3. **DTOs** - Create Data Transfer Objects for API responses
4. **Relationships** - Add @OneToMany, @ManyToMany relationships
5. **Security** - Add Spring Security authentication
6. **Tests** - Write unit and integration tests

### Example: Add Category Entity
```java
@Entity
public class Category {
    @Id
    @GeneratedValue
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @OneToMany(mappedBy = "category")
    private List<Event> events;
}
```

---

## Troubleshooting

### MySQL Connection Error
- Ensure MySQL is running
- Check credentials in `application.properties`
- Verify database `slotwise` exists

### Table Not Created
- Check console for error messages
- Ensure all imports are correct
- Verify entity has `@Entity` and `@Table` annotations

### Port Already in Use
- Change in `application.properties`:
  ```properties
  server.port=8081
  ```

---

## Useful Resources

- 📚 [Spring Data JPA Docs](https://spring.io/projects/spring-data-jpa)
- 📚 [Hibernate Docs](https://hibernate.org/)
- 📚 [Spring Boot Docs](https://spring.io/projects/spring-boot)
- 📚 [MySQL Docs](https://dev.mysql.com/doc/)

---

## Support

For issues or questions:
1. Check `DATABASE_SETUP_GUIDE.md` for detailed documentation
2. Review console logs for error messages
3. Check MySQL database connection settings
4. Verify entity annotations are correct

---

Happy coding! 🚀

