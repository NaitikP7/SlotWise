package com.slotwise.sw.dto.analytics;

import java.util.List;

/**
 * DTO for Department Activity analytics tab
 */
public class DepartmentAnalyticsDTO {
    // Top cards
    private String mostActiveDepartment;
    private String mostActiveDepartmentInstitute;
    private long mostActiveDeptEventCount;
    private String topOrganizer;
    private long topOrganizerEventCount;
    private long inactiveDepartments;
    private long newUsersAdded;

    // Chart data
    private List<DeptStat> eventsByDepartment;
    private List<OrganizerStat> topOrganizers;
    private List<MonthlyCount> departmentGrowthTrend; // new users per month

    public DepartmentAnalyticsDTO() {}

    public static class DeptStat {
        private Long departmentId;
        private String departmentName;
        private String instituteName;
        private long eventCount;

        public DeptStat() {}
        public DeptStat(Long departmentId, String departmentName, String instituteName, long eventCount) {
            this.departmentId = departmentId;
            this.departmentName = departmentName;
            this.instituteName = instituteName;
            this.eventCount = eventCount;
        }

        public Long getDepartmentId() { return departmentId; }
        public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
        public String getDepartmentName() { return departmentName; }
        public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
        public String getInstituteName() { return instituteName; }
        public void setInstituteName(String instituteName) { this.instituteName = instituteName; }
        public long getEventCount() { return eventCount; }
        public void setEventCount(long eventCount) { this.eventCount = eventCount; }
    }

    public static class OrganizerStat {
        private Long organizerId;
        private String organizerName;
        private String departmentName;
        private long eventCount;

        public OrganizerStat() {}
        public OrganizerStat(Long organizerId, String organizerName, String departmentName, long eventCount) {
            this.organizerId = organizerId;
            this.organizerName = organizerName;
            this.departmentName = departmentName;
            this.eventCount = eventCount;
        }

        public Long getOrganizerId() { return organizerId; }
        public void setOrganizerId(Long organizerId) { this.organizerId = organizerId; }
        public String getOrganizerName() { return organizerName; }
        public void setOrganizerName(String organizerName) { this.organizerName = organizerName; }
        public String getDepartmentName() { return departmentName; }
        public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
        public long getEventCount() { return eventCount; }
        public void setEventCount(long eventCount) { this.eventCount = eventCount; }
    }

    // Getters and Setters
    public String getMostActiveDepartment() { return mostActiveDepartment; }
    public void setMostActiveDepartment(String mostActiveDepartment) { this.mostActiveDepartment = mostActiveDepartment; }

    public String getMostActiveDepartmentInstitute() { return mostActiveDepartmentInstitute; }
    public void setMostActiveDepartmentInstitute(String v) { this.mostActiveDepartmentInstitute = v; }

    public long getMostActiveDeptEventCount() { return mostActiveDeptEventCount; }
    public void setMostActiveDeptEventCount(long mostActiveDeptEventCount) { this.mostActiveDeptEventCount = mostActiveDeptEventCount; }

    public String getTopOrganizer() { return topOrganizer; }
    public void setTopOrganizer(String topOrganizer) { this.topOrganizer = topOrganizer; }

    public long getTopOrganizerEventCount() { return topOrganizerEventCount; }
    public void setTopOrganizerEventCount(long topOrganizerEventCount) { this.topOrganizerEventCount = topOrganizerEventCount; }

    public long getInactiveDepartments() { return inactiveDepartments; }
    public void setInactiveDepartments(long inactiveDepartments) { this.inactiveDepartments = inactiveDepartments; }

    public long getNewUsersAdded() { return newUsersAdded; }
    public void setNewUsersAdded(long newUsersAdded) { this.newUsersAdded = newUsersAdded; }

    public List<DeptStat> getEventsByDepartment() { return eventsByDepartment; }
    public void setEventsByDepartment(List<DeptStat> eventsByDepartment) { this.eventsByDepartment = eventsByDepartment; }

    public List<OrganizerStat> getTopOrganizers() { return topOrganizers; }
    public void setTopOrganizers(List<OrganizerStat> topOrganizers) { this.topOrganizers = topOrganizers; }

    public List<MonthlyCount> getDepartmentGrowthTrend() { return departmentGrowthTrend; }
    public void setDepartmentGrowthTrend(List<MonthlyCount> departmentGrowthTrend) { this.departmentGrowthTrend = departmentGrowthTrend; }
}
