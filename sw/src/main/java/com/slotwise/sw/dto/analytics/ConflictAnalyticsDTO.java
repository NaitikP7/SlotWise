package com.slotwise.sw.dto.analytics;

import java.util.List;

/**
 * DTO for Conflict Resolution analytics tab
 */
public class ConflictAnalyticsDTO {
    // Top cards
    private long totalConflicts;
    private long resolvedConflicts;
    private double resolutionRatePercent;
    private double alternateSlotPercent;
    private double alternateVenuePercent;

    // Chart data
    private List<MonthlyCount> monthlyTrend;
    private List<VenueConflict> topConflictVenues;
    private List<ResolutionMethod> resolutionMethods;

    public ConflictAnalyticsDTO() {}

    public static class VenueConflict {
        private Long venueId;
        private String venueName;
        private long conflictCount;

        public VenueConflict() {}
        public VenueConflict(Long venueId, String venueName, long conflictCount) {
            this.venueId = venueId;
            this.venueName = venueName;
            this.conflictCount = conflictCount;
        }

        public Long getVenueId() { return venueId; }
        public void setVenueId(Long venueId) { this.venueId = venueId; }
        public String getVenueName() { return venueName; }
        public void setVenueName(String venueName) { this.venueName = venueName; }
        public long getConflictCount() { return conflictCount; }
        public void setConflictCount(long conflictCount) { this.conflictCount = conflictCount; }
    }

    public static class ResolutionMethod {
        private String method;
        private long count;
        private double percent;

        public ResolutionMethod() {}
        public ResolutionMethod(String method, long count, double percent) {
            this.method = method;
            this.count = count;
            this.percent = percent;
        }

        public String getMethod() { return method; }
        public void setMethod(String method) { this.method = method; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
        public double getPercent() { return percent; }
        public void setPercent(double percent) { this.percent = percent; }
    }

    // Getters and Setters
    public long getTotalConflicts() { return totalConflicts; }
    public void setTotalConflicts(long totalConflicts) { this.totalConflicts = totalConflicts; }

    public long getResolvedConflicts() { return resolvedConflicts; }
    public void setResolvedConflicts(long resolvedConflicts) { this.resolvedConflicts = resolvedConflicts; }

    public double getResolutionRatePercent() { return resolutionRatePercent; }
    public void setResolutionRatePercent(double resolutionRatePercent) { this.resolutionRatePercent = resolutionRatePercent; }

    public double getAlternateSlotPercent() { return alternateSlotPercent; }
    public void setAlternateSlotPercent(double alternateSlotPercent) { this.alternateSlotPercent = alternateSlotPercent; }

    public double getAlternateVenuePercent() { return alternateVenuePercent; }
    public void setAlternateVenuePercent(double alternateVenuePercent) { this.alternateVenuePercent = alternateVenuePercent; }

    public List<MonthlyCount> getMonthlyTrend() { return monthlyTrend; }
    public void setMonthlyTrend(List<MonthlyCount> monthlyTrend) { this.monthlyTrend = monthlyTrend; }

    public List<VenueConflict> getTopConflictVenues() { return topConflictVenues; }
    public void setTopConflictVenues(List<VenueConflict> topConflictVenues) { this.topConflictVenues = topConflictVenues; }

    public List<ResolutionMethod> getResolutionMethods() { return resolutionMethods; }
    public void setResolutionMethods(List<ResolutionMethod> resolutionMethods) { this.resolutionMethods = resolutionMethods; }

    // --- Phase 17: Enhanced analytics fields ---
    private int peakClashHour; // hour of day (0-23) with most conflicts
    private List<OrganizerConflict> topConflictOrganizers;

    public int getPeakClashHour() { return peakClashHour; }
    public void setPeakClashHour(int peakClashHour) { this.peakClashHour = peakClashHour; }

    public List<OrganizerConflict> getTopConflictOrganizers() { return topConflictOrganizers; }
    public void setTopConflictOrganizers(List<OrganizerConflict> topConflictOrganizers) { this.topConflictOrganizers = topConflictOrganizers; }

    public static class OrganizerConflict {
        private Long organizerId;
        private String organizerName;
        private long conflictCount;

        public OrganizerConflict() {}
        public OrganizerConflict(Long organizerId, String organizerName, long conflictCount) {
            this.organizerId = organizerId;
            this.organizerName = organizerName;
            this.conflictCount = conflictCount;
        }

        public Long getOrganizerId() { return organizerId; }
        public void setOrganizerId(Long organizerId) { this.organizerId = organizerId; }
        public String getOrganizerName() { return organizerName; }
        public void setOrganizerName(String organizerName) { this.organizerName = organizerName; }
        public long getConflictCount() { return conflictCount; }
        public void setConflictCount(long conflictCount) { this.conflictCount = conflictCount; }
    }
}
