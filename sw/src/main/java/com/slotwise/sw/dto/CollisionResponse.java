package com.slotwise.sw.dto;

import java.util.List;

/**
 * CollisionResponse DTO returned when an event collision is detected
 * Contains error message, conflicting event details, and alternative recommendations
 */
public class CollisionResponse {
    private boolean collision;
    private String message;
    private ConflictingEventInfo conflictingEvent;
    private List<TimeSlot> alternativeTimeSlots;
    private List<AlternativeDay> alternativeDays;
    private List<VenueResponseDTO> alternativeVenues;

    // Constructors
    public CollisionResponse() {
    }

    public CollisionResponse(boolean collision, String message) {
        this.collision = collision;
        this.message = message;
    }

    public CollisionResponse(boolean collision, String message,
                             ConflictingEventInfo conflictingEvent,
                             List<TimeSlot> alternativeTimeSlots,
                             List<AlternativeDay> alternativeDays,
                             List<VenueResponseDTO> alternativeVenues) {
        this.collision = collision;
        this.message = message;
        this.conflictingEvent = conflictingEvent;
        this.alternativeTimeSlots = alternativeTimeSlots;
        this.alternativeDays = alternativeDays;
        this.alternativeVenues = alternativeVenues;
    }

    // Getters and Setters
    public boolean isCollision() { return collision; }
    public void setCollision(boolean collision) { this.collision = collision; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public ConflictingEventInfo getConflictingEvent() { return conflictingEvent; }
    public void setConflictingEvent(ConflictingEventInfo conflictingEvent) { this.conflictingEvent = conflictingEvent; }

    public List<TimeSlot> getAlternativeTimeSlots() { return alternativeTimeSlots; }
    public void setAlternativeTimeSlots(List<TimeSlot> alternativeTimeSlots) { this.alternativeTimeSlots = alternativeTimeSlots; }

    public List<AlternativeDay> getAlternativeDays() { return alternativeDays; }
    public void setAlternativeDays(List<AlternativeDay> alternativeDays) { this.alternativeDays = alternativeDays; }

    public List<VenueResponseDTO> getAlternativeVenues() { return alternativeVenues; }
    public void setAlternativeVenues(List<VenueResponseDTO> alternativeVenues) { this.alternativeVenues = alternativeVenues; }
}
