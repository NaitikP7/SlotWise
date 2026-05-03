package com.slotwise.sw.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "conflict_logs")
public class ConflictLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "venue_id", nullable = false)
    private Long venueId;

    @Column(name = "venue_name", length = 255)
    private String venueName;

    @Column(name = "requested_start_time", nullable = false)
    private LocalDateTime requestedStartTime;

    @Column(name = "requested_end_time", nullable = false)
    private LocalDateTime requestedEndTime;

    // --- New: requested event details ---
    @Column(name = "requested_event_title", length = 255)
    private String requestedEventTitle;

    @Column(name = "conflict_type", length = 50)
    private String conflictType; // VENUE_CLASH, TIME_OVERLAP

    @Column(name = "status", length = 20)
    private String status = "PENDING"; // PENDING, RESOLVED, IGNORED

    // --- Existing conflicting event info ---
    @Column(name = "conflicting_event_id")
    private Long conflictingEventId;

    @Column(name = "conflicting_event_title", length = 255)
    private String conflictingEventTitle;

    @Column(name = "conflicting_event_organizer", length = 255)
    private String conflictingEventOrganizer;

    // --- Requester info ---
    @Column(name = "organizer_id")
    private Long organizerId;

    @Column(name = "organizer_name", length = 255)
    private String organizerName;

    @Column(name = "resolution_type", length = 50)
    private String resolutionType; // ALTERNATE_SLOT, ALTERNATE_DAY, ALTERNATE_VENUE, CANCELLED, null

    @Column(nullable = false)
    private Boolean resolved = false;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
    }

    // Constructors
    public ConflictLog() {
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getVenueId() { return venueId; }
    public void setVenueId(Long venueId) { this.venueId = venueId; }

    public String getVenueName() { return venueName; }
    public void setVenueName(String venueName) { this.venueName = venueName; }

    public LocalDateTime getRequestedStartTime() { return requestedStartTime; }
    public void setRequestedStartTime(LocalDateTime requestedStartTime) { this.requestedStartTime = requestedStartTime; }

    public LocalDateTime getRequestedEndTime() { return requestedEndTime; }
    public void setRequestedEndTime(LocalDateTime requestedEndTime) { this.requestedEndTime = requestedEndTime; }

    public String getRequestedEventTitle() { return requestedEventTitle; }
    public void setRequestedEventTitle(String requestedEventTitle) { this.requestedEventTitle = requestedEventTitle; }

    public String getConflictType() { return conflictType; }
    public void setConflictType(String conflictType) { this.conflictType = conflictType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getConflictingEventId() { return conflictingEventId; }
    public void setConflictingEventId(Long conflictingEventId) { this.conflictingEventId = conflictingEventId; }

    public String getConflictingEventTitle() { return conflictingEventTitle; }
    public void setConflictingEventTitle(String conflictingEventTitle) { this.conflictingEventTitle = conflictingEventTitle; }

    public String getConflictingEventOrganizer() { return conflictingEventOrganizer; }
    public void setConflictingEventOrganizer(String conflictingEventOrganizer) { this.conflictingEventOrganizer = conflictingEventOrganizer; }

    public Long getOrganizerId() { return organizerId; }
    public void setOrganizerId(Long organizerId) { this.organizerId = organizerId; }

    public String getOrganizerName() { return organizerName; }
    public void setOrganizerName(String organizerName) { this.organizerName = organizerName; }

    public String getResolutionType() { return resolutionType; }
    public void setResolutionType(String resolutionType) { this.resolutionType = resolutionType; }

    public Boolean getResolved() { return resolved; }
    public void setResolved(Boolean resolved) { this.resolved = resolved; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
