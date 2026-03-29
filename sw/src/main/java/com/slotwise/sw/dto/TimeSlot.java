package com.slotwise.sw.dto;

import java.time.LocalTime;

/**
 * TimeSlot DTO represents an available time slot for scheduling events
 * Contains start time and end time
 */
public class TimeSlot {
    private LocalTime startTime;
    private LocalTime endTime;
    private String slotType; // "before_first", "between_events", "after_last"

    // Constructors
    public TimeSlot() {
    }

    public TimeSlot(LocalTime startTime, LocalTime endTime) {
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public TimeSlot(LocalTime startTime, LocalTime endTime, String slotType) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.slotType = slotType;
    }

    // Getters and Setters
    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
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

