# ✅ User Entity - Updated

## Changes Made

### 1. Department Field - Now FK Relationship ✅
```before:
@Column(nullable = false)
private String department;

after:
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "department_id", nullable = false)
private Department department;
```

### 2. Role Default - Changed to ADMIN ✅
```before:
private UserRole role = UserRole.USER;

after:
private UserRole role = UserRole.ADMIN;
```

### 3. Constructors - Updated to Accept Department Entity ✅
```before:
public User(String name, String email, String password, String department)
public User(String name, String email, String password, String department, UserRole role)

after:
public User(String name, String email, String password, Department department)
public User(String name, String email, String password, Department department, UserRole role)
```

### 4. Department Getters/Setters - Dual Access ✅
```java
// Get department name as String
public String getDepartment() {
    return department != null ? department.getName() : null;
}

// Get full Department entity
public Department getDepartmentEntity() {
    return department;
}

// Set department
public void setDepartment(Department department) {
    this.department = department;
}
```

---

## User Entity Summary

```
@Entity @Table(name="Users")
User {
    id (Long, PK, AUTO_INCREMENT)
    name (String, NOT NULL)
    email (String, NOT NULL)
    password (String, NOT NULL)
    
    department (Department FK via ManyToOne) ← CHANGED
    ├── @ManyToOne(fetch=LAZY)
    ├── @JoinColumn(name="department_id")
    └── NOT NULL
    
    role (UserRole enum)
    ├── @Enumerated(EnumType.STRING)
    ├── Default: ADMIN ✨ ← CHANGED
    └── Can be: ADMIN or USER
    
    active (Boolean, default: true)
    created_at (LocalDateTime, NOT UPDATABLE)
    updated_at (LocalDateTime)
    
    Lifecycle:
    ├── @PrePersist: Sets createdAt
    └── @PreUpdate: Updates updatedAt
}
```

---

## Database Change Required

```sql
ALTER TABLE users
ADD COLUMN department_id BIGINT NOT NULL,
MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
ADD FOREIGN KEY (department_id) REFERENCES departments(id);
```

---

## Usage

```java
// Create user (role defaults to ADMIN)
Department dept = departmentRepository.findByName("CSE").orElse(null);
User admin = new User("Prof. Smith", "smith@uni.edu", "hashedPassword", dept);
userRepository.save(admin);

// Create user with custom role
User student = new User("John", "john@uni.edu", "hashedPassword", dept, UserRole.USER);
userRepository.save(student);

// Update role
User user = userRepository.findByEmail("john@uni.edu").orElse(null);
user.setRole(UserRole.ADMIN);
userRepository.save(user);

// Access department
String deptName = user.getDepartment();  // "CSE"
Department fullDept = user.getDepartmentEntity();
Institute institute = fullDept.getInstitute();
```

---

## ✅ All Changes Complete

- ✅ Department: String → FK Entity
- ✅ Role Default: USER → ADMIN
- ✅ Constructors: Updated
- ✅ Getters/Setters: Dual access (name + entity)
- ✅ Database FK: Configured

**Ready to compile and use!** 🚀

