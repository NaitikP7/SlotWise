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

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
@Transactional
public class EventService {

    private static final LocalTime DAY_START = LocalTime.of(9, 0);  // 9 AM
    private static final LocalTime DAY_END = LocalTime.of(17, 0);   // 5 PM
    private static final int MAX_ALTERNATIVE_SLOTS = 3;
    private static final int MAX_ALTERNATIVE_DAYS = 3;
    private static final int DAYS_TO_SEARCH = 7;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VenueRepository venueRepository;

    // ========== DTO Conversion Methods ==========

    private EventResponseDTO convertToResponseDTO(Event event) {
        if (event == null) return null;

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
                event.getId(), event.getTitle(), event.getDescription(),
                event.getStartTime(), event.getEndTime(), event.getLocation(),
                event.getActive(), organizerId, organizerName,
                venueId, venueName, event.getCreatedAt(), event.getUpdatedAt()
        );
    }

    private Event convertToEntity(EventRequestDTO dto) {
        if (dto == null) return null;

        Event event = new Event();
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setStartTime(dto.getStartTime());
        event.setEndTime(dto.getEndTime());
        event.setLocation(dto.getLocation());
        event.setActive(dto.getActive() != null ? dto.getActive() : true);

        if (dto.getOrganizerId() != null) {
            User organizer = userRepository.findById(dto.getOrganizerId())
                    .orElseThrow(() -> new RuntimeException("Organizer not found with ID: " + dto.getOrganizerId()));
            event.setOrganizer(organizer);
        }

        if (dto.getVenueId() != null) {
            Venue venue = venueRepository.findById(dto.getVenueId())
                    .orElseThrow(() -> new RuntimeException("Venue not found with ID: " + dto.getVenueId()));
            event.setVenue(venue);
        }

        return event;
    }

    private VenueResponseDTO convertVenueToDTO(Venue venue) {
        if (venue == null) return null;
        String instituteName = venue.getInstitute() != null ? venue.getInstitute().getName() : null;
        Long instituteId = venue.getInstitute() != null ? venue.getInstitute().getId() : null;
        return new VenueResponseDTO(
                venue.getId(), venue.getName(), venue.getCapacity(), venue.getLocation(),
                instituteId, instituteName, venue.getCreatedAt(), venue.getUpdatedAt()
        );
    }

    // ========== Service Methods ==========

    public List<EventResponseDTO> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::convertToResponseDTO).collect(Collectors.toList());
    }

    public List<EventResponseDTO> getActiveEvents() {
        return eventRepository.findByActiveTrue().stream()
                .map(this::convertToResponseDTO).collect(Collectors.toList());
    }

    public Optional<EventResponseDTO> getEventById(Long id) {
        return eventRepository.findById(id).map(this::convertToResponseDTO);
    }

    /**
     * Create new event — checks for conflicts and returns alternatives if found
     */
    public EventResponseDTO createEvent(EventRequestDTO requestDTO) {
        validateEventRequest(requestDTO);

        // Check for conflicts
        if (requestDTO.getVenueId() != null &&
            eventRepository.existsEventConflict(
                requestDTO.getVenueId(),
                requestDTO.getStartTime(),
                requestDTO.getEndTime())) {

            CollisionResponse collisionResponse = buildCollisionResponse(
                    requestDTO.getVenueId(),
                    requestDTO.getStartTime(),
                    requestDTO.getEndTime()
            );
            throw new EventCollisionException("Time slot already booked for this venue", collisionResponse);
        }

        Event event = convertToEntity(requestDTO);
        Event savedEvent = eventRepository.save(event);
        return convertToResponseDTO(savedEvent);
    }

    /**
     * Pre-check for conflicts without creating the event
     * Returns null if no conflict, or a CollisionResponse with alternatives
     */
    public CollisionResponse checkConflict(EventRequestDTO requestDTO) {
        validateEventRequest(requestDTO);

        if (requestDTO.getVenueId() != null &&
            eventRepository.existsEventConflict(
                requestDTO.getVenueId(),
                requestDTO.getStartTime(),
                requestDTO.getEndTime())) {

            return buildCollisionResponse(
                    requestDTO.getVenueId(),
                    requestDTO.getStartTime(),
                    requestDTO.getEndTime()
            );
        }
        return null; // No conflict
    }

    /**
     * Update event
     */
    public EventResponseDTO updateEvent(Long id, EventRequestDTO requestDTO) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));

        if (requestDTO.getEndTime() != null && requestDTO.getStartTime() != null &&
                requestDTO.getEndTime().isBefore(requestDTO.getStartTime())) {
            throw new IllegalArgumentException("Event end time must be after start time");
        }

        // Check for conflicts excluding the current event
        if (requestDTO.getVenueId() != null &&
            eventRepository.existsEventConflictExcluding(
                requestDTO.getVenueId(),
                requestDTO.getStartTime(),
                requestDTO.getEndTime(),
                id)) {

            CollisionResponse collisionResponse = buildCollisionResponse(
                    requestDTO.getVenueId(),
                    requestDTO.getStartTime(),
                    requestDTO.getEndTime()
            );
            throw new EventCollisionException("Time slot already booked for this venue", collisionResponse);
        }

        event.setTitle(requestDTO.getTitle());
        event.setDescription(requestDTO.getDescription());
        event.setStartTime(requestDTO.getStartTime());
        event.setEndTime(requestDTO.getEndTime());
        event.setLocation(requestDTO.getLocation());

        if (requestDTO.getActive() != null) {
            event.setActive(requestDTO.getActive());
        }

        if (requestDTO.getOrganizerId() != null) {
            User organizer = userRepository.findById(requestDTO.getOrganizerId())
                    .orElseThrow(() -> new RuntimeException("Organizer not found with ID: " + requestDTO.getOrganizerId()));
            event.setOrganizer(organizer);
        }

        if (requestDTO.getVenueId() != null) {
            Venue venue = venueRepository.findById(requestDTO.getVenueId())
                    .orElseThrow(() -> new RuntimeException("Venue not found with ID: " + requestDTO.getVenueId()));
            event.setVenue(venue);
        }

        Event updatedEvent = eventRepository.save(event);
        return convertToResponseDTO(updatedEvent);
    }

    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new RuntimeException("Event not found with ID: " + id);
        }
        eventRepository.deleteById(id);
    }

    public List<EventResponseDTO> getEventsByTitle(String title) {
        return eventRepository.findByTitleIgnoreCase(title).stream()
                .map(this::convertToResponseDTO).collect(Collectors.toList());
    }

    public List<EventResponseDTO> getEventsByLocation(String location) {
        return eventRepository.findByLocation(location).stream()
                .map(this::convertToResponseDTO).collect(Collectors.toList());
    }

    public List<EventResponseDTO> getEventsBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        return eventRepository.findEventsBetweenDates(startDate, endDate).stream()
                .map(this::convertToResponseDTO).collect(Collectors.toList());
    }

    public long countActiveEvents() {
        return eventRepository.countByActiveTrue();
    }

    // ========== Conflict Detection & Alternative Suggestions ==========

    private void validateEventRequest(EventRequestDTO requestDTO) {
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
    }

    /**
     * Build a complete collision response with alternatives
     */
    private CollisionResponse buildCollisionResponse(Long venueId, LocalDateTime startTime, LocalDateTime endTime) {
        // 1. Get conflicting event info
        ConflictingEventInfo conflictingInfo = getConflictingEventInfo(venueId, startTime, endTime);

        // 2. Get alternative time slots (same day, same venue)
        List<TimeSlot> alternativeTimeSlots = findAlternativeTimeSlots(venueId, startTime.toLocalDate(),
                Duration.between(startTime, endTime));

        // 3. Get alternative days (same time, same venue, different date)
        List<AlternativeDay> alternativeDays = findAlternativeDays(venueId, startTime, endTime,
                startTime.toLocalDate());

        // 4. Get alternative venues (same time, different venue)
        List<VenueResponseDTO> alternativeVenues = findAlternativeVenues(startTime, endTime, venueId);

        return new CollisionResponse(
                true,
                "This slot is already booked",
                conflictingInfo,
                alternativeTimeSlots,
                alternativeDays,
                alternativeVenues
        );
    }

    /**
     * Get details of the first conflicting event
     */
    private ConflictingEventInfo getConflictingEventInfo(Long venueId, LocalDateTime startTime, LocalDateTime endTime) {
        List<Event> conflicts = eventRepository.findConflictingEvents(venueId, startTime, endTime);
        if (conflicts.isEmpty()) {
            return null;
        }
        Event conflict = conflicts.get(0);
        String venueName = conflict.getVenue() != null ? conflict.getVenue().getName() : "Unknown";
        return new ConflictingEventInfo(
                conflict.getTitle(),
                conflict.getStartTime(),
                conflict.getEndTime(),
                venueName,
                venueId
        );
    }

    /**
     * Find 2-3 available time slots on the same day at the same venue
     * Scans from 9:00 AM to 5:00 PM in the event's duration-sized windows
     */
    private List<TimeSlot> findAlternativeTimeSlots(Long venueId, LocalDate date, Duration eventDuration) {
        List<TimeSlot> slots = new ArrayList<>();
        long durationMinutes = eventDuration.toMinutes();
        if (durationMinutes <= 0) durationMinutes = 60; // Default 1 hour

        // Get all existing events for this venue on this date
        List<Event> existingEvents = eventRepository.findActiveEventsByVenueAndDate(venueId, date);

        // Sort by start time
        existingEvents.sort(Comparator.comparing(Event::getStartTime));

        // Find gaps between events within operating hours
        LocalDateTime dayStart = LocalDateTime.of(date, DAY_START);
        LocalDateTime dayEnd = LocalDateTime.of(date, DAY_END);

        // Build list of busy periods
        List<LocalDateTime[]> busyPeriods = new ArrayList<>();
        for (Event e : existingEvents) {
            busyPeriods.add(new LocalDateTime[]{e.getStartTime(), e.getEndTime()});
        }

        // Find free slots
        LocalDateTime cursor = dayStart;
        for (LocalDateTime[] busy : busyPeriods) {
            if (slots.size() >= MAX_ALTERNATIVE_SLOTS) break;

            // If there's a gap before this busy period
            if (cursor.isBefore(busy[0])) {
                long gapMinutes = Duration.between(cursor, busy[0]).toMinutes();
                if (gapMinutes >= durationMinutes) {
                    LocalDateTime slotEnd = cursor.plusMinutes(durationMinutes);
                    if (!slotEnd.isAfter(dayEnd)) {
                        slots.add(new TimeSlot(cursor, slotEnd, "available"));
                    }
                }
            }
            // Move cursor past this busy period
            if (busy[1].isAfter(cursor)) {
                cursor = busy[1];
            }
        }

        // Check after last event
        if (slots.size() < MAX_ALTERNATIVE_SLOTS && cursor.isBefore(dayEnd)) {
            long gapMinutes = Duration.between(cursor, dayEnd).toMinutes();
            if (gapMinutes >= durationMinutes) {
                LocalDateTime slotEnd = cursor.plusMinutes(durationMinutes);
                if (!slotEnd.isAfter(dayEnd)) {
                    slots.add(new TimeSlot(cursor, slotEnd, "available"));
                }
            }
        }

        return slots;
    }

    /**
     * Find 2-3 available dates for the same time slot and venue
     * Checks the next 7 days starting from the day after the requested date
     */
    private List<AlternativeDay> findAlternativeDays(Long venueId, LocalDateTime startTime,
                                                      LocalDateTime endTime, LocalDate requestedDate) {
        List<AlternativeDay> alternatives = new ArrayList<>();
        LocalTime requestedStartTime = startTime.toLocalTime();
        LocalTime requestedEndTime = endTime.toLocalTime();

        for (int i = 1; i <= DAYS_TO_SEARCH && alternatives.size() < MAX_ALTERNATIVE_DAYS; i++) {
            LocalDate candidateDate = requestedDate.plusDays(i);
            LocalDateTime candidateStart = LocalDateTime.of(candidateDate, requestedStartTime);
            LocalDateTime candidateEnd = LocalDateTime.of(candidateDate, requestedEndTime);

            // Check if this slot is free
            boolean hasConflict = eventRepository.existsEventConflict(venueId, candidateStart, candidateEnd);
            if (!hasConflict) {
                alternatives.add(new AlternativeDay(candidateDate, candidateStart, candidateEnd));
            }
        }

        return alternatives;
    }

    /**
     * Find available venues at the same time and date
     * Returns all venues (except the conflicting one) that have no events during the requested time
     */
    private List<VenueResponseDTO> findAlternativeVenues(LocalDateTime startTime, LocalDateTime endTime,
                                                          Long excludeVenueId) {
        List<Venue> otherVenues = venueRepository.findAllByIdNot(excludeVenueId);
        List<VenueResponseDTO> available = new ArrayList<>();

        for (Venue venue : otherVenues) {
            boolean hasConflict = eventRepository.existsEventConflict(venue.getId(), startTime, endTime);
            if (!hasConflict) {
                available.add(convertVenueToDTO(venue));
            }
        }

        return available;
    }
}
