package com.slotwise.sw.dto.analytics;

/**
 * Shared DTO for monthly count data points used across analytics tabs
 */
public class MonthlyCount {
    private int year;
    private int month;
    private String label; // e.g. "Jan 2026"
    private long count;

    public MonthlyCount() {}

    public MonthlyCount(int year, int month, long count) {
        this.year = year;
        this.month = month;
        this.count = count;
        this.label = getMonthName(month) + " " + year;
    }

    private String getMonthName(int month) {
        String[] months = {"", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                           "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        return (month >= 1 && month <= 12) ? months[month] : "Unknown";
    }

    // Getters and Setters
    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
}
