package com.slotwise.sw.service;

import com.slotwise.sw.dto.CollisionResponse;
import com.slotwise.sw.dto.ConflictingEventInfo;
import com.slotwise.sw.dto.EventRequestDTO;
import com.slotwise.sw.entity.ConflictLog;
import com.slotwise.sw.repository.ConflictLogRepository;
import com.slotwise.sw.repository.UserRepository;
import com.slotwise.sw.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * ConflictLogService — Persists conflict logs in a SEPARATE transaction so that
 * they survive even when the outer createEvent/updateEvent transaction rolls back
 * due to EventCollisionException.
 */
@Service
public class ConflictLogService {

    @Autowired
    private ConflictLogRepository conflictLogRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Save a conflict log in an independent transaction.
     * REQUIRES_NEW ensures this commit is independent of the caller's transaction.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logConflict(EventRequestDTO requestDTO, CollisionResponse collisionResponse) {
        try {
            ConflictLog log = new ConflictLog();
            log.setVenueId(requestDTO.getVenueId());
            log.setRequestedStartTime(requestDTO.getStartTime());
            log.setRequestedEndTime(requestDTO.getEndTime());
            log.setOrganizerId(requestDTO.getOrganizerId());
            log.setRequestedEventTitle(requestDTO.getTitle());
            log.setConflictType("VENUE_CLASH"); // Primary conflict type — venue + time overlap
            log.setStatus("PENDING");

            // Set venue name
            if (requestDTO.getVenueId() != null) {
                venueRepository.findById(requestDTO.getVenueId())
                    .ifPresent(v -> log.setVenueName(v.getName()));
            }

            // Set organizer name (requester)
            if (requestDTO.getOrganizerId() != null) {
                userRepository.findById(requestDTO.getOrganizerId())
                    .ifPresent(u -> log.setOrganizerName(u.getName()));
            }

            // Set conflicting event info
            if (collisionResponse.getConflictingEvent() != null) {
                ConflictingEventInfo info = collisionResponse.getConflictingEvent();
                log.setConflictingEventTitle(info.getEventName());
                log.setConflictingEventOrganizer(info.getOrganizerName());
                // Determine specific conflict type
                if (info.getVenueId() != null && info.getVenueId().equals(requestDTO.getVenueId())) {
                    log.setConflictType("VENUE_CLASH");
                }
            }

            conflictLogRepository.save(log);
        } catch (Exception e) {
            // Log the error — don't let conflict logging failures crash the main flow
            System.err.println("[ConflictLogService] Failed to save conflict log: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Update conflict status (PENDING → RESOLVED or IGNORED)
     */
    @Transactional
    public ConflictLog updateStatus(Long conflictId, String status, String resolutionType) {
        ConflictLog log = conflictLogRepository.findById(conflictId)
                .orElseThrow(() -> new RuntimeException("Conflict log not found: " + conflictId));
        log.setStatus(status);
        if ("RESOLVED".equals(status)) {
            log.setResolved(true);
            log.setResolvedAt(LocalDateTime.now());
            log.setResolutionType(resolutionType);
        }
        return conflictLogRepository.save(log);
    }
}
