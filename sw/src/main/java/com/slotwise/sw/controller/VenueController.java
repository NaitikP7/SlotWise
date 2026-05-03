package com.slotwise.sw.controller;

import com.slotwise.sw.dto.VenueRequestDTO;
import com.slotwise.sw.dto.VenueResponseDTO;
import com.slotwise.sw.service.VenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/venues")
@CrossOrigin(origins = "*", maxAge = 3600)
public class VenueController {

    @Autowired
    private VenueService venueService;

    /**
     * Get all venues
     */
    @GetMapping
    public ResponseEntity<List<VenueResponseDTO>> getAllVenues() {
        List<VenueResponseDTO> venues = venueService.getAllVenues();
        return new ResponseEntity<>(venues, HttpStatus.OK);
    }

    /**
     * Get venue by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<VenueResponseDTO> getVenueById(@PathVariable Long id) {
        Optional<VenueResponseDTO> venue = venueService.getVenueById(id);
        return venue.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Get venue by name
     */
    @GetMapping("/name/{name}")
    public ResponseEntity<VenueResponseDTO> getVenueByName(@PathVariable String name) {
        Optional<VenueResponseDTO> venue = venueService.getVenueByName(name);
        return venue.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Get all venues by institute
     */
    @GetMapping("/institute/{instituteId}")
    public ResponseEntity<List<VenueResponseDTO>> getVenuesByInstitute(@PathVariable Long instituteId) {
        List<VenueResponseDTO> venues = venueService.getVenuesByInstitute(instituteId);
        return new ResponseEntity<>(venues, HttpStatus.OK);
    }

    /**
     * Get venues by minimum capacity — for capacity-based filtering
     */
    @GetMapping("/capacity/{minCapacity}")
    public ResponseEntity<List<VenueResponseDTO>> getVenuesByCapacity(@PathVariable Integer minCapacity) {
        List<VenueResponseDTO> venues = venueService.getVenuesByMinCapacity(minCapacity);
        return new ResponseEntity<>(venues, HttpStatus.OK);
    }

    /**
     * Create new venue
     */
    @PostMapping
    public ResponseEntity<VenueResponseDTO> createVenue(@RequestBody VenueRequestDTO requestDTO) {
        try {
            VenueResponseDTO createdVenue = venueService.createVenue(requestDTO);
            return new ResponseEntity<>(createdVenue, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update venue
     */
    @PutMapping("/{id}")
    public ResponseEntity<VenueResponseDTO> updateVenue(@PathVariable Long id, @RequestBody VenueRequestDTO requestDTO) {
        try {
            VenueResponseDTO updatedVenue = venueService.updateVenue(id, requestDTO);
            return new ResponseEntity<>(updatedVenue, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Delete venue
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenue(@PathVariable Long id) {
        try {
            venueService.deleteVenue(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Check if venue exists by name
     */
    @GetMapping("/exists/{name}")
    public ResponseEntity<Boolean> existsByName(@PathVariable String name) {
        boolean exists = venueService.existsByName(name);
        return new ResponseEntity<>(exists, HttpStatus.OK);
    }
}


