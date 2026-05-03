package com.slotwise.sw.repository;

import com.slotwise.sw.entity.ConflictLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ConflictLogRepository extends JpaRepository<ConflictLog, Long> {

    /**
     * Count total conflicts in date range
     */
    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    /**
     * Count resolved conflicts in date range
     */
    long countByResolvedTrueAndCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    /**
     * Count by resolution type in date range
     */
    @Query("SELECT c.resolutionType, COUNT(c) FROM ConflictLog c " +
           "WHERE c.createdAt BETWEEN :from AND :to AND c.resolutionType IS NOT NULL " +
           "GROUP BY c.resolutionType")
    List<Object[]> countByResolutionType(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /**
     * Monthly conflict trend
     */
    @Query(value = "SELECT YEAR(created_at) as yr, MONTH(created_at) as mo, COUNT(*) as cnt " +
           "FROM conflict_logs WHERE created_at BETWEEN :from AND :to " +
           "GROUP BY YEAR(created_at), MONTH(created_at) " +
           "ORDER BY yr, mo", nativeQuery = true)
    List<Object[]> monthlyConflictTrend(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /**
     * Venues with most conflicts
     */
    @Query("SELECT c.venueId, c.venueName, COUNT(c) FROM ConflictLog c " +
           "WHERE c.createdAt BETWEEN :from AND :to " +
           "GROUP BY c.venueId, c.venueName ORDER BY COUNT(c) DESC")
    List<Object[]> topConflictVenues(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /**
     * All conflicts in date range (recent first)
     */
    List<ConflictLog> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime from, LocalDateTime to);

    /**
     * Recent conflicts — top 20
     */
    List<ConflictLog> findTop20ByOrderByCreatedAtDesc();

    /**
     * Count by organizer — for finding frequent conflict causers
     */
    @Query("SELECT c.organizerId, c.organizerName, COUNT(c) FROM ConflictLog c " +
           "WHERE c.createdAt BETWEEN :from AND :to AND c.organizerId IS NOT NULL " +
           "GROUP BY c.organizerId, c.organizerName ORDER BY COUNT(c) DESC")
    List<Object[]> topConflictOrganizers(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /**
     * Peak clash hour — hour of day with most conflicts
     */
    @Query(value = "SELECT HOUR(requested_start_time) as hr, COUNT(*) as cnt " +
           "FROM conflict_logs WHERE created_at BETWEEN :from AND :to " +
           "GROUP BY HOUR(requested_start_time) ORDER BY cnt DESC LIMIT 1", nativeQuery = true)
    List<Object[]> peakClashHour(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /**
     * Count by status in date range
     */
    long countByStatusAndCreatedAtBetween(String status, LocalDateTime from, LocalDateTime to);
}
