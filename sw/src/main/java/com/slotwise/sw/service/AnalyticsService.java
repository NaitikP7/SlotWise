package com.slotwise.sw.service;

import com.slotwise.sw.dto.analytics.*;
import com.slotwise.sw.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private static final int AVAILABLE_HOURS_PER_DAY = 8; // 9AM to 5PM

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private ConflictLogRepository conflictLogRepository;

    private static final String[] DAY_NAMES = {"", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"};

    // ========== OVERVIEW ==========
    public OverviewAnalyticsDTO getOverviewAnalytics(LocalDateTime from, LocalDateTime to) {
        OverviewAnalyticsDTO dto = new OverviewAnalyticsDTO();

        // Top cards
        long totalEvents = eventRepository.countByStartTimeBetween(from, to);
        long activeEvents = eventRepository.countByActiveTrueAndStartTimeBetween(from, to);
        long totalVenues = venueRepository.count();
        long activeVenues = eventRepository.countDistinctVenuesWithEvents(from, to);
        long totalConflicts = conflictLogRepository.countByCreatedAtBetween(from, to);

        dto.setTotalEvents(totalEvents);
        dto.setActiveEvents(activeEvents);
        dto.setTotalVenues(totalVenues);
        dto.setActiveVenues(activeVenues);
        dto.setTotalConflicts(totalConflicts);

        // Events growth vs previous period
        Duration periodLength = Duration.between(from, to);
        LocalDateTime prevFrom = from.minus(periodLength);
        LocalDateTime prevTo = from;
        long prevEvents = eventRepository.countByStartTimeBetween(prevFrom, prevTo);
        dto.setPreviousPeriodEvents(prevEvents);
        if (prevEvents > 0) {
            dto.setEventsGrowthPercent(((double)(totalEvents - prevEvents) / prevEvents) * 100);
        } else if (totalEvents > 0) {
            dto.setEventsGrowthPercent(100.0);
        }

        // Average utilization
        dto.setAverageUtilization(calculateAverageUtilization(from, to, totalVenues));

        // Charts
        dto.setEventsPerMonth(buildMonthlyCountList(eventRepository.countEventsPerMonth(from, to)));
        dto.setEventTypeDistribution(buildTypeCountList(eventRepository.countByEventType(from, to)));
        dto.setBookingsByDayOfWeek(buildDayCountList(eventRepository.countByDayOfWeek(from, to)));

        return dto;
    }

    // ========== VENUE ANALYTICS ==========
    public VenueAnalyticsDTO getVenueAnalytics(LocalDateTime from, LocalDateTime to) {
        VenueAnalyticsDTO dto = new VenueAnalyticsDTO();

        List<Object[]> venueData = eventRepository.countEventsPerVenue(from, to);

        // Build venue stats
        long totalDays = Math.max(1, Duration.between(from, to).toDays());
        List<VenueAnalyticsDTO.VenueStat> venueStats = new ArrayList<>();
        for (Object[] row : venueData) {
            Long venueId = ((Number) row[0]).longValue();
            String venueName = (String) row[1];
            long bookingCount = ((Number) row[2]).longValue();
            long bookedHours = row[3] != null ? ((Number) row[3]).longValue() : 0;
            double availableHours = totalDays * AVAILABLE_HOURS_PER_DAY;
            double util = availableHours > 0 ? Math.min(100.0, (bookedHours / availableHours) * 100) : 0;

            VenueAnalyticsDTO.VenueStat stat = new VenueAnalyticsDTO.VenueStat(venueId, venueName, bookingCount, bookedHours, Math.round(util * 10.0) / 10.0);
            venueStats.add(stat);
        }
        dto.setVenueStats(venueStats);

        // Top cards
        if (!venueStats.isEmpty()) {
            VenueAnalyticsDTO.VenueStat most = venueStats.get(0);
            dto.setMostBookedVenue(most.getVenueName());
            dto.setMostBookedVenueCount(most.getBookingCount());

            VenueAnalyticsDTO.VenueStat least = venueStats.get(venueStats.size() - 1);
            dto.setLeastUsedVenue(least.getVenueName());
            dto.setLeastUsedVenueCount(least.getBookingCount());

            double avgUtil = venueStats.stream().mapToDouble(VenueAnalyticsDTO.VenueStat::getUtilizationPercent).average().orElse(0);
            dto.setAverageUtilization(Math.round(avgUtil * 10.0) / 10.0);
        }

        // Peak booking day
        List<Object[]> peakDay = eventRepository.findPeakBookingDay(from, to);
        if (!peakDay.isEmpty()) {
            int dow = ((Number) peakDay.get(0)[0]).intValue();
            dto.setPeakBookingDay(dow >= 1 && dow <= 7 ? DAY_NAMES[dow] : "N/A");
        }

        // Monthly by venue
        List<Object[]> monthlyVenue = eventRepository.countMonthlyEventsPerVenue(from, to);
        List<VenueAnalyticsDTO.VenueMonthly> monthlyByVenue = new ArrayList<>();
        for (Object[] row : monthlyVenue) {
            Long venueId = ((Number) row[0]).longValue();
            String venueName = (String) row[1];
            int year = ((Number) row[2]).intValue();
            int month = ((Number) row[3]).intValue();
            long count = ((Number) row[4]).longValue();
            monthlyByVenue.add(new VenueAnalyticsDTO.VenueMonthly(venueId, venueName, year, month, count));
        }
        dto.setMonthlyByVenue(monthlyByVenue);

        return dto;
    }

    // ========== CONFLICT ANALYTICS ==========
    public ConflictAnalyticsDTO getConflictAnalytics(LocalDateTime from, LocalDateTime to) {
        ConflictAnalyticsDTO dto = new ConflictAnalyticsDTO();

        long totalConflicts = conflictLogRepository.countByCreatedAtBetween(from, to);
        long resolvedConflicts = conflictLogRepository.countByResolvedTrueAndCreatedAtBetween(from, to);

        dto.setTotalConflicts(totalConflicts);
        dto.setResolvedConflicts(resolvedConflicts);
        dto.setResolutionRatePercent(totalConflicts > 0 ?
                Math.round((double) resolvedConflicts / totalConflicts * 1000.0) / 10.0 : 0);

        // Resolution methods
        List<Object[]> resMethods = conflictLogRepository.countByResolutionType(from, to);
        long resolvedTotal = resMethods.stream().mapToLong(r -> ((Number) r[1]).longValue()).sum();
        List<ConflictAnalyticsDTO.ResolutionMethod> methods = new ArrayList<>();

        long alternateSlotCount = 0;
        long alternateVenueCount = 0;

        for (Object[] row : resMethods) {
            String type = (String) row[0];
            long count = ((Number) row[1]).longValue();
            double pct = resolvedTotal > 0 ? Math.round((double) count / resolvedTotal * 1000.0) / 10.0 : 0;
            methods.add(new ConflictAnalyticsDTO.ResolutionMethod(formatResolutionType(type), count, pct));

            if ("ALTERNATE_SLOT".equals(type) || "ALTERNATE_DAY".equals(type)) {
                alternateSlotCount += count;
            } else if ("ALTERNATE_VENUE".equals(type)) {
                alternateVenueCount += count;
            }
        }
        dto.setResolutionMethods(methods);
        dto.setAlternateSlotPercent(totalConflicts > 0 ?
                Math.round((double) alternateSlotCount / totalConflicts * 1000.0) / 10.0 : 0);
        dto.setAlternateVenuePercent(totalConflicts > 0 ?
                Math.round((double) alternateVenueCount / totalConflicts * 1000.0) / 10.0 : 0);

        // Monthly trend
        dto.setMonthlyTrend(buildMonthlyCountList(conflictLogRepository.monthlyConflictTrend(from, to)));

        // Top conflict venues
        List<Object[]> topVenues = conflictLogRepository.topConflictVenues(from, to);
        List<ConflictAnalyticsDTO.VenueConflict> venueConflicts = new ArrayList<>();
        int limit = Math.min(10, topVenues.size());
        for (int i = 0; i < limit; i++) {
            Object[] row = topVenues.get(i);
            Long venueId = ((Number) row[0]).longValue();
            String venueName = (String) row[1];
            long count = ((Number) row[2]).longValue();
            venueConflicts.add(new ConflictAnalyticsDTO.VenueConflict(venueId, venueName, count));
        }
        dto.setTopConflictVenues(venueConflicts);

        // Peak clash hour
        List<Object[]> peakHour = conflictLogRepository.peakClashHour(from, to);
        if (!peakHour.isEmpty()) {
            dto.setPeakClashHour(((Number) peakHour.get(0)[0]).intValue());
        }

        // Top conflict organizers
        List<Object[]> orgData = conflictLogRepository.topConflictOrganizers(from, to);
        List<ConflictAnalyticsDTO.OrganizerConflict> orgConflicts = new ArrayList<>();
        int orgLimit = Math.min(10, orgData.size());
        for (int i = 0; i < orgLimit; i++) {
            Object[] row = orgData.get(i);
            Long orgId = ((Number) row[0]).longValue();
            String orgName = (String) row[1];
            long count = ((Number) row[2]).longValue();
            orgConflicts.add(new ConflictAnalyticsDTO.OrganizerConflict(orgId, orgName, count));
        }
        dto.setTopConflictOrganizers(orgConflicts);

        return dto;
    }

    // ========== DEPARTMENT ANALYTICS ==========
    public DepartmentAnalyticsDTO getDepartmentAnalytics(LocalDateTime from, LocalDateTime to) {
        DepartmentAnalyticsDTO dto = new DepartmentAnalyticsDTO();

        // Events by department
        List<Object[]> deptData = eventRepository.countEventsPerDepartment(from, to);
        List<DepartmentAnalyticsDTO.DeptStat> deptStats = new ArrayList<>();
        for (Object[] row : deptData) {
            Long deptId = ((Number) row[0]).longValue();
            String deptName = (String) row[1];
            String instName = (String) row[2];
            long count = ((Number) row[3]).longValue();
            deptStats.add(new DepartmentAnalyticsDTO.DeptStat(deptId, deptName, instName, count));
        }
        dto.setEventsByDepartment(deptStats);

        // Top cards
        if (!deptStats.isEmpty()) {
            dto.setMostActiveDepartment(deptStats.get(0).getDepartmentName());
            dto.setMostActiveDepartmentInstitute(deptStats.get(0).getInstituteName());
            dto.setMostActiveDeptEventCount(deptStats.get(0).getEventCount());
        }

        // Inactive departments (departments with 0 events in period)
        long totalDepts = departmentRepository.count();
        long activeDepts = deptStats.size();
        dto.setInactiveDepartments(Math.max(0, totalDepts - activeDepts));

        // Top organizers
        List<Object[]> orgData = eventRepository.countEventsPerOrganizer(from, to);
        List<DepartmentAnalyticsDTO.OrganizerStat> orgStats = new ArrayList<>();
        int orgLimit = Math.min(10, orgData.size());
        for (int i = 0; i < orgLimit; i++) {
            Object[] row = orgData.get(i);
            Long orgId = ((Number) row[0]).longValue();
            String orgName = (String) row[1];
            long count = ((Number) row[2]).longValue();
            orgStats.add(new DepartmentAnalyticsDTO.OrganizerStat(orgId, orgName, null, count));
        }
        dto.setTopOrganizers(orgStats);

        if (!orgStats.isEmpty()) {
            dto.setTopOrganizer(orgStats.get(0).getOrganizerName());
            dto.setTopOrganizerEventCount(orgStats.get(0).getEventCount());
        }

        // New users added in period
        long newUsers = userRepository.countByCreatedAtBetween(from, to);
        dto.setNewUsersAdded(newUsers);

        // Department growth trend (new users per month)
        List<Object[]> userGrowth = userRepository.countNewUsersPerMonth(from, to);
        dto.setDepartmentGrowthTrend(buildMonthlyCountList(userGrowth));

        return dto;
    }

    // ========== Helper Methods ==========

    private double calculateAverageUtilization(LocalDateTime from, LocalDateTime to, long totalVenues) {
        if (totalVenues == 0) return 0;
        long totalDays = Math.max(1, Duration.between(from, to).toDays());
        double totalAvailableHours = totalVenues * totalDays * AVAILABLE_HOURS_PER_DAY;

        List<Object[]> venueData = eventRepository.countEventsPerVenue(from, to);
        long totalBookedHours = 0;
        for (Object[] row : venueData) {
            if (row[3] != null) {
                totalBookedHours += ((Number) row[3]).longValue();
            }
        }

        return totalAvailableHours > 0 ?
                Math.round(totalBookedHours / totalAvailableHours * 1000.0) / 10.0 : 0;
    }

    private List<MonthlyCount> buildMonthlyCountList(List<Object[]> data) {
        List<MonthlyCount> list = new ArrayList<>();
        for (Object[] row : data) {
            int year = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            long count = ((Number) row[2]).longValue();
            list.add(new MonthlyCount(year, month, count));
        }
        return list;
    }

    private List<OverviewAnalyticsDTO.TypeCount> buildTypeCountList(List<Object[]> data) {
        List<OverviewAnalyticsDTO.TypeCount> list = new ArrayList<>();
        for (Object[] row : data) {
            String type = (String) row[0];
            long count = ((Number) row[1]).longValue();
            list.add(new OverviewAnalyticsDTO.TypeCount(type, count));
        }
        return list;
    }

    private List<OverviewAnalyticsDTO.DayCount> buildDayCountList(List<Object[]> data) {
        List<OverviewAnalyticsDTO.DayCount> list = new ArrayList<>();
        for (Object[] row : data) {
            int dayNum = ((Number) row[0]).intValue();
            long count = ((Number) row[1]).longValue();
            String dayName = (dayNum >= 1 && dayNum <= 7) ? DAY_NAMES[dayNum] : "Unknown";
            list.add(new OverviewAnalyticsDTO.DayCount(dayName, dayNum, count));
        }
        return list;
    }

    private String formatResolutionType(String type) {
        if (type == null) return "Unknown";
        switch (type) {
            case "ALTERNATE_SLOT": return "Alternate Slot";
            case "ALTERNATE_DAY": return "Alternate Day";
            case "ALTERNATE_VENUE": return "Alternate Venue";
            case "CANCELLED": return "Cancelled";
            default: return type;
        }
    }
}
