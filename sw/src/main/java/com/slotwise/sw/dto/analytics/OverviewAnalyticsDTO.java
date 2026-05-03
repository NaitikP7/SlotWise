package com.slotwise.sw.dto.analytics;

import java.util.List;
import java.util.Map;

/**
 * DTO for Overview analytics tab
 */
public class OverviewAnalyticsDTO {
    private long totalEvents;
    private long activeEvents;
    private long activeVenues;
    private long totalVenues;
    private double averageUtilization; // percentage
    private long totalConflicts;
    private double eventsGrowthPercent; // vs previous period
    private long previousPeriodEvents;

    // Chart data
    private List<MonthlyCount> eventsPerMonth;
    private List<TypeCount> eventTypeDistribution;
    private List<DayCount> bookingsByDayOfWeek;

    public OverviewAnalyticsDTO() {}

    // Inner DTOs
    public static class TypeCount {
        private String type;
        private long count;

        public TypeCount() {}
        public TypeCount(String type, long count) {
            this.type = type;
            this.count = count;
        }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    public static class DayCount {
        private String day;
        private int dayNumber;
        private long count;

        public DayCount() {}
        public DayCount(String day, int dayNumber, long count) {
            this.day = day;
            this.dayNumber = dayNumber;
            this.count = count;
        }

        public String getDay() { return day; }
        public void setDay(String day) { this.day = day; }
        public int getDayNumber() { return dayNumber; }
        public void setDayNumber(int dayNumber) { this.dayNumber = dayNumber; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    // Getters and Setters
    public long getTotalEvents() { return totalEvents; }
    public void setTotalEvents(long totalEvents) { this.totalEvents = totalEvents; }

    public long getActiveEvents() { return activeEvents; }
    public void setActiveEvents(long activeEvents) { this.activeEvents = activeEvents; }

    public long getActiveVenues() { return activeVenues; }
    public void setActiveVenues(long activeVenues) { this.activeVenues = activeVenues; }

    public long getTotalVenues() { return totalVenues; }
    public void setTotalVenues(long totalVenues) { this.totalVenues = totalVenues; }

    public double getAverageUtilization() { return averageUtilization; }
    public void setAverageUtilization(double averageUtilization) { this.averageUtilization = averageUtilization; }

    public long getTotalConflicts() { return totalConflicts; }
    public void setTotalConflicts(long totalConflicts) { this.totalConflicts = totalConflicts; }

    public double getEventsGrowthPercent() { return eventsGrowthPercent; }
    public void setEventsGrowthPercent(double eventsGrowthPercent) { this.eventsGrowthPercent = eventsGrowthPercent; }

    public long getPreviousPeriodEvents() { return previousPeriodEvents; }
    public void setPreviousPeriodEvents(long previousPeriodEvents) { this.previousPeriodEvents = previousPeriodEvents; }

    public List<MonthlyCount> getEventsPerMonth() { return eventsPerMonth; }
    public void setEventsPerMonth(List<MonthlyCount> eventsPerMonth) { this.eventsPerMonth = eventsPerMonth; }

    public List<TypeCount> getEventTypeDistribution() { return eventTypeDistribution; }
    public void setEventTypeDistribution(List<TypeCount> eventTypeDistribution) { this.eventTypeDistribution = eventTypeDistribution; }

    public List<DayCount> getBookingsByDayOfWeek() { return bookingsByDayOfWeek; }
    public void setBookingsByDayOfWeek(List<DayCount> bookingsByDayOfWeek) { this.bookingsByDayOfWeek = bookingsByDayOfWeek; }
}
