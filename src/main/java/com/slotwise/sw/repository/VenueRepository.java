package com.slotwise.sw.repository;

import com.slotwise.sw.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {
    Optional<Venue> findByName(String name);
    List<Venue> findByInstituteId(Long instituteId);
    boolean existsByName(String name);
}
