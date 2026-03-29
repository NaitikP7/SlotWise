# Event Scheduling System - Collision Detection & Recommendation Implementation

## Overview

This document describes the implementation of an event collision detection and recommendation system for the Slotwise event scheduling application. The system prevents double-booking of venues and provides intelligent recommendations when conflicts occur.

---

## Architecture

### Components

1. **EventService** - Business logic for collision detection and recommendations
2. **EventRepository** - Database queries for event retrieval and collision detection
3. **EventController** - REST API endpoints with collision response handling
4. **Custom Exception** - EventCollisionException for controlled error handling
5. **DTOs** - TimeSlot and CollisionResponse for data transfer

### Design Principles

- **Clean Architecture**: Controller → Service → Repository pattern
- **DTO Pattern**: Separation of API contracts from entities
- **No Complex Data Structures**: Uses sorting and iteration (O(n log n) or O(n²))
- **Time-based Logic**: LocalDate and LocalTime for flexible scheduling

---

## Collision Detection Logic

### Overview

A collision occurs when two events occupy the same venue during overlapping time periods.

### Overlap Algorithm

The system uses the standard interval overlap detection:

```
Event A: startTime_A to endTime_A
Event B: startTime_B to endTime_B

Collision if: A.startTime < B.endTime AND B.startTime < A.endTime
```

This is implemented in `EventRepository.existsEventConflict()`:

```java
@Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END " +
       "FROM Event e WHERE e.venue.id = :venueId " +
       "AND e.startTime < :endTime AND e.endTime > :startTime " +
       "AND e.active = true")
boolean existsEventConflict(Long venueId, LocalDateTime startTime, LocalDateTime endTime);
```

### Collision Detection Flow

1. **Input Validation**: Check event title, start time, and end time
2. **DTO to Entity Conversion**: Convert request DTO to Event entity
3. **Collision Check**: Call `isCollision()` method
4. **Response Generation**:
   - **No collision**: Save event, return EventResponseDTO
   - **Collision**: Generate CollisionResponse with recommendations, throw EventCollisionException

### Service Methods

#### `boolean isCollision(Event newEvent)`

Checks if the new event conflicts with existing active events in the same venue.

**Parameters:**
- `newEvent`: Event object with venue, startTime, and endTime

**Returns:**
- `true` if collision detected
- `false` if no collision

**Logic:**
```
if (venue == null) return false
return eventRepository.existsEventConflict(venueId, startTime, endTime)
```

---

## Recommendation System

When a collision is detected, the system generates three types of recommendations:

### 1. Same Time, Different Venue

**Purpose**: Find alternative venues available at the requested time

**Logic:**
1. Fetch all venues in the system
2. Filter by criteria:
   - Capacity ≥ required capacity (original venue's capacity)
   - No time conflicts at that venue
   - Not the original venue

**Method:** `List<VenueResponseDTO> getSameTimeDifferentVenue(Event newEvent)`

**Query:**
```sql
SELECT venues WHERE:
  - capacity >= current_venue.capacity
  - venue.id != current_venue.id
  - NO conflict in [startTime, endTime]
```

**Time Complexity**: O(n) where n = number of venues

### 2. Same Venue, Different Time (Available Slots)

**Purpose**: Find available time slots in the same venue on the same date

**Logic:**
1. Get all active events for the venue on the event date
2. Sort by start time (already sorted by repository query)
3. Identify gaps:
   - Before first event (after 9:00 AM)
   - Between consecutive events
   - After last event (before 11:00 PM)
4. Filter slots by duration (must fit the event duration)

**Method:** `List<TimeSlot> getAvailableSlots(Event newEvent)`

**Algorithm:**

```
requiredDuration = event.endTime - event.startTime

availableSlots = []

// Slot before first event
firstEventStart = existingEvents[0].startTime
if (firstEventStart > 09:00):
    duration = firstEventStart - 09:00
    if (duration >= requiredDuration):
        availableSlots.add(TimeSlot(09:00, firstEventStart))

// Gaps between events
for i = 0 to existingEvents.size() - 2:
    currentEnd = existingEvents[i].endTime
    nextStart = existingEvents[i+1].startTime
    duration = nextStart - currentEnd
    if (duration >= requiredDuration):
        availableSlots.add(TimeSlot(currentEnd, nextStart))

// Slot after last event
lastEventEnd = existingEvents[-1].endTime
if (lastEventEnd < 23:00):
    duration = 23:00 - lastEventEnd
    if (duration >= requiredDuration):
        availableSlots.add(TimeSlot(lastEventEnd, 23:00))

return availableSlots
```

**Edge Cases Handled:**
- No existing events: Return full day slot
- Single event: Return before and after slots
- Fully occupied: Return empty list
- Exact fit gaps: Included in results

**Time Complexity**: O(n) where n = events on that date

### 3. Closest Available Slot

**Purpose**: Find the nearest available slot to the requested time

**Logic:**
1. Get all available slots using `getAvailableSlots()`
2. Calculate distance from requested start time to each slot's start time
3. Return slot with minimum distance

**Method:** `TimeSlot getClosestAvailableSlot(Event newEvent)`

**Algorithm:**

```
availableSlots = getAvailableSlots(newEvent)

if (availableSlots.empty):
    return null

requestedTime = newEvent.startTime

closest = availableSlots[0]
minDistance = abs(requestedTime - closest.startTime)

for each slot in availableSlots:
    distance = abs(requestedTime - slot.startTime)
    if (distance < minDistance):
        minDistance = distance
        closest = slot

return closest
```

**Distance Metric**: Minutes between requested time and slot start time

**Time Complexity**: O(n) where n = available slots

---

## DTO Handling

### Existing DTOs (Reused)

- **EventRequestDTO**: Input DTO with title, description, startTime, endTime, location, organizerId, venueId
- **EventResponseDTO**: Output DTO with all event details plus related entity names
- **VenueResponseDTO**: Venue details with institute information

### New DTOs (Created)

#### TimeSlot
```java
class TimeSlot {
    LocalTime startTime;
    LocalTime endTime;
    String slotType; // "all_day", "before_first", "between_events", "after_last"
}
```

**Purpose**: Represent a time slot for scheduling

#### CollisionResponse
```java
class CollisionResponse {
    boolean collision;
    String message;
    List<VenueResponseDTO> sameTimeAlternativeVenues;
    List<TimeSlot> availableTimeSlots;
    TimeSlot closestAvailableSlot;
}
```

**Purpose**: Encapsulate collision detection result with recommendations

**Usage**: Returned to client when collision occurs (HTTP 409)

---

## API Flow: Event Creation with Collision Handling

### Request
```http
POST /api/events
Content-Type: application/json

{
    "title": "Team Meeting",
    "description": "Quarterly planning",
    "startTime": "2026-04-15T14:00:00",
    "endTime": "2026-04-15T16:00:00",
    "location": "Main Office",
    "organizerId": 1,
    "venueId": 2
}
```

### Success Response (201 Created)
```json
{
    "id": 5,
    "title": "Team Meeting",
    "description": "Quarterly planning",
    "startTime": "2026-04-15T14:00:00",
    "endTime": "2026-04-15T16:00:00",
    "location": "Main Office",
    "active": true,
    "organizerId": 1,
    "organizerName": "John Doe",
    "venueId": 2,
    "venueName": "Conference Room A",
    "createdAt": "2026-03-27T10:00:00",
    "updatedAt": "2026-03-27T10:00:00"
}
```

### Collision Response (409 Conflict)
```json
{
    "collision": true,
    "message": "Event time conflict detected at this venue",
    "sameTimeAlternativeVenues": [
        {
            "id": 3,
            "name": "Conference Room B",
            "capacity": 50,
            "location": "Building 2",
            "instituteId": 1,
            "instituteName": "Main Institute",
            "createdAt": "2026-03-01T00:00:00",
            "updatedAt": "2026-03-01T00:00:00"
        },
        {
            "id": 4,
            "name": "Auditorium",
            "capacity": 200,
            "location": "Building 3",
            "instituteId": 1,
            "instituteName": "Main Institute",
            "createdAt": "2026-03-02T00:00:00",
            "updatedAt": "2026-03-02T00:00:00"
        }
    ],
    "availableTimeSlots": [
        {
            "startTime": "09:00:00",
            "endTime": "12:00:00",
            "slotType": "before_first"
        },
        {
            "startTime": "17:00:00",
            "endTime": "20:00:00",
            "slotType": "after_last"
        }
    ],
    "closestAvailableSlot": {
        "startTime": "17:00:00",
        "endTime": "20:00:00",
        "slotType": "after_last"
    }
}
```

---

## Implementation Details

### Service Methods Summary

| Method | Purpose | Returns |
|--------|---------|---------|
| `isCollision()` | Check for venue/time conflicts | boolean |
| `getSameTimeDifferentVenue()` | Alternative venues | List<VenueResponseDTO> |
| `getAvailableSlots()` | Available time slots | List<TimeSlot> |
| `getClosestAvailableSlot()` | Nearest slot to requested time | TimeSlot |
| `createEvent()` | Create event with collision detection | EventResponseDTO or throws EventCollisionException |
| `updateEvent()` | Update event with collision detection | EventResponseDTO or throws EventCollisionException |

### Repository Queries

| Query | Purpose |
|-------|---------|
| `existsEventConflict()` | Check overlap for venue and time range |
| `findActiveEventsByVenueAndDate()` | Get events for a specific venue on a date |
| `findEventsByVenueAndDate()` | Get all events (active/inactive) for venue on date |

---

## Edge Cases & Handling

### 1. No Events on Date
- **Scenario**: Creating first event on a date
- **Result**: Return all-day slot in availableSlots
- **Status**: ✅ Handled

### 2. Single Event
- **Scenario**: One event exists, creating second
- **Result**: Return before and after slots
- **Status**: ✅ Handled

### 3. Fully Occupied
- **Scenario**: Venue completely booked
- **Result**: Return empty availableSlots, closestSlot might be null
- **Status**: ✅ Handled

### 4. Exact Duration Match
- **Scenario**: Gap exactly matches required duration
- **Result**: Include in availableSlots
- **Status**: ✅ Handled

### 5. No Suitable Alternatives
- **Scenario**: No other venue available at requested time
- **Result**: sameTimeAlternativeVenues = []
- **Status**: ✅ Handled

### 6. Null Venue
- **Scenario**: Event with no venue assigned
- **Result**: isCollision() returns false
- **Status**: ✅ Handled

### 7. Day Boundary Cases
- **Scenario**: Events spanning midnight (not realistic for venues)
- **Result**: LocalDate ensures single-day slots
- **Status**: ✅ Handled via date filtering

---

## Performance Analysis

### Time Complexity

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| Collision Detection | O(1) | Database query |
| Alternative Venues | O(v) | v = number of venues |
| Available Slots | O(n log n) | n = events on date, sorting included in query |
| Closest Slot | O(s) | s = available slots |
| **Total Create Event** | **O(v)** | Collision dominates |

### Space Complexity

| Operation | Space | Notes |
|-----------|-------|-------|
| Collision Detection | O(1) | Boolean result |
| Alternative Venues | O(v) | v = venues returned |
| Available Slots | O(n) | n = gaps found |
| **Total Response** | **O(v + n)** | Combined |

### Database Optimization

- **existsEventConflict()**: Uses COUNT with CASE, efficient for existence check
- **findActiveEventsByVenueAndDate()**: Indexes on (venue_id, startTime, active)
- **No N+1 queries**: All recommendations generated from 1-2 queries

---

## Integration Points

### Service Layer
- `EventService.createEvent()`: Main entry point with collision check
- `EventService.updateEvent()`: Update with collision validation

### Controller Layer
- `EventController.createEvent()`: POST /api/events with collision response
- `EventController.updateEvent()`: PUT /api/events/{id} with collision response

### Exception Handling
- `EventCollisionException`: Caught in controller, returns CollisionResponse
- Preserves existing exception handling for validation errors

---

## Testing Scenarios

### Happy Path
1. Create event with no conflicts → Success (201)
2. Update event with no conflicts → Success (200)

### Collision Cases
1. Create event with venue/time conflict → Collision (409)
2. Update event with venue/time conflict → Collision (409)
3. No available alternatives → Empty lists but still (409)

### Alternative Suggestions
1. Multiple venues available → All returned in sameTimeAlternativeVenues
2. Multiple time slots available → All returned in availableTimeSlots
3. Closest slot calculation → Verified for correctness

---

## Future Enhancements

1. **Multi-venue Conflicts**: Organize with multiple rooms
2. **Capacity Warnings**: Events exceeding venue capacity
3. **Setup/Teardown Time**: Buffer between events
4. **Attendee Conflicts**: Check participant availability
5. **Recurring Events**: Handle series scheduling
6. **Caching**: Cache venue availability for performance
7. **Notifications**: Alert users of collisions
8. **Scheduling Optimization**: ML-based recommendations

---

## Code Quality

- **Clean Code**: Descriptive method names and clear logic
- **Comments**: Documented collision detection algorithm
- **Exception Safety**: Null checks throughout
- **Type Safety**: Proper use of Java types
- **No External Dependencies**: No MapStruct, just clean conversion
- **Production Ready**: Error handling, logging-ready structure

---

## Summary

This implementation provides a robust event scheduling system with intelligent collision detection and actionable recommendations. The system prevents double-booking while maintaining clean architecture and offering clients multiple alternatives when conflicts occur.

Key achievements:
- ✅ Collision detection with standard overlap algorithm
- ✅ Three types of intelligent recommendations
- ✅ Edge case handling
- ✅ Clean, maintainable code
- ✅ Production-ready exception handling
- ✅ Efficient database queries
- ✅ Comprehensive API responses

