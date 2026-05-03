package com.slotwise.sw.repository;

import com.slotwise.sw.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    /**
     * Find events by organizer ID — for "Your Events" page
     */
    List<Event> findByOrganizerId(Long organizerId);

    /**
     * Find all active events
     */
    List<Event> findByActiveTrue();

    /**
     * Find all inactive events
     */
    List<Event> findByActiveFalse();

    /**
     * Find events by title (case-insensitive)
     */
    List<Event> findByTitleIgnoreCase(String title);

    /**
     * Find events by location
     */
    List<Event> findByLocation(String location);

    /**
     * Find events that start after a specific date and time
     */
    List<Event> findByStartTimeAfter(LocalDateTime startTime);

    /**
     * Find events that end before a specific date and time
     */
    List<Event> findByEndTimeBefore(LocalDateTime endTime);

    /**
     * Find events within a date range
     */
    @Query("SELECT e FROM Event e WHERE e.startTime BETWEEN :startDate AND :endDate ORDER BY e.startTime ASC")
    List<Event> findEventsBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    /**
     * Find active events within a date range
     */
    @Query("SELECT e FROM Event e WHERE e.active = true AND e.startTime BETWEEN :startDate AND :endDate ORDER BY e.startTime ASC")
    List<Event> findActiveEventsBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    /**
     * Count total events
     */
    long countByActiveTrue();

    /**
     * Find all events for a specific venue on a given date
     * Used for collision detection
     */
    @Query("SELECT e FROM Event e WHERE e.venue.id = :venueId AND DATE(e.startTime) = :date ORDER BY e.startTime ASC")
    List<Event> findEventsByVenueAndDate(@Param("venueId") Long venueId, @Param("date") java.time.LocalDate date);

    /**
     * Find all active events for a specific venue on a given date
     */
    @Query("SELECT e FROM Event e WHERE e.venue.id = :venueId AND DATE(e.startTime) = :date AND e.active = true ORDER BY e.startTime ASC")
    List<Event> findActiveEventsByVenueAndDate(@Param("venueId") Long venueId, @Param("date") java.time.LocalDate date);

    /**
     * Check if event exists for a specific venue during a time range
     * Overlap detection: newStart < existingEnd AND existingStart < newEnd
     */
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END " +
           "FROM Event e WHERE e.venue.id = :venueId " +
           "AND e.startTime < :endTime AND e.endTime > :startTime " +
           "AND e.active = true")
    boolean existsEventConflict(@Param("venueId") Long venueId, 
                               @Param("startTime") LocalDateTime startTime,
                               @Param("endTime") LocalDateTime endTime);

    /**
     * Find the actual conflicting events for a venue and time range
     */
    @Query("SELECT e FROM Event e WHERE e.venue.id = :venueId " +
           "AND e.startTime < :endTime AND e.endTime > :startTime " +
           "AND e.active = true ORDER BY e.startTime ASC")
    List<Event> findConflictingEvents(@Param("venueId") Long venueId,
                                     @Param("startTime") LocalDateTime startTime,
                                     @Param("endTime") LocalDateTime endTime);

    /**
     * Check if event conflict exists excluding a specific event (for updates)
     */
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END " +
           "FROM Event e WHERE e.venue.id = :venueId " +
           "AND e.startTime < :endTime AND e.endTime > :startTime " +
           "AND e.active = true AND e.id <> :excludeId")
    boolean existsEventConflictExcluding(@Param("venueId") Long venueId,
                                        @Param("startTime") LocalDateTime startTime,
                                        @Param("endTime") LocalDateTime endTime,
                                        @Param("excludeId") Long excludeId);

    /**
     * Check conflict for a specific venue on a specific date and time range
     */
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END " +
           "FROM Event e WHERE e.venue.id = :venueId " +
           "AND e.startTime < :endTime AND e.endTime > :startTime " +
           "AND e.active = true")
    boolean existsConflictForVenueAndTime(@Param("venueId") Long venueId,
                                          @Param("startTime") LocalDateTime startTime,
                                          @Param("endTime") LocalDateTime endTime);

    // ========== Analytics Aggregate Queries ==========

    /**
     * Count events in date range
     */
    long countByStartTimeBetween(LocalDateTime from, LocalDateTime to);

    /**
     * Count active events in date range
     */
    long countByActiveTrueAndStartTimeBetween(LocalDateTime from, LocalDateTime to);

    /**
     * Events per month
     */
    @Query(value = "SELECT YEAR(start_time) as yr, MONTH(start_time) as mo, COUNT(*) as cnt " +
           "FROM events WHERE start_time BETWEEN :from AND :to " +
           "GROUP BY YEAR(start_time), MONTH(start_time) " +
           "ORDER BY yr, mo", nativeQuery = true)
    List<Object[]> countEventsPerMonth(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /**
     * Event type distribution
     */
    @Query("SELECT e.eventType, COUNT(e) FROM Event e " +
           "WHERE e.startTime BETWEEN :from AND :to AND e.eventType IS NOT NULL " +
           "GROUP BY e.eventType ORDER BY COUNT(e) DESC")
    List<Object[]> countByEventType(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /**
     * Events by day of week
     */
    @Query(value = "SELECT DAYOFWEEK(start_time) as dow, COUNT(*) as cnt " +
           "FROM events WHERE start_time BETWEEN :from AND :to " +
           "GROUP BY DAYOFWEEK(start_time) ORDER BY dow", nativeQuery = true)
    List<Object[]> countByDayOfWeek(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /**
     * Events per venue with booked hours
     */
    @Query(value = "SELECT e.venue_id, v.name, COUNT(*) as cnt, " +
           "SUM(TIMESTAMPDIFF(HOUR, e.start_time, e.end_time)) as booked_hours " +
           "FROM events e JOIN venues v ON e.venue_id = v.id " +
           "WHERE e.start_time BETWEEN :from AND :to AND e.venue_id IS NOT NULL " +
           "GROUP BY e.venue_id, v.name ORDER BY cnt DESC", nativeQuery = true)
    List<Object[]> countEventsPerVenue(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /**
     * Monthly events per venue (top 5 venues)
     */
    @Query(value = "SELECT e.venue_id, v.name, YEAR(e.start_time) as yr, MONTH(e.start_time) as mo, COUNT(*) as cnt " +
           "FROM events e JOIN venues v ON e.venue_id = v.id " +
           "WHERE e.start_time BETWEEN :from AND :to AND e.venue_id IS NOT NULL " +
           "GROUP BY e.venue_id, v.name, YEAR(e.start_time), MONTH(e.start_time) " +
           "ORDER BY v.name, yr, mo", nativeQuery = true)
    List<Object[]> countMonthlyEventsPerVenue(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /**
     * Events per organizer
     */
    @Query(value = "SELECT e.organiser_id, u.name, COUNT(*) as cnt " +
           "FROM events e JOIN users u ON e.organiser_id = u.id " +
           "WHERE e.start_time BETWEEN :from AND :to AND e.organiser_id IS NOT NULL " +
           "GROUP BY e.organiser_id, u.name ORDER BY cnt DESC", nativeQuery = true)
    List<Object[]> countEventsPerOrganizer(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /**
     * Events per department (via organizer -> department)
     */
    @Query(value = "SELECT d.id, d.name, i.name as inst_name, COUNT(*) as cnt " +
           "FROM events e " +
           "JOIN users u ON e.organiser_id = u.id " +
           "JOIN departments d ON u.department_id = d.id " +
           "JOIN institutes i ON d.institute_id = i.id " +
           "WHERE e.start_time BETWEEN :from AND :to AND e.organiser_id IS NOT NULL " +
           "GROUP BY d.id, d.name, i.name ORDER BY cnt DESC", nativeQuery = true)
    List<Object[]> countEventsPerDepartment(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /**
     * Count distinct venues that have events in date range
     */
    @Query("SELECT COUNT(DISTINCT e.venue.id) FROM Event e " +
           "WHERE e.startTime BETWEEN :from AND :to AND e.venue IS NOT NULL")
    long countDistinctVenuesWithEvents(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /**
     * Peak booking day of week
     */
    @Query(value = "SELECT DAYOFWEEK(start_time) as dow, COUNT(*) as cnt " +
           "FROM events WHERE start_time BETWEEN :from AND :to " +
           "GROUP BY DAYOFWEEK(start_time) ORDER BY cnt DESC LIMIT 1", nativeQuery = true)
    List<Object[]> findPeakBookingDay(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}

