# Code Comparison: Before vs After

## Overview
This document shows the exact changes made to enforce per-institute uniqueness.

---

## 1. DepartmentRepository.java

### BEFORE ❌
```java
@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByName(String name);
    List<Department> findByInstitute(Institute institute);
    List<Department> findByInstituteId(Long instituteId);
    boolean existsByName(String name);
    // No method to check (name + instituteId) combination
}
```

### AFTER ✅
```java
@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByName(String name);
    List<Department> findByInstitute(Institute institute);
    List<Department> findByInstituteId(Long instituteId);
    boolean existsByName(String name);
    
    /**
     * Check if department with given name exists in the specified institute
     * Allows same department name across different institutes
     */
    boolean existsByNameAndInstituteId(String name, Long instituteId);  // ← NEW
}
```

**What Changed:**
- ✅ Added 1 new method
- ✅ Enables checking (name + instituteId) uniqueness

---

## 2. DepartmentService.java - createDepartment()

### BEFORE ❌
```java
public DepartmentResponseDTO createDepartment(DepartmentRequestDTO requestDTO) {
    // Validate input
    if (requestDTO.getName() == null || requestDTO.getName().isBlank()) {
        throw new IllegalArgumentException("Department name is required");
    }

    // ❌ WRONG: Checks GLOBAL uniqueness
    if (departmentRepository.existsByName(requestDTO.getName())) {
        throw new IllegalArgumentException(
            "Department with name '" + requestDTO.getName() + "' already exists");
    }

    // Convert DTO to entity and save
    Department department = convertToEntity(requestDTO);
    Department savedDepartment = departmentRepository.save(department);
    
    return convertToResponseDTO(savedDepartment);
}
```

**Problems:**
- ❌ Only checks if name exists globally
- ❌ Doesn't consider which institute
- ❌ Blocks same name in different institutes
- ❌ No validation of instituteId

### AFTER ✅
```java
public DepartmentResponseDTO createDepartment(DepartmentRequestDTO requestDTO) {
    // Validate input
    if (requestDTO.getName() == null || requestDTO.getName().isBlank()) {
        throw new IllegalArgumentException("Department name is required");
    }

    // ✅ NEW: Validate instituteId is provided
    if (requestDTO.getInstituteId() == null) {
        throw new IllegalArgumentException("Institute ID is required for department creation");
    }

    // ✅ CORRECT: Check uniqueness within institute
    // Allows same department name in different institutes
    if (departmentRepository.existsByNameAndInstituteId(
            requestDTO.getName(), 
            requestDTO.getInstituteId())) {
        throw new IllegalArgumentException(
            "Department with name '" + requestDTO.getName() + 
            "' already exists in this institute");  // ← Better message
    }

    // Convert DTO to entity and save
    Department department = convertToEntity(requestDTO);
    Department savedDepartment = departmentRepository.save(department);
    
    return convertToResponseDTO(savedDepartment);
}
```

**Improvements:**
- ✅ Validates instituteId is provided
- ✅ Checks (name + instituteId) uniqueness
- ✅ Allows same name in different institutes
- ✅ Better error message indicating which institute

---

## 3. DepartmentService.java - updateDepartment()

### BEFORE ❌
```java
public DepartmentResponseDTO updateDepartment(Long id, DepartmentRequestDTO requestDTO) {
    Department department = departmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Department not found with ID: " + id));

    // ❌ WRONG: Checks GLOBAL uniqueness
    if (!department.getName().equals(requestDTO.getName()) &&
            departmentRepository.existsByName(requestDTO.getName())) {
        throw new IllegalArgumentException(
            "Department with name '" + requestDTO.getName() + "' already exists");
    }

    department.setName(requestDTO.getName());

    if (requestDTO.getInstituteId() != null) {
        Institute institute = instituteRepository.findById(requestDTO.getInstituteId())
                .orElseThrow(() -> new RuntimeException(
                    "Institute not found with ID: " + requestDTO.getInstituteId()));
        department.setInstitute(institute);
    }

    Department updatedDepartment = departmentRepository.save(department);
    return convertToResponseDTO(updatedDepartment);
}
```

**Problems:**
- ❌ Only checks if name exists globally
- ❌ Doesn't handle institute changes
- ❌ Doesn't consider which institute to validate against
- ❌ Logic is unclear

### AFTER ✅
```java
public DepartmentResponseDTO updateDepartment(Long id, DepartmentRequestDTO requestDTO) {
    Department department = departmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Department not found with ID: " + id));

    // ✅ CORRECT: Validate name change doesn't duplicate in same institute
    // Only check if the name is actually being changed
    if (!department.getName().equals(requestDTO.getName())) {
        // ✅ Determine which institute to use for validation
        Long instituteIdToCheck = requestDTO.getInstituteId() != null ? 
                requestDTO.getInstituteId() : department.getInstitute().getId();
        
        // ✅ Check if another department with the same name exists in this institute
        if (departmentRepository.existsByNameAndInstituteId(
                requestDTO.getName(), 
                instituteIdToCheck)) {
            throw new IllegalArgumentException(
                "Department with name '" + requestDTO.getName() + 
                "' already exists in this institute");  // ← Better message
        }
    }

    department.setName(requestDTO.getName());

    // ✅ Update institute if provided
    if (requestDTO.getInstituteId() != null) {
        Institute institute = instituteRepository.findById(requestDTO.getInstituteId())
                .orElseThrow(() -> new RuntimeException(
                    "Institute not found with ID: " + requestDTO.getInstituteId()));
        department.setInstitute(institute);
    }

    Department updatedDepartment = departmentRepository.save(department);
    return convertToResponseDTO(updatedDepartment);
}
```

**Improvements:**
- ✅ Checks (name + instituteId) uniqueness
- ✅ Handles institute changes properly
- ✅ Null-safe: uses existing institute if not provided
- ✅ Only validates when name actually changes
- ✅ Better error message
- ✅ Clear variable naming and comments

---

## 📊 Side-by-Side Comparison

### Global Uniqueness (Before)
```
Institute 1: CS ✅
Institute 2: CS ❌ BLOCKED (global duplicate)
```

### Per-Institute Uniqueness (After)
```
Institute 1: CS ✅
Institute 2: CS ✅ ALLOWED (different institute)
Institute 1: CS ❌ BLOCKED (duplicate in institute)
```

---

## 🔄 Data Flow Changes

### CREATE: Global Uniqueness (BEFORE)
```
User Input: {name: "CS", instituteId: 2}
    ↓
Check: existsByName("CS")  ❌ WRONG
    ↓
Result: Finds "CS" at Institute 1
    ↓
Action: BLOCK (even though different institute)
```

### CREATE: Per-Institute Uniqueness (AFTER)
```
User Input: {name: "CS", instituteId: 2}
    ↓
Check: existsByNameAndInstituteId("CS", 2)  ✅ CORRECT
    ↓
Result: No "CS" at Institute 2
    ↓
Action: ALLOW
```

### UPDATE: Global Uniqueness (BEFORE)
```
Current: Department "Physics" at Institute 1
Update: {name: "CS", instituteId: 1}
    ↓
Check: existsByName("CS")  ❌ WRONG (ignores institute)
    ↓
Result: Might find CS at different institute
    ↓
Action: Unpredictable behavior
```

### UPDATE: Per-Institute Uniqueness (AFTER)
```
Current: Department "Physics" at Institute 1
Update: {name: "CS", instituteId: 1}
    ↓
Check: existsByNameAndInstituteId("CS", 1)  ✅ CORRECT
    ↓
Result: Only checks Institute 1
    ↓
Action: Correct decision based on context
```

---

## 🎯 Key Changes Summary

| Aspect | Before | After | Impact |
|--------|--------|-------|--------|
| **Method** | `existsByName()` | `existsByNameAndInstituteId()` | ✅ Context-aware |
| **Parameters** | Just name | Name + instituteId | ✅ Complete uniqueness |
| **Institute Change** | Not handled | Null-safe handling | ✅ Flexible updates |
| **Error Message** | Generic | Specific to institute | ✅ Better debugging |
| **Validation** | Global scope | Local scope | ✅ Realistic model |

---

## ✅ Verification

Both versions compile, but:
- **BEFORE:** ❌ Wrong logic (global uniqueness)
- **AFTER:** ✅ Correct logic (per-institute uniqueness)

---

## 📝 Lines Changed

| File | Method | Lines | Type |
|------|--------|-------|------|
| DepartmentRepository.java | NEW | 4 | Addition |
| DepartmentService.java | createDepartment() | 9 | Modification |
| DepartmentService.java | updateDepartment() | 13 | Modification |
| **TOTAL** | | **26** | |

---

**Before:** Global uniqueness (allows only one instance of a name across all institutes)  
**After:** Per-institute uniqueness (allows same name in different institutes)

This change enables a more realistic and flexible data model suitable for multi-institute applications.

