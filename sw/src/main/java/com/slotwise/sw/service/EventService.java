package com.slotwise.sw.service;

import com.slotwise.sw.dto.*;
import com.slotwise.sw.entity.Event;
import com.slotwise.sw.entity.User;
import com.slotwise.sw.entity.Venue;
import com.slotwise.sw.exception.EventCollisionException;
import com.slotwise.sw.repository.EventRepository;
import com.slotwise.sw.repository.UserRepository;
import com.slotwise.sw.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VenueRepository venueRepository;

    // ========== DTO Conversion Methods ==========

    /**
     * Convert Event entity to EventResponseDTO
     */
    private EventResponseDTO convertToResponseDTO(Event event) {
        if (event == null) {
            return null;
        }

        String organizerName = null;
        Long organizerId = null;
        if (event.getOrganizer() != null) {
            organizerId = event.getOrganizer().getId();
            organizerName = event.getOrganizer().getName();
        }

        String venueName = null;
        Long venueId = null;
        if (event.getVenue() != null) {
            venueId = event.getVenue().getId();
            venueName = event.getVenue().getName();
        }

        return new EventResponseDTO(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getStartTime(),
                event.getEndTime(),
                event.getLocation(),
                event.getActive(),
                organizerId,
                organizerName,
                venueId,
                venueName,
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }

    /**
     * Convert EventRequestDTO to Event entity
     */
    private Event convertToEntity(EventRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        Event event = new Event();
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setStartTime(dto.getStartTime());
        event.setEndTime(dto.getEndTime());
        event.setLocation(dto.getLocation());
        event.setActive(dto.getActive() != null ? dto.getActive() : true);
        

        // Fetch organizer if provided
        if (dto.getOrganizerId() != null) {
            User organizer = userRepository.findById(dto.getOrganizerId())
                    .orElseThrow(() -> new RuntimeException("Organizer not found with ID: " + dto.getOrganizerId()));
            event.setOrganizer(organizer);
        }

        // Fetch venue if provided
        if (dto.getVenueId() != null) {
            Venue venue = venueRepository.findById(dto.getVenueId())
                    .orElseThrow(() -> new RuntimeException("Venue not found with ID: " + dto.getVenueId()));
            event.setVenue(venue);
        }

        return event;
    }

    // ========== Service Methods (now using DTOs) ==========

    /**
     * Get all events with response DTOs
     */
    public List<EventResponseDTO> getAllEvents() {
        return eventRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all active events with response DTOs
     */
    public List<EventResponseDTO> getActiveEvents() {
        return eventRepository.findByActiveTrue()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get event by ID with response DTO
     */
    public Optional<EventResponseDTO> getEventById(Long id) {
        return eventRepository.findById(id)
                .map(this::convertToResponseDTO);
    }

    /**
     * Create new event from request DTO
     */
    public EventResponseDTO createEvent(EventRequestDTO requestDTO) {
        // Validate input
        if (requestDTO.getTitle() == null || requestDTO.getTitle().isBlank()) {
            throw new IllegalArgumentException("Event title is required");
        }

        if (requestDTO.getStartTime() == null) {
            throw new IllegalArgumentException("Event start time is required");
        }

        if (requestDTO.getEndTime() == null) {
            throw new IllegalArgumentException("Event end time is required");
        }

        if (requestDTO.getEndTime().isBefore(requestDTO.getStartTime())) {
            throw new IllegalArgumentException("Event end time must be after start time");
        }

        // Convert DTO to entity and save
        Event event = convertToEntity(requestDTO);
        Event savedEvent = eventRepository.save(event);

        return convertToResponseDTO(savedEvent);
    }

    /**
     * Update event from request DTO
     */
    public EventResponseDTO updateEvent(Long id, EventRequestDTO requestDTO) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));

        // Validate time range
        if (requestDTO.getEndTime() != null && requestDTO.getStartTime() != null &&
                requestDTO.getEndTime().isBefore(requestDTO.getStartTime())) {
            throw new IllegalArgumentException("Event end time must be after start time");
        }

        event.setTitle(requestDTO.getTitle());
        event.setDescription(requestDTO.getDescription());
        event.setStartTime(requestDTO.getStartTime());
        event.setEndTime(requestDTO.getEndTime());
        event.setLocation(requestDTO.getLocation());

        if (requestDTO.getActive() != null) {
            event.setActive(requestDTO.getActive());
        }

        // Update organizer if provided
        if (requestDTO.getOrganizerId() != null) {
            User organizer = userRepository.findById(requestDTO.getOrganizerId())
                    .orElseThrow(() -> new RuntimeException("Organizer not found with ID: " + requestDTO.getOrganizerId()));
            event.setOrganizer(organizer);
        }

        // Update venue if provided
        if (requestDTO.getVenueId() != null) {
            Venue venue = venueRepository.findById(requestDTO.getVenueId())
                    .orElseThrow(() -> new RuntimeException("Venue not found with ID: " + requestDTO.getVenueId()));
            event.setVenue(venue);
        }

        Event updatedEvent = eventRepository.save(event);
        return convertToResponseDTO(updatedEvent);
    }

    /**
     * Delete event
     */
    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new RuntimeException("Event not found with ID: " + id);
        }
        eventRepository.deleteById(id);
    }

    /**
     * Find events by title
     */
    public List<EventResponseDTO> getEventsByTitle(String title) {
        return eventRepository.findByTitleIgnoreCase(title)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Find events by location
     */
    public List<EventResponseDTO> getEventsByLocation(String location) {
        return eventRepository.findByLocation(location)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Find events within a date range
     */
    public List<EventResponseDTO> getEventsBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        return eventRepository.findEventsBetweenDates(startDate, endDate)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Count total active events
     */
    public long countActiveEvents() {
        return eventRepository.countByActiveTrue();
    }
}

