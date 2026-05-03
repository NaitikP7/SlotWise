package com.slotwise.sw.dto;

import java.time.LocalDateTime;

/**
 * DTO containing details of a conflicting event
 * Shown to the user on the Conflict Resolution Page
 */
public class ConflictingEventInfo {
    private String eventName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String venueName;
    private Long venueId;

    public ConflictingEventInfo() {
    }

    public ConflictingEventInfo(String eventName, LocalDateTime startTime, LocalDateTime endTime,
                                String venueName, Long venueId) {
        this.eventName = eventName;
        this.startTime = startTime;
        this.endTime = endTime;
        this.venueName = venueName;
        this.venueId = venueId;
    }

    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public String getVenueName() { return venueName; }
    public void setVenueName(String venueName) { this.venueName = venueName; }

    public Long getVenueId() { return venueId; }
    public void setVenueId(Long venueId) { this.venueId = venueId; }

    private String organizerName;
    public String getOrganizerName() { return organizerName; }
    public void setOrganizerName(String organizerName) { this.organizerName = organizerName; }
}
