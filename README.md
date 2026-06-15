# SlotWise – Event Scheduling and Analytics System

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-green)
![React](https://img.shields.io/badge/React-Frontend-blue)
![MySQL](https://img.shields.io/badge/MySQL-Database-lightblue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Overview

SlotWise is a full-stack web application designed to streamline institutional event scheduling and venue management. The platform enables administrators to efficiently schedule events, manage venues, prevent scheduling conflicts, and analyze event trends through an interactive dashboard.

By automating scheduling operations and venue allocation, SlotWise improves resource utilization and eliminates manual coordination challenges.

---

## Features

### Event Management
- Create, update, and delete events
- View all scheduled events
- Manage event details such as date, time, venue, and event type

### Venue Management
- Add and manage venues
- Track venue occupancy
- Monitor venue utilization

### Conflict Detection
- Detect overlapping bookings automatically
- Prevent double-booking of venues
- Real-time scheduling validation

### Department & Institute Management
- Manage institutes and departments
- Associate events with departments
- Centralized administration

### Analytics Dashboard
- Event type distribution
- Venue-wise event statistics
- Occupancy tracking
- Filter analytics by venue

### Responsive Design
- Modern UI built with React and Tailwind CSS
- Mobile-friendly layouts
- Seamless user experience

---

## Technology Stack

### Frontend
- React.js
- Tailwind CSS
- JavaScript

### Backend
- Java 17
- Spring Boot
- Spring Data JPA
- Hibernate

### Database
- MySQL

---

## Architecture

```text
React Frontend
      │
      ▼
 REST API
      │
      ▼
Spring Boot Backend
      │
      ▼
 MySQL Database
```

---

## Database Modules

### Users
Stores user authentication and profile information.

### Institutes
Stores institute details.

### Departments
Stores department information linked to institutes.

### Venues
Maintains venue details and capacities.

### Events
Stores:
- Event Name
- Event Type
- Date
- Start Time
- End Time
- Venue
- Department

---

## Conflict Detection Logic

A scheduling conflict occurs when:

```text
New Event Start < Existing Event End
AND
New Event End > Existing Event Start
```

If both conditions are true, the booking is rejected to prevent venue conflicts.

---

## Analytics

The analytics dashboard provides:

- Total Events Overview
- Event Type Distribution
- Venue Utilization Statistics
- Occupancy Tracking
- Venue-Specific Filtering

These insights help administrators optimize venue allocation and event scheduling.

---

## Project Structure

```text
SlotWise/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── services/
│
├── backend/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── model/
│   └── config/
│
└── database/
    └── schema.sql
```

---

## Future Enhancements

- Email Notifications
- Calendar Integration
- Role-Based Access Control
- Export Reports to PDF/Excel
- Advanced Analytics Dashboard
- AI-Based Event Scheduling Recommendations

---

## Learning Outcomes

This project demonstrates:

- Full-Stack Development
- REST API Design
- Database Design and Normalization
- Spring Boot Development
- React Application Development
- Conflict Detection Algorithms
- Data Visualization and Analytics

---

## Author

Developed as a Full-Stack Software Engineering Project focused on event scheduling optimization, venue management, and analytics-driven decision making.

---

## Repository Description

SlotWise is a full-stack Event Scheduling and Analytics System built using React, Spring Boot, and MySQL. It provides event management, venue allocation, conflict detection, occupancy tracking, and analytics dashboards for efficient scheduling operations.
