package com.slotwise.sw.dto.analytics;

import java.util.List;

/**
 * DTO for Venue Analytics tab
 */
public class VenueAnalyticsDTO {
    // Top cards
    private String mostBookedVenue;
    private long mostBookedVenueCount;
    private String leastUsedVenue;
    private long leastUsedVenueCount;
    private double averageUtilization;
    private String peakBookingDay;

    // Chart data
    private List<VenueStat> venueStats;       // bookings comparison + utilization
    private List<VenueMonthly> monthlyByVenue; // month-wise bookings by venue

    public VenueAnalyticsDTO() {}

    public static class VenueStat {
        private Long venueId;
        private String venueName;
        private long bookingCount;
        private long bookedHours;
        private double utilizationPercent;
        private int capacity;

        public VenueStat() {}
        public VenueStat(Long venueId, String venueName, long bookingCount, long bookedHours, double utilizationPercent) {
            this.venueId = venueId;
            this.venueName = venueName;
            this.bookingCount = bookingCount;
            this.bookedHours = bookedHours;
            this.utilizationPercent = utilizationPercent;
        }

        public Long getVenueId() { return venueId; }
        public void setVenueId(Long venueId) { this.venueId = venueId; }
        public String getVenueName() { return venueName; }
        public void setVenueName(String venueName) { this.venueName = venueName; }
        public long getBookingCount() { return bookingCount; }
        public void setBookingCount(long bookingCount) { this.bookingCount = bookingCount; }
        public long getBookedHours() { return bookedHours; }
        public void setBookedHours(long bookedHours) { this.bookedHours = bookedHours; }
        public double getUtilizationPercent() { return utilizationPercent; }
        public void setUtilizationPercent(double utilizationPercent) { this.utilizationPercent = utilizationPercent; }
        public int getCapacity() { return capacity; }
        public void setCapacity(int capacity) { this.capacity = capacity; }
    }

    public static class VenueMonthly {
        private Long venueId;
        private String venueName;
        private int year;
        private int month;
        private String label;
        private long count;

        public VenueMonthly() {}
        public VenueMonthly(Long venueId, String venueName, int year, int month, long count) {
            this.venueId = venueId;
            this.venueName = venueName;
            this.year = year;
            this.month = month;
            this.count = count;
            String[] months = {"", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
            this.label = (month >= 1 && month <= 12) ? months[month] + " " + year : "Unknown";
        }

        public Long getVenueId() { return venueId; }
        public void setVenueId(Long venueId) { this.venueId = venueId; }
        public String getVenueName() { return venueName; }
        public void setVenueName(String venueName) { this.venueName = venueName; }
        public int getYear() { return year; }
        public void setYear(int year) { this.year = year; }
        public int getMonth() { return month; }
        public void setMonth(int month) { this.month = month; }
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    // Getters and Setters
    public String getMostBookedVenue() { return mostBookedVenue; }
    public void setMostBookedVenue(String mostBookedVenue) { this.mostBookedVenue = mostBookedVenue; }

    public long getMostBookedVenueCount() { return mostBookedVenueCount; }
    public void setMostBookedVenueCount(long mostBookedVenueCount) { this.mostBookedVenueCount = mostBookedVenueCount; }

    public String getLeastUsedVenue() { return leastUsedVenue; }
    public void setLeastUsedVenue(String leastUsedVenue) { this.leastUsedVenue = leastUsedVenue; }

    public long getLeastUsedVenueCount() { return leastUsedVenueCount; }
    public void setLeastUsedVenueCount(long leastUsedVenueCount) { this.leastUsedVenueCount = leastUsedVenueCount; }

    public double getAverageUtilization() { return averageUtilization; }
    public void setAverageUtilization(double averageUtilization) { this.averageUtilization = averageUtilization; }

    public String getPeakBookingDay() { return peakBookingDay; }
    public void setPeakBookingDay(String peakBookingDay) { this.peakBookingDay = peakBookingDay; }

    public List<VenueStat> getVenueStats() { return venueStats; }
    public void setVenueStats(List<VenueStat> venueStats) { this.venueStats = venueStats; }

    public List<VenueMonthly> getMonthlyByVenue() { return monthlyByVenue; }
    public void setMonthlyByVenue(List<VenueMonthly> monthlyByVenue) { this.monthlyByVenue = monthlyByVenue; }
}
