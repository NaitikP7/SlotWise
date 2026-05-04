# Software Requirements Specification (SRS) for SlotWise

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to present a detailed description of the SlotWise system. It will explain the purpose and features of the system, the interfaces of the system, what the system will do, the constraints under which it must operate, and how the system will react to external stimuli.

### 1.2 Scope
SlotWise is a comprehensive event scheduling and venue management platform designed for educational institutes or large organizations. The system facilitates the booking of venues for various events, prevents double-booking through an intelligent conflict detection and resolution engine, and provides detailed analytics on venue utilization and organizational activity. It serves both standard users (organizers) and administrators.

### 1.3 Definitions, Acronyms, and Abbreviations
*   **SRS**: Software Requirements Specification
*   **API**: Application Programming Interface
*   **DTO**: Data Transfer Object
*   **JPA**: Java Persistence API
*   **Soft Cancel**: Marking a record as inactive (`active = false`) rather than physically deleting it from the database.

---

## 2. Overall Description

### 2.1 Product Perspective
SlotWise is a distributed web application consisting of a React-based frontend and a Java Spring Boot backend. It utilizes a MySQL relational database for persistent data storage. The application is entirely self-contained and does not rely on external third-party scheduling APIs; it manages its own state, venues, and users.

### 2.2 Product Functions
The primary functions of the SlotWise system include:
*   **User Authentication & Authorization**: Secure login system differentiating between `USER` and `ADMIN` roles.
*   **Venue Management**: Creation, modification, and tracking of venues across various institutes.
*   **Event Scheduling**: Creating and managing events with specific start/end times, venues, and expected attendees.
*   **Conflict Detection & Resolution**: Automatically detecting scheduling overlaps and suggesting smart alternatives (alternative times, alternative days, alternative venues).
*   **Dashboard & Grid View**: Visual representation of venue availability and scheduled events.
*   **Analytics & Reporting**: Generating administrative insights regarding venue utilization, department activity, and event trends, with export capabilities (CSV, Excel, PDF).

### 2.3 User Classes and Characteristics
1.  **Standard User (Organizer)**: Belongs to a specific department. Can view the venue grid, schedule new events, and manage (update/cancel) their own events.
2.  **Administrator**: Has access to all standard features plus the Admin Dashboard. Can manage master data (Institutes, Departments, Users, Venues) and view system-wide analytics.

### 2.4 Operating Environment
*   **Client-Side**: Modern web browsers (Chrome, Firefox, Safari, Edge) supporting ES6 JavaScript.
*   **Server-Side**: Java Runtime Environment (JRE) 17, Spring Boot 4.x environment.
*   **Database**: MySQL Server.

---

## 3. System Features

### 3.1 Event Scheduling & Management
*   **Description**: Users can create, view, update, and cancel events. Events span specific start and end times and are assigned to specific venues.
*   **Functional Requirements**:
    *   The system shall allow users to view a dashboard grid mapping venues against time slots (09:00 to 17:00).
    *   The system shall support "Quick Add" functionality from empty grid cells.
    *   The system shall require an Event Title, Start Time, End Time, and Venue for creation.
    *   The system shall allow users to filter venues by capacity based on `expectedAttendees`.
    *   The system shall categorize user events into: Upcoming, Active Now, Completed, and Cancelled.
    *   The system shall allow users to modify or "soft-cancel" upcoming events they organize.

### 3.2 Intelligent Conflict Resolution
*   **Description**: The system must prevent venue double-booking and assist users in finding alternatives when conflicts arise.
*   **Functional Requirements**:
    *   The system shall perform a pre-check (`/check-conflict`) before event creation to detect overlaps.
    *   If a time overlap or venue clash occurs, the system shall throw an `EventCollisionException`.
    *   The system shall return a `CollisionResponse` payload containing:
        *   Details of the conflicting event (Name, Time, Venue, Organizer).
        *   Alternative Time Slots (same day, same venue).
        *   Alternative Days (same time slot, same venue).
        *   Alternative Venues (same time, different available venues).
    *   The system shall log conflicts in the `conflict_logs` table for administrative tracking.
    *   The frontend shall display a dedicated `ConflictResolutionPage` allowing the user to select one of the provided alternatives to seamlessly reschedule the event.

### 3.3 User & Authentication System
*   **Description**: Custom authentication handling login and user contextualization.
*   **Functional Requirements**:
    *   The system shall authenticate users using email and password.
    *   The system shall restrict access to inactive/deactivated users.
    *   The frontend shall maintain session state using React Context (`AuthContext`).
    *   The system shall redirect users based on their role (`ADMIN` vs `USER`).

### 3.4 Administrative Dashboard
*   **Description**: A dedicated suite of panels for administrators to manage master data.
*   **Functional Requirements**:
    *   The system shall provide a slide-out sidebar for mobile responsiveness.
    *   The system shall allow CRUD operations on Institutes.
    *   The system shall allow CRUD operations on Departments (linked to Institutes).
    *   The system shall allow CRUD operations on Venues (linked to Institutes, detailing capacity and location).
    *   The system shall allow CRUD operations on Users (assigning roles and departments).
    *   The system shall allow administrators to activate or deactivate users.

### 3.5 Analytics & Reporting
*   **Description**: Comprehensive data visualization for administrative oversight.
*   **Functional Requirements**:
    *   The system shall provide an Overview Tab displaying high-level metrics and monthly event trends.
    *   The system shall provide a Venue Analytics Tab detailing booking counts, booked hours, and utilization percentages.
    *   The system shall provide a Department Tab showing event counts and activity by department and institute.
    *   The system shall allow filtering analytics by custom date ranges.
    *   The system shall support exporting analytics data to CSV, Microsoft Excel (`.xlsx`), and PDF formats using libraries like `xlsx` and `jspdf`.

---

## 4. External Interface Requirements

### 4.1 User Interfaces
*   **Theme**: The application implements a modern UI using a custom `index.css` stylesheet, featuring badge indicators, glassmorphism elements, modal dialogs, and toast notifications.
*   **Responsiveness**: The UI shall be fully responsive, utilizing CSS Grid and Flexbox. The admin sidebar must collapse into a toggleable drawer on smaller screens.
*   **Visual Cues**: The scheduling grid shall use color swatches to distinguish between Available (empty) and Booked (light red/colored) slots.

### 4.2 Software Interfaces
*   **Backend Framework**: Spring Boot (Web, Data JPA).
*   **Database**: MySQL, connected via `mysql-connector-j`.
*   **Frontend Framework**: React 19, built with Vite.
*   **Data Visualization**: Recharts library for rendering analytical charts.

### 4.3 Communications Interfaces
*   **Protocol**: HTTP/HTTPS.
*   **Data Format**: JSON for all request and response payloads, configured via customized `JacksonConfig`.
*   **CORS**: Cross-Origin Resource Sharing is enabled on all backend controllers (allowing `*` origins for development).

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
*   The API shall respond to standard queries (e.g., fetching events) within 500ms.
*   The Conflict Resolution engine must calculate alternatives in real-time during the event creation flow.

### 5.2 Security Requirements
*   Admin endpoints (`/api/admin/*`) must be strictly protected and inaccessible to standard users (currently managed via frontend routing and backend role checks).
*   Passwords must be securely stored (hashing implementation expected in `AuthService`).
*   The system must prevent unauthorized modification of events (users can only edit events where they are the `organizerId`).

### 5.3 Reliability and Maintainability
*   The application employs the DTO (Data Transfer Object) pattern to decouple internal database entities from external API contracts.
*   Database schema relationships are strictly defined (e.g., Cascade deletion where appropriate, orphan removal).

---

## 6. System Architecture

### 6.1 Database Schema (Entities)
1.  **User**: `id`, `name`, `email`, `password`, `role`, `department_id`, `active`.
2.  **Institute**: `id`, `name`.
3.  **Department**: `id`, `name`, `institute_id`.
4.  **Venue**: `id`, `name`, `capacity`, `location`, `institute_id`.
5.  **Event**: `id`, `title`, `description`, `startTime`, `endTime`, `venue_id`, `organizer_id`, `eventType`, `expectedAttendees`, `active`.
6.  **ConflictLog**: Tracks overlapping requests, the conflicting event details, resolution type, and status.

### 6.2 Folder Structure
**Backend (`/sw/src/main/java/com/slotwise/sw/`)**:
*   `config/`: Configuration classes (e.g., Jackson JSON formatting).
*   `controller/`: REST API endpoints.
*   `dto/`: Data Transfer Objects for request/response payloads.
*   `entity/`: JPA Data Models.
*   `exception/`: Custom exceptions (e.g., `EventCollisionException`).
*   `repository/`: Spring Data JPA interfaces.
*   `service/`: Business logic layer.

**Frontend (`/slotwise-frontend/src/`)**:
*   `assets/`: Static files.
*   `components/`: Reusable UI components (Navbar, Modal, Toast, Analytics Tabs).
*   `context/`: React Context providers (AuthContext).
*   `hooks/`: Custom React hooks.
*   `pages/`: Main route components (MainApp, AdminPage, VenueGridPage, etc.).
*   `services/`: Axios API wrappers (`api.js`).
*   `utils/`: Utility functions (e.g., `exportUtils.js`).

---

## 7. API Endpoint Summary
*   **Auth**: `POST /api/auth/login`
*   **Events**: `GET /api/events`, `POST /api/events`, `PUT /api/events/{id}`, `POST /api/events/check-conflict`, `PATCH /api/events/{id}/cancel`
*   **Venues**: `GET /api/venues`, `POST /api/venues`, `GET /api/venues/institute/{id}`
*   **Institutes & Departments**: Standard CRUD endpoints.
*   **Analytics**: `GET /api/admin/analytics/overview`, `/venue`, `/departments`, `/conflicts`
