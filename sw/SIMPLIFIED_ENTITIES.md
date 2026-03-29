# ✅ Simplified JPA Entities - FINAL

## Clean & Minimal Design

### Institute Entity
```
Fields:
├── id (Long, PK, AUTO_INCREMENT)
├── name (String, UNIQUE, NOT NULL)
├── created_at (LocalDateTime, NOT NULL, NOT UPDATABLE)
└── updated_at (LocalDateTime)

Relationships:
└── departments (OneToMany, mappedBy="institute")

Lifecycle:
├── @PrePersist → Sets createdAt
└── @PreUpdate → Updates updatedAt
```

### Department Entity
```
Fields:
├── id (Long, PK, AUTO_INCREMENT)
├── name (String, UNIQUE, NOT NULL)
├── institute_id (BIGINT, FK, NOT NULL)
├── created_at (LocalDateTime, NOT NULL, NOT UPDATABLE)
└── updated_at (LocalDateTime)

Relationships:
├── institute (ManyToOne with @JoinColumn)
└── users (OneToMany, mappedBy="department")

Lifecycle:
├── @PrePersist → Sets createdAt
└── @PreUpdate → Updates updatedAt
```

---

## Database Schema

```sql
-- Create institutes
CREATE TABLE institutes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- Create departments
CREATE TABLE departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    institute_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (institute_id) REFERENCES institutes(id)
);

-- User table already has department_id FK
```

---

## Usage

```java
// Create
Institute inst = new Institute("Engineering");
instituteRepository.save(inst);

Department dept = new Department("CSE", inst);
departmentRepository.save(dept);

// Navigate
User user = userRepository.findByEmail("john@uni.edu").orElse(null);
Department userDept = user.getDepartmentEntity();
Institute userInst = userDept.getInstitute();
```

---

## ✅ What You Have Now

- ✅ **Institute** - id, name, created_at, updated_at
- ✅ **Department** - id, name, institute_id (FK), created_at, updated_at  
- ✅ **User** - Links to Department via FK
- ✅ **All relationships** - Properly configured
- ✅ **Audit timestamps** - On all entities
- ✅ **Lifecycle methods** - @PrePersist, @PreUpdate

**Clean, simple, and ready to use!** 🚀

