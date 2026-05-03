package com.slotwise.sw.controller;

import com.slotwise.sw.dto.analytics.*;
import com.slotwise.sw.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * AnalyticsController — Admin-only analytics endpoints
 * Provides aggregated data for the analytics dashboard
 */
@RestController
@RequestMapping("/api/admin/analytics")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    private static final LocalDateTime DEFAULT_FROM = LocalDateTime.of(2020, 1, 1, 0, 0);

    /**
     * GET /api/admin/analytics/overview?fromDate=...&toDate=...
     */
    @GetMapping("/overview")
    public ResponseEntity<OverviewAnalyticsDTO> getOverview(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) {
        try {
            LocalDateTime from = fromDate != null ? fromDate : DEFAULT_FROM;
            LocalDateTime to = toDate != null ? toDate : LocalDateTime.now();
            return ResponseEntity.ok(analyticsService.getOverviewAnalytics(from, to));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /api/admin/analytics/venue?fromDate=...&toDate=...
     */
    @GetMapping("/venue")
    public ResponseEntity<VenueAnalyticsDTO> getVenueAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) {
        try {
            LocalDateTime from = fromDate != null ? fromDate : DEFAULT_FROM;
            LocalDateTime to = toDate != null ? toDate : LocalDateTime.now();
            return ResponseEntity.ok(analyticsService.getVenueAnalytics(from, to));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /api/admin/analytics/conflicts?fromDate=...&toDate=...
     */
    @GetMapping("/conflicts")
    public ResponseEntity<ConflictAnalyticsDTO> getConflictAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) {
        try {
            LocalDateTime from = fromDate != null ? fromDate : DEFAULT_FROM;
            LocalDateTime to = toDate != null ? toDate : LocalDateTime.now();
            return ResponseEntity.ok(analyticsService.getConflictAnalytics(from, to));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /api/admin/analytics/departments?fromDate=...&toDate=...
     */
    @GetMapping("/departments")
    public ResponseEntity<DepartmentAnalyticsDTO> getDepartmentAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) {
        try {
            LocalDateTime from = fromDate != null ? fromDate : DEFAULT_FROM;
            LocalDateTime to = toDate != null ? toDate : LocalDateTime.now();
            return ResponseEntity.ok(analyticsService.getDepartmentAnalytics(from, to));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
