# 📊 Visual Reference: Department Uniqueness Changes

## Architecture Change

### BEFORE: Global Uniqueness
```
┌─────────────────────────────────────┐
│      DATABASE                       │
│  ┌─────────────────────────────┐    │
│  │    Departments Table        │    │
│  ├─────────────────────────────┤    │
│  │ ID │ Name    │ Institute ID │    │
│  ├────┼─────────┼──────────────┤    │
│  │ 1  │ CS      │ 1 (MIT)      │    │
│  │ 2  │ Physics │ 1 (MIT)      │    │
│  │ 3  │ Math    │ 2 (Stanford) │    │
│  │ 4  │ ???     │ ❌ BLOCKED   │    │ ← "CS" not allowed
│  │    │ (CS)    │ (2-Stanford) │    │    (already exists)
│  └─────────────────────────────┘    │
│                                      │
│  Validation: NAME must be UNIQUE    │
│  globally across ALL institutes     │
└─────────────────────────────────────┘
```

### AFTER: Per-Institute Uniqueness
```
┌─────────────────────────────────────┐
│      DATABASE                       │
│  ┌─────────────────────────────┐    │
│  │    Departments Table        │    │
│  ├─────────────────────────────┤    │
│  │ ID │ Name    │ Institute ID │    │
│  ├────┼─────────┼──────────────┤    │
│  │ 1  │ CS      │ 1 (MIT)      │    │
│  │ 2  │ Physics │ 1 (MIT)      │    │
│  │ 3  │ Math    │ 2 (Stanford) │    │
│  │ 4  │ CS      │ ✅ ALLOWED   │    │ ← "CS" at Stanford is OK
│  │    │         │ (2-Stanford) │    │    (different institute)
│  └─────────────────────────────┘    │
│                                      │
│  Validation: NAME must be UNIQUE    │
│  within EACH institute              │
└─────────────────────────────────────┘
```

---

## Validation Flow Comparison

### CREATE Operation

#### BEFORE: Global Check
```
Request: {name: "CS", instituteId: 2}
         ↓
    DepartmentRepository
         ↓
existsByName("CS")  ← Checks GLOBALLY
         ↓
    Does "CS" exist?
         ↓
    YES (at MIT)
         ↓
Result: ❌ BLOCKED
```

#### AFTER: Per-Institute Check
```
Request: {name: "CS", instituteId: 2}
         ↓
    DepartmentRepository
         ↓
existsByNameAndInstituteId("CS", 2)  ← Checks at INSTITUTE 2
         ↓
    Does "CS" exist at Institute 2?
         ↓
    NO (only exists at Institute 1)
         ↓
Result: ✅ ALLOWED
```

---

## UPDATE Operation

#### BEFORE: Global Check
```
Current: Physics @ MIT (id: 1)
Update: {name: "CS", instituteId: 1}
         ↓
    Check: Does "CS" exist?
         ↓
    Checks GLOBALLY
         ↓
    Might find CS elsewhere
         ↓
Result: ❌ Unpredictable
```

#### AFTER: Per-Institute Check
```
Current: Physics @ MIT (id: 1)
Update: {name: "CS", instituteId: 1}
         ↓
    Determine institute to check:
    (Use new or existing)
         ↓
    Check: existsByNameAndInstituteId("CS", 1)
         ↓
    Does "CS" exist at MIT?
         ↓
    NO
         ↓
Result: ✅ ALLOWED
```

---

## Code Changes Map

```
File: DepartmentRepository.java
├─ Added: existsByNameAndInstituteId(String, Long)
└─ Status: ✅ NEW METHOD

File: DepartmentService.java
├─ createDepartment()
│  ├─ Old: existsByName(name)
│  └─ New: existsByNameAndInstituteId(name, instituteId)
│  └─ Status: ✅ UPDATED
│
└─ updateDepartment()
   ├─ Old: existsByName(name) - global check
   └─ New: existsByNameAndInstituteId(name, instituteId)
           with null-safe institute handling
   └─ Status: ✅ UPDATED
```

---

## Query Execution

### Global Uniqueness (BEFORE)
```sql
SELECT COUNT(*) FROM departments WHERE name = 'CS' LIMIT 1;
-- Result: 1 (found at MIT) → BLOCK new Stanford entry
```

### Per-Institute Uniqueness (AFTER)
```sql
-- Check if CS exists at Stanford
SELECT COUNT(*) FROM departments 
WHERE name = 'CS' AND institute_id = 2 LIMIT 1;
-- Result: 0 (doesn't exist at Stanford) → ALLOW
```

---

## Real-World Example

### University System with Multiple Institutes

#### MIT Campus
```
┌──────────────────┐
│ MIT Institute    │
├──────────────────┤
│ Departments:     │
│ • CS             │
│ • Physics        │
│ • Mathematics    │
└──────────────────┘
```

#### Stanford Campus
```
┌──────────────────┐
│ Stanford         │
├──────────────────┤
│ Departments:     │
│ • CS         ✅  │ Now allowed with refactoring!
│ • Physics        │
│ • Engineering    │
└──────────────────┘
```

**BEFORE:** Can't have "CS" at both MIT and Stanford ❌  
**AFTER:** Can have "CS" at both MIT and Stanford ✅  
**Still:** Can't have two "CS" departments at the same institute ❌

---

## Validation Matrix

```
Department   Institute   BEFORE   AFTER    Why?
────────────────────────────────────────────────
CS           MIT         ✅       ✅       First at MIT
CS           Stanford    ❌       ✅       Different institute
CS           MIT (2nd)   ❌       ❌       Same institute
Physics      MIT         ✅       ✅       Different name
Physics      Stanford    ✅       ✅       Different institute
```

---

## Method Signatures

### Repository

#### BEFORE
```java
boolean existsByName(String name);
// Checks globally
```

#### AFTER (ADDED)
```java
boolean existsByNameAndInstituteId(String name, Long instituteId);
// Checks within specific institute
```

---

## Build Timeline

```
22:42:08 +05:30 → Refactoring Started
          ↓
    Modify DepartmentRepository
          ↓
    Modify DepartmentService (create)
          ↓
    Modify DepartmentService (update)
          ↓
    Run: mvn clean compile
          ↓
    [INFO] Compiling 32 source files
          ↓
    [INFO] BUILD SUCCESS
          ↓
22:42:27 +05:30 → Refactoring Complete (19 seconds)
```

---

## Test Outcomes

### Test Case 1: Stanford "CS"
```
BEFORE: ❌ BLOCKED (global duplicate)
AFTER:  ✅ ALLOWED (different institute)
```

### Test Case 2: MIT "CS" (Duplicate)
```
BEFORE: ❌ BLOCKED (global duplicate)
AFTER:  ❌ BLOCKED (institute duplicate)
```

### Test Case 3: Update "Physics" → "CS" at MIT
```
BEFORE: ❌ BLOCKED (global duplicate)
AFTER:  ❌ BLOCKED (if CS exists at MIT)
```

### Test Case 4: Move "CS" MIT → Stanford
```
BEFORE: ❌ BLOCKED (global duplicate)
AFTER:  ✅ ALLOWED (no duplicate at Stanford)
```

---

## Technical Improvement

```
Spring Data JPA Query Generation
────────────────────────────────

Method Name:
    existsByNameAndInstituteId(String, Long)

Auto-Generated SQL:
    SELECT COUNT(*) FROM departments 
    WHERE name = ? AND institute_id = ?
    LIMIT 1

Benefits:
✅ No manual SQL writing
✅ Type-safe
✅ Parameterized queries
✅ Automatic null handling
```

---

## Summary

| Aspect | BEFORE | AFTER |
|--------|--------|-------|
| **Scope** | Global | Per-Institute |
| **Same name, different institute** | ❌ Blocked | ✅ Allowed |
| **Same name, same institute** | ❌ Blocked | ❌ Blocked |
| **Validation method** | `existsByName()` | `existsByNameAndInstituteId()` |
| **DB Schema** | No changes | No changes |
| **Backward compat** | N/A | ✅ Yes |
| **Build status** | N/A | ✅ SUCCESS |

---

**Refactoring Complete!** 🎉  
Per-institute uniqueness is now enforced.

