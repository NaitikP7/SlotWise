package com.slotwise.sw.controller;

import com.slotwise.sw.dto.EventRequestDTO;
import com.slotwise.sw.dto.EventResponseDTO;
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
     */
    @PostMapping
    public ResponseEntity<EventResponseDTO> createEvent(@RequestBody EventRequestDTO requestDTO) {
        try {
            EventResponseDTO savedEvent = eventService.createEvent(requestDTO);
            return new ResponseEntity<>(savedEvent, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update an event
     */
    @PutMapping("/{id}")
    public ResponseEntity<EventResponseDTO> updateEvent(@PathVariable Long id, @RequestBody EventRequestDTO requestDTO) {
        try {
            EventResponseDTO updatedEvent = eventService.updateEvent(id, requestDTO);
            return new ResponseEntity<>(updatedEvent, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
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
}



