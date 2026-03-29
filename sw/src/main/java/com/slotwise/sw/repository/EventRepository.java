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
}

