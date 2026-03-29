# Authentication System - Visual Diagrams & Flows

## 1. Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       Client/API Consumer                        │
│                  (Browser, Mobile, Postman, etc)                 │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
         POST /api/auth/login          GET /api/auth/health
              (login)                      (health check)
                 │                               │
                 ▼                               ▼
        ┌────────────────────────┐    ┌──────────────────┐
        │  AuthController        │    │  AuthController  │
        │  ________________      │    │  _______________  │
        │ • Request validation   │    │ • Returns 200 OK │
        │ • Status code mapping  │    │                   │
        │ • Exception handling   │    └──────────────────┘
        └────────────┬───────────┘
                     │
                     │ login(LoginRequest)
                     ▼
        ┌────────────────────────────────────┐
        │         AuthService                 │
        │  __________________________________│
        │ ✓ Input validation                  │
        │ ✓ Call UserRepository.findByEmail() │
        │ ✓ Password validation               │
        │ ✓ Active status check               │
        │ ✓ Build LoginResponse               │
        │ ✓ Exception handling                │
        └────────────┬───────────────────────┘
                     │
                     │ findByEmail(email)
                     ▼
        ┌────────────────────────────────────┐
        │      UserRepository                 │
        │  __________________________________│
        │ • Spring Data JPA interface         │
        │ • Query user by email               │
        │ • Return Optional<User>             │
        └────────────┬───────────────────────┘
                     │
                     │ SELECT query
                     ▼
        ┌────────────────────────────────────┐
        │        MySQL Database               │
        │  __________________________________│
        │ • Users table                       │
        │ • User records with email, password │
        │ • Department relationships          │
        └────────────────────────────────────┘
```

## 2. Sequence Diagram - Successful Login

```
Client          Controller         Service         Repository      Database
  │                 │                 │                 │               │
  │ POST /login     │                 │                 │               │
  ├────────────────>│                 │                 │               │
  │                 │ login()         │                 │               │
  │                 ├────────────────>│                 │               │
  │                 │                 │ findByEmail()   │               │
  │                 │                 ├────────────────>│               │
  │                 │                 │                 │ SELECT * FROM │
  │                 │                 │                 │  Users WHERE  │
  │                 │                 │                 │  email = ?    │
  │                 │                 │                 ├──────────────>│
  │                 │                 │                 │<──────────────┤
  │                 │                 │<────────────────┤ User found    │
  │                 │                 │ (validate pass) │               │
  │                 │                 │ (check active)  │               │
  │                 │                 │ (build response)│               │
  │                 │<────────────────┤                 │               │
  │                 │ (LoginResponse) │                 │               │
  │<────────────────┤                 │                 │               │
  │ (200 OK)        │                 │                 │               │
  │ {user data}     │                 │                 │               │
  │                 │                 │                 │               │
```

## 3. Sequence Diagram - Invalid Password

```
Client          Controller         Service         Repository      Database
  │                 │                 │                 │               │
  │ POST /login     │                 │                 │               │
  ├────────────────>│                 │                 │               │
  │                 │ login()         │                 │               │
  │                 ├────────────────>│                 │               │
  │                 │                 │ findByEmail()   │               │
  │                 │                 ├────────────────>│               │
  │                 │                 │                 │ SELECT...     │
  │                 │                 │                 ├──────────────>│
  │                 │                 │                 │<──────────────┤
  │                 │                 │<────────────────┤ User found    │
  │                 │                 │ (validate pass) │               │
  │                 │                 │ FAIL!           │               │
  │                 │ ◄─ IllegalArg   │                 │               │
  │                 │ Exception       │                 │               │
  │                 │ (catch)         │                 │               │
  │<────────────────┤                 │                 │               │
  │ (401 Unauthorized)               │                 │               │
  │ "Invalid email..."               │                 │               │
  │                 │                 │                 │               │
```

## 4. Sequence Diagram - Inactive User

```
Client          Controller         Service         Repository      Database
  │                 │                 │                 │               │
  │ POST /login     │                 │                 │               │
  ├────────────────>│                 │                 │               │
  │                 │ login()         │                 │               │
  │                 ├────────────────>│                 │               │
  │                 │                 │ findByEmail()   │               │
  │                 │                 ├────────────────>│               │
  │                 │                 │                 │ SELECT...     │
  │                 │                 │                 ├──────────────>│
  │                 │                 │                 │<──────────────┤
  │                 │                 │<────────────────┤ User found    │
  │                 │                 │ (validate pass) │               │
  │                 │                 │ OK              │               │
  │                 │                 │ (check active)  │               │
  │                 │                 │ NOT ACTIVE!     │               │
  │                 │ ◄─ IllegalArg   │                 │               │
  │                 │ Exception       │                 │               │
  │                 │ (catch)         │                 │               │
  │<────────────────┤                 │                 │               │
  │ (403 Forbidden)                  │                 │               │
  │ "User account..."                │                 │               │
  │                 │                 │                 │               │
```

## 5. State Machine Diagram

```
                    ┌─────────────────────────┐
                    │   Start                 │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Receive Login Request   │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Validate Input          │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              ✗ Invalid                  ✓ Valid
                    │                         │
                    ▼                         ▼
        ┌──────────────────────┐  ┌──────────────────────────┐
        │ Return 400 Bad       │  │ Query User by Email      │
        │ Request              │  │                          │
        └──────────────────────┘  └────────────┬─────────────┘
                    │                          │
                    │              ┌───────────┴────────────┐
                    │              │                        │
                    │         ✗ Not Found              ✓ Found
                    │              │                        │
                    │              ▼                        ▼
                    │  ┌────────────────────┐  ┌─────────────────────────┐
                    │  │ Return 401         │  │ Validate Password       │
                    │  │ Unauthorized       │  │                         │
                    │  └────────────────────┘  └────────────┬────────────┘
                    │              │                        │
                    │              │           ┌────────────┴──────────┐
                    │              │           │                       │
                    │              │      ✗ Invalid              ✓ Valid
                    │              │           │                       │
                    │              │           ▼                       ▼
                    │              │  ┌─────────────────┐  ┌─────────────────────┐
                    │              │  │ Return 401      │  │ Check Active Status │
                    │              │  │ Unauthorized    │  │                     │
                    │              │  └─────────────────┘  └────────────┬────────┘
                    │              │           │                        │
                    │              │           │           ┌────────────┴──────────┐
                    │              │           │           │                       │
                    │              │           │      ✗ Inactive           ✓ Active
                    │              │           │           │                       │
                    │              │           │           ▼                       ▼
                    │              │           │  ┌──────────────────┐  ┌──────────────────┐
                    │              │           │  │ Return 403       │  │ Build Response   │
                    │              │           │  │ Forbidden        │  │ (no password)    │
                    │              │           │  └──────────────────┘  └────────────┬─────┘
                    │              │           │           │                        │
                    └──────────────┴───────────┴───────────┘                        │
                                                                                    ▼
                                                        ┌──────────────────────────┐
                                                        │ Return 200 OK with       │
                                                        │ LoginResponse            │
                                                        └──────────────────────────┘
```

## 6. Request/Response Cycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        REQUEST PHASE                                    │
│                                                                         │
│  POST /api/auth/login                                                  │
│  Content-Type: application/json                                        │
│                                                                         │
│  {                                                                      │
│    "email": "admin@example.com",                                       │
│    "password": "admin123"                                              │
│  }                                                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      PROCESSING PHASE                                  │
│                                                                         │
│  1. AuthController receives request                                    │
│  2. Validates: email != null && password != null                       │
│  3. Calls AuthService.login(request)                                   │
│  4. AuthService validates again                                        │
│  5. Calls UserRepository.findByEmail(email)                            │
│  6. If user not found → throw IllegalArgumentException                 │
│  7. If found → verify password                                         │
│  8. If password mismatch → throw IllegalArgumentException              │
│  9. Check user.active == true                                          │
│  10. If false → throw IllegalArgumentException                         │
│  11. Build LoginResponse (exclude password)                            │
│  12. Return LoginResponse                                              │
│                                                                         │
│  Exception handling:                                                    │
│    - IllegalArgumentException → Map to HTTP status                     │
│    - Check message for deactivated → 403                               │
│    - Otherwise → 401                                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       RESPONSE PHASE                                   │
│                                                                         │
│  HTTP/1.1 200 OK                                                       │
│  Content-Type: application/json                                        │
│                                                                         │
│  {                                                                      │
│    "id": 1,                                                             │
│    "name": "Admin User",                                               │
│    "email": "admin@example.com",                                       │
│    "departmentName": "Engineering",                                    │
│    "role": "ADMIN",                                                    │
│    "active": true,                                                     │
│    "createdAt": "2026-03-27T10:30:00"                                 │
│  }                                                                      │
│                                                                         │
│  ⚠️  NOTE: password is NEVER included                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

## 7. Data Flow Diagram

```
┌──────────────────┐
│  Client Request  │  {email: "x@x.com", password: "pass"}
└────────┬─────────┘
         │
         │ JSON parsing
         │ @RequestBody mapping
         ▼
┌──────────────────────────────────┐
│   LoginRequest Object            │
│ ├─ email: String                 │
│ └─ password: String              │
└────────┬─────────────────────────┘
         │
         │ Service call
         │
         ▼
┌──────────────────────────────────┐
│   AuthService.login()            │
│ - Validate input                 │
│ - Query database                 │
│ - Validate password              │
│ - Check active status            │
└────────┬─────────────────────────┘
         │
         │ Repository call
         │
         ▼
┌──────────────────────────────────┐
│   UserRepository.findByEmail()   │
│ - SQL: SELECT * FROM Users       │
│ - WHERE email = ?                │
└────────┬─────────────────────────┘
         │
         │ Database query
         │
         ▼
┌──────────────────────────────────┐
│   Database                       │
│ ├─ Users table                   │
│ └─ Returns User entity           │
└────────┬─────────────────────────┘
         │
         │ Entity mapping
         │
         ▼
┌──────────────────────────────────┐
│   User Entity                    │
│ ├─ id: 1                         │
│ ├─ name: "Admin User"            │
│ ├─ email: "x@x.com"              │
│ ├─ password: "pass"              │
│ ├─ role: ADMIN                   │
│ ├─ active: true                  │
│ ├─ departmentId: 1               │
│ └─ department: Department{}      │
└────────┬─────────────────────────┘
         │
         │ DTO conversion
         │ (exclude password)
         │
         ▼
┌──────────────────────────────────┐
│   LoginResponse DTO              │
│ ├─ id: 1                         │
│ ├─ name: "Admin User"            │
│ ├─ email: "x@x.com"              │
│ ├─ role: ADMIN                   │
│ ├─ departmentName: "Engineering" │
│ ├─ active: true                  │
│ ├─ createdAt: "2026-03-27..."    │
│ └─ ❌ password: NOT included    │
└────────┬─────────────────────────┘
         │
         │ JSON serialization
         │ ResponseEntity wrapping
         │
         ▼
┌──────────────────────────────────┐
│   HTTP Response (200 OK)         │
│   {JSON payload}                 │
└──────────────────────────────────┘
```

## 8. Decision Tree

```
                    ┌─ Login Request ─┐
                    │ {email, pass}   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────────┐
                    │ Email & pass null?  │
                    └────────┬────────┬───┘
                         YES │        │ NO
                             │        │
                             ▼        └────────┐
                    ┌──────────────┐           │
                    │ Return 400   │           │
                    └──────────────┘           │
                                              ▼
                    ┌──────────────────────────────────┐
                    │ Query User by email              │
                    └────────┬──────────────────────┬──┘
                         FOUND │                    │ NOT FOUND
                             │                      │
                             ▼                      ▼
                    ┌──────────────┐      ┌──────────────────────┐
                    │ Check Password       │ Return 401           │
                    │ Match?               │ (Invalid email)      │
                    └────┬─────────┬───┘   └──────────────────────┘
                     MATCH│        │ MISMATCH
                         │        └─────────┐
                         │                  │
                         ▼                  ▼
                    ┌──────────────┐      ┌──────────────────────┐
                    │ Check user   │      │ Return 401           │
                    │ active?      │      │ (Invalid password)   │
                    └────┬─────┬───┘      └──────────────────────┘
                   ACTIVE│     │ INACTIVE
                         │     │
                         ▼     ▼
                    ┌────────┐ ┌──────────────────────┐
                    │Build   │ │ Return 403           │
                    │Response│ │ (User deactivated)   │
                    └────┬───┘ └──────────────────────┘
                         │
                         ▼
                    ┌──────────────────────┐
                    │ Return 200 OK        │
                    │ + LoginResponse      │
                    │ (no password)        │
                    └──────────────────────┘
```

## 9. Error Handling Flow

```
                    ┌─ AuthService.login() ─┐
                    │    throws exception    │
                    └──────────┬─────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
        ┌──────────────────┐  ┌───────────────────────┐
        │ Exception Type   │  │ Exception Message     │
        └──────────────────┘  └───────────────────────┘
              │                        │
    ┌─────────┴─────────┐              │
    │                   │              │
    ▼                   ▼              ▼
┌─────────┐      ┌──────────┐  ┌────────────────────┐
│ IlegalA │      │ Other    │  │ Check for keyword  │
│ rgument │      │Exception │  │ "deactivated"      │
│Exception│      │          │  └────────────┬───────┘
└────┬────┘      └────┬─────┘              │
     │                │        ┌───────────┴────────┐
     │                │        │                    │
     │                │        ▼                    ▼
     │                │    ┌──────────┐      ┌──────────────┐
     │                │    │ YES      │      │ NO           │
     │                │    └────┬─────┘      └────┬─────────┘
     │                │         │                 │
     │                │         ▼                 ▼
     │                │    ┌──────────────┐  ┌──────────────┐
     │                │    │ Return 403   │  │ Return 401   │
     │                │    │ Forbidden    │  │ Unauthorized │
     │                │    └──────────────┘  └──────────────┘
     │                │
     │                └────┐
     │                     │
     └─────────┬───────────┘
               │
               ▼
        ┌──────────────────────────────┐
        │ Catch in AuthController      │
        │ Map to ResponseEntity        │
        └──────────────────────────────┘
```

---

These diagrams provide a complete visual understanding of:
- System architecture and components
- Request/response flows for different scenarios
- State transitions during authentication
- Data transformations
- Error handling logic
- Decision making process

Use these diagrams to understand the authentication system at a glance!

