package com.slotwise.sw.service;

import com.slotwise.sw.dto.InstituteRequestDTO;
import com.slotwise.sw.dto.InstituteResponseDTO;
import com.slotwise.sw.entity.Institute;
import com.slotwise.sw.repository.InstituteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class InstituteService {

    @Autowired
    private InstituteRepository instituteRepository;

    // ========== DTO Conversion Methods ==========

    /**
     * Convert Institute entity to InstituteResponseDTO
     */
    private InstituteResponseDTO convertToResponseDTO(Institute institute) {
        if (institute == null) {
            return null;
        }
        return new InstituteResponseDTO(
                institute.getId(),
                institute.getName(),
                institute.getCreatedAt(),
                institute.getUpdatedAt()
        );
    }

    /**
     * Convert InstituteRequestDTO to Institute entity
     */
    private Institute convertToEntity(InstituteRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        Institute institute = new Institute();
        institute.setName(dto.getName());
        return institute;
    }

    // ========== Service Methods (now using DTOs) ==========

    /**
     * Get all institutes
     */
    public List<InstituteResponseDTO> getAllInstitutes() {
        return instituteRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get institute by ID
     */
    public Optional<InstituteResponseDTO> getInstituteById(Long id) {
        return instituteRepository.findById(id)
                .map(this::convertToResponseDTO);
    }

    /**
     * Get institute by name
     */
    public Optional<InstituteResponseDTO> getInstituteByName(String name) {
        return instituteRepository.findByName(name)
                .map(this::convertToResponseDTO);
    }

    /**
     * Create new institute from request DTO
     */
    public InstituteResponseDTO createInstitute(InstituteRequestDTO requestDTO) {
        if (requestDTO.getName() == null || requestDTO.getName().isBlank()) {
            throw new IllegalArgumentException("Institute name is required");
        }

        if (instituteRepository.existsByName(requestDTO.getName())) {
            throw new IllegalArgumentException("Institute with name '" + requestDTO.getName() + "' already exists");
        }

        Institute institute = convertToEntity(requestDTO);
        Institute savedInstitute = instituteRepository.save(institute);
        return convertToResponseDTO(savedInstitute);
    }

    /**
     * Update institute from request DTO
     */
    public InstituteResponseDTO updateInstitute(Long id, InstituteRequestDTO requestDTO) {
        Institute institute = instituteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Institute not found with ID: " + id));

        if (!institute.getName().equals(requestDTO.getName()) &&
                instituteRepository.existsByName(requestDTO.getName())) {
            throw new IllegalArgumentException("Institute with name '" + requestDTO.getName() + "' already exists");
        }

        institute.setName(requestDTO.getName());
        Institute updatedInstitute = instituteRepository.save(institute);
        return convertToResponseDTO(updatedInstitute);
    }

    /**
     * Delete institute
     */
    public void deleteInstitute(Long id) {
        if (!instituteRepository.existsById(id)) {
            throw new RuntimeException("Institute not found with ID: " + id);
        }
        instituteRepository.deleteById(id);
    }

    /**
     * Check if institute exists by name
     */
    public boolean existsByName(String name) {
        return instituteRepository.existsByName(name);
    }
}

