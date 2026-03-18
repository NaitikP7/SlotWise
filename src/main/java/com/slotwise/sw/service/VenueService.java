package com.slotwise.sw.service;

import com.slotwise.sw.entity.Venue;
import com.slotwise.sw.entity.Department;
import com.slotwise.sw.repository.VenueRepository;
import com.slotwise.sw.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class VenueService {

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    /**
     * Get all venues
     */
    public List<Venue> getAllVenues() {
        return venueRepository.findAll();
    }

    /**
     * Get venue by ID
     */
    public Optional<Venue> getVenueById(Long id) {
        return venueRepository.findById(id);
    }

    /**
     * Get venue by name
     */
    public Optional<Venue> getVenueByName(String name) {
        return venueRepository.findByName(name);
    }

    /**
     * Get all venues by department
     */
    public List<Venue> getVenuesByDepartment(Long departmentId) {
        return venueRepository.findByDepartmentId(departmentId);
    }

    /**
     * Create new venue
     */
    public Venue createVenue(Venue venue) {
        if (venueRepository.existsByName(venue.getName())) {
            throw new IllegalArgumentException("Venue with name '" + venue.getName() + "' already exists");
        }

        if (venue.getDepartment() != null && venue.getDepartment().getId() != null) {
            Department department = departmentRepository.findById(venue.getDepartment().getId())
                    .orElseThrow(() -> new RuntimeException("Department not found with ID: " + venue.getDepartment().getId()));
            venue.setDepartment(department);
        } else {
            throw new IllegalArgumentException("Department is required for venue creation");
        }

        return venueRepository.save(venue);
    }

    /**
     * Update venue
     */
    public Venue updateVenue(Long id, Venue venueDetails) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found with ID: " + id));

        if (!venue.getName().equals(venueDetails.getName()) &&
                venueRepository.existsByName(venueDetails.getName())) {
            throw new IllegalArgumentException("Venue with name '" + venueDetails.getName() + "' already exists");
        }

        venue.setName(venueDetails.getName());
        venue.setCapacity(venueDetails.getCapacity());
        venue.setLocation(venueDetails.getLocation());

        if (venueDetails.getDepartment() != null && venueDetails.getDepartment().getId() != null) {
            Department department = departmentRepository.findById(venueDetails.getDepartment().getId())
                    .orElseThrow(() -> new RuntimeException("Department not found with ID: " + venueDetails.getDepartment().getId()));
            venue.setDepartment(department);
        }

        return venueRepository.save(venue);
    }

    /**
     * Delete venue
     */
    public void deleteVenue(Long id) {
        if (!venueRepository.existsById(id)) {
            throw new RuntimeException("Venue not found with ID: " + id);
        }
        venueRepository.deleteById(id);
    }

    /**
     * Check if venue exists by name
     */
    public boolean existsByName(String name) {
        return venueRepository.existsByName(name);
    }
}

