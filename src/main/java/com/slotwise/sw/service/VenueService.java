package com.slotwise.sw.service;

import com.slotwise.sw.dto.VenueRequestDTO;
import com.slotwise.sw.dto.VenueResponseDTO;
import com.slotwise.sw.entity.Venue;
import com.slotwise.sw.entity.Institute;
import com.slotwise.sw.repository.VenueRepository;
import com.slotwise.sw.repository.InstituteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class VenueService {

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private InstituteRepository instituteRepository;

    // ========== DTO Conversion Methods ==========

    /**
     * Convert Venue entity to VenueResponseDTO
     */
    private VenueResponseDTO convertToResponseDTO(Venue venue) {
        if (venue == null) {
            return null;
        }

        String instituteName = venue.getInstitute() != null ? venue.getInstitute().getName() : null;
        Long instituteId = venue.getInstitute() != null ? venue.getInstitute().getId() : null;

        return new VenueResponseDTO(
                venue.getId(),
                venue.getName(),
                venue.getCapacity(),
                venue.getLocation(),
                instituteId,
                instituteName,
                venue.getCreatedAt(),
                venue.getUpdatedAt()
        );
    }

    /**
     * Convert VenueRequestDTO to Venue entity
     */
    private Venue convertToEntity(VenueRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        // Fetch institute by ID
        Institute institute = null;
        if (dto.getInstituteId() != null) {
            institute = instituteRepository.findById(dto.getInstituteId())
                    .orElseThrow(() -> new RuntimeException("Institute not found with ID: " + dto.getInstituteId()));
        } else {
            throw new IllegalArgumentException("Institute ID is required for venue creation");
        }

        Venue venue = new Venue();
        venue.setName(dto.getName());
        venue.setCapacity(dto.getCapacity());
        venue.setLocation(dto.getLocation());
        venue.setInstitute(institute);
        return venue;
    }

    // ========== Service Methods (now using DTOs) ==========

    /**
     * Get all venues with response DTOs
     */
    public List<VenueResponseDTO> getAllVenues() {
        return venueRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get venue by ID with response DTO
     */
    public Optional<VenueResponseDTO> getVenueById(Long id) {
        return venueRepository.findById(id)
                .map(this::convertToResponseDTO);
    }

    /**
     * Get venue by name with response DTO
     */
    public Optional<VenueResponseDTO> getVenueByName(String name) {
        return venueRepository.findByName(name)
                .map(this::convertToResponseDTO);
    }

    /**
     * Get all venues by institute with response DTOs
     */
    public List<VenueResponseDTO> getVenuesByInstitute(Long instituteId) {
        return venueRepository.findByInstituteId(instituteId)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create new venue from request DTO
     */
    public VenueResponseDTO createVenue(VenueRequestDTO requestDTO) {
        // Validate input
        if (requestDTO.getName() == null || requestDTO.getName().isBlank()) {
            throw new IllegalArgumentException("Venue name is required");
        }

        if (requestDTO.getCapacity() == null || requestDTO.getCapacity() <= 0) {
            throw new IllegalArgumentException("Venue capacity must be greater than 0");
        }

        if (requestDTO.getLocation() == null || requestDTO.getLocation().isBlank()) {
            throw new IllegalArgumentException("Venue location is required");
        }

        if (venueRepository.existsByName(requestDTO.getName())) {
            throw new IllegalArgumentException("Venue with name '" + requestDTO.getName() + "' already exists");
        }

        // Convert DTO to entity and save
        Venue venue = convertToEntity(requestDTO);
        Venue savedVenue = venueRepository.save(venue);
        
        return convertToResponseDTO(savedVenue);
    }

    /**
     * Update venue from request DTO
     */
    public VenueResponseDTO updateVenue(Long id, VenueRequestDTO requestDTO) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found with ID: " + id));

        // Validate name change doesn't duplicate existing names
        if (!venue.getName().equals(requestDTO.getName()) &&
                venueRepository.existsByName(requestDTO.getName())) {
            throw new IllegalArgumentException("Venue with name '" + requestDTO.getName() + "' already exists");
        }

        venue.setName(requestDTO.getName());
        venue.setCapacity(requestDTO.getCapacity());
        venue.setLocation(requestDTO.getLocation());

        // Update institute if provided
        if (requestDTO.getInstituteId() != null) {
            Institute institute = instituteRepository.findById(requestDTO.getInstituteId())
                    .orElseThrow(() -> new RuntimeException("Institute not found with ID: " + requestDTO.getInstituteId()));
            venue.setInstitute(institute);
        }

        Venue updatedVenue = venueRepository.save(venue);
        return convertToResponseDTO(updatedVenue);
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

