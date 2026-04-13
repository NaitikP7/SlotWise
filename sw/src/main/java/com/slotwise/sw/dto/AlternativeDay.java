package com.slotwise.sw.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO representing an alternative day suggestion
 * Same time and venue, different date
 */
public class AlternativeDay {
    private LocalDate date;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    public AlternativeDay() {
    }

    public AlternativeDay(LocalDate date, LocalDateTime startTime, LocalDateTime endTime) {
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
}
