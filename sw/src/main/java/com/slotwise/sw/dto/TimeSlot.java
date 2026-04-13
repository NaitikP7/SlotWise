package com.slotwise.sw.dto;

import java.time.LocalDateTime;

/**
 * TimeSlot DTO represents an available time slot for scheduling events
 * Uses LocalDateTime so the frontend receives full date+time values
 */
public class TimeSlot {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String slotType; // "available", "between_events", etc.

    // Constructors
    public TimeSlot() {
    }

    public TimeSlot(LocalDateTime startTime, LocalDateTime endTime) {
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public TimeSlot(LocalDateTime startTime, LocalDateTime endTime, String slotType) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.slotType = slotType;
    }

    // Getters and Setters
    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getSlotType() {
        return slotType;
    }

    public void setSlotType(String slotType) {
        this.slotType = slotType;
    }

    /**
     * Get duration of slot in minutes
     */
    public long getDurationMinutes() {
        if (startTime != null && endTime != null) {
            return java.time.temporal.ChronoUnit.MINUTES.between(startTime, endTime);
        }
        return 0;
    }

    @Override
    public String toString() {
        return "TimeSlot{" +
                "startTime=" + startTime +
                ", endTime=" + endTime +
                ", slotType='" + slotType + '\'' +
                '}';
    }
}
