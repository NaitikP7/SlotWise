package com.slotwise.sw.controller;

import com.slotwise.sw.dto.CollisionResponse;
import com.slotwise.sw.dto.EventRequestDTO;
import com.slotwise.sw.dto.EventResponseDTO;
import com.slotwise.sw.exception.EventCollisionException;
import com.slotwise.sw.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*", maxAge = 3600)
public class EventController {

    @Autowired
    private EventService eventService;

    /**
     * Get all events
     */
    @GetMapping
    public ResponseEntity<List<EventResponseDTO>> getAllEvents() {
        List<EventResponseDTO> events = eventService.getAllEvents();
        return new ResponseEntity<>(events, HttpStatus.OK);
    }

    /**
     * Get all active events
     */
    @GetMapping("/active")
    public ResponseEntity<List<EventResponseDTO>> getActiveEvents() {
        List<EventResponseDTO> events = eventService.getActiveEvents();
        return new ResponseEntity<>(events, HttpStatus.OK);
    }

    /**
     * Get event by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<EventResponseDTO> getEventById(@PathVariable Long id) {
        Optional<EventResponseDTO> event = eventService.getEventById(id);
        return event.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Create a new event
     * Returns CollisionResponse with alternatives if collision occurs
     */
    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody EventRequestDTO requestDTO) {
        try {
            EventResponseDTO savedEvent = eventService.createEvent(requestDTO);
            return new ResponseEntity<>(savedEvent, HttpStatus.CREATED);
        } catch (EventCollisionException e) {
            return new ResponseEntity<>(e.getCollisionResponse(), HttpStatus.CONFLICT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Pre-check for conflicts before creating the event
     * Returns 200 with CollisionResponse if conflict exists,
     * or 200 with { collision: false } if no conflict
     */
    @PostMapping("/check-conflict")
    public ResponseEntity<?> checkConflict(@RequestBody EventRequestDTO requestDTO) {
        try {
            CollisionResponse response = eventService.checkConflict(requestDTO);
            if (response != null) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            }
            // No conflict
            CollisionResponse noConflict = new CollisionResponse(false, "No conflict detected");
            return new ResponseEntity<>(noConflict, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update an event
     * Returns CollisionResponse with alternatives if collision occurs
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @RequestBody EventRequestDTO requestDTO) {
        try {
            EventResponseDTO updatedEvent = eventService.updateEvent(id, requestDTO);
            return new ResponseEntity<>(updatedEvent, HttpStatus.OK);
        } catch (EventCollisionException e) {
            return new ResponseEntity<>(e.getCollisionResponse(), HttpStatus.CONFLICT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Delete an event
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        try {
            eventService.deleteEvent(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Find events by title
     */
    @GetMapping("/search/title")
    public ResponseEntity<List<EventResponseDTO>> getEventsByTitle(@RequestParam String title) {
        List<EventResponseDTO> events = eventService.getEventsByTitle(title);
        return new ResponseEntity<>(events, HttpStatus.OK);
    }

    /**
     * Find events by organizer ID — for "Your Events" page
     */
    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<List<EventResponseDTO>> getEventsByOrganizer(@PathVariable Long organizerId) {
        List<EventResponseDTO> events = eventService.getEventsByOrganizer(organizerId);
        return new ResponseEntity<>(events, HttpStatus.OK);
    }

    /**
     * Find events by location
     */
    @GetMapping("/search/location")
    public ResponseEntity<List<EventResponseDTO>> getEventsByLocation(@RequestParam String location) {
        List<EventResponseDTO> events = eventService.getEventsByLocation(location);
        return new ResponseEntity<>(events, HttpStatus.OK);
    }

    /**
     * Find events within a date range
     */
    @GetMapping("/search/date-range")
    public ResponseEntity<List<EventResponseDTO>> getEventsBetweenDates(
            @RequestParam("start") LocalDateTime startDate,
            @RequestParam("end") LocalDateTime endDate) {
        List<EventResponseDTO> events = eventService.getEventsBetweenDates(startDate, endDate);
        return new ResponseEntity<>(events, HttpStatus.OK);
    }

    /**
     * Count total active events
     */
    @GetMapping("/count/active")
    public ResponseEntity<Long> countActiveEvents() {
        long count = eventService.countActiveEvents();
        return new ResponseEntity<>(count, HttpStatus.OK);
    }

    // ========== Conflict Log Management ==========

    @Autowired
    private com.slotwise.sw.service.ConflictLogService conflictLogService;

    /**
     * Update conflict status (PENDING → RESOLVED or IGNORED)
     */
    @PatchMapping("/conflicts/{conflictId}/resolve")
    public ResponseEntity<?> resolveConflict(
            @PathVariable Long conflictId,
            @RequestParam String status,
            @RequestParam(required = false) String resolutionType) {
        try {
            var updated = conflictLogService.updateStatus(conflictId, status, resolutionType);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Cancel an event (soft-cancel — sets active = false)
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelEvent(@PathVariable Long id) {
        try {
            var event = eventService.getEventById(id);
            if (event.isEmpty()) {
                return new ResponseEntity<>("Event not found", HttpStatus.NOT_FOUND);
            }
            EventRequestDTO cancelDTO = new EventRequestDTO();
            cancelDTO.setActive(false);
            cancelDTO.setTitle(event.get().getTitle());
            cancelDTO.setStartTime(event.get().getStartTime());
            cancelDTO.setEndTime(event.get().getEndTime());
            cancelDTO.setVenueId(event.get().getVenueId());
            cancelDTO.setOrganizerId(event.get().getOrganizerId());
            EventResponseDTO updatedEvent = eventService.updateEvent(id, cancelDTO);
            return new ResponseEntity<>(updatedEvent, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
