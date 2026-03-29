package com.slotwise.sw.service;

import com.slotwise.sw.dto.DepartmentRequestDTO;
import com.slotwise.sw.dto.DepartmentResponseDTO;
import com.slotwise.sw.entity.Department;
import com.slotwise.sw.entity.Institute;
import com.slotwise.sw.repository.DepartmentRepository;
import com.slotwise.sw.repository.InstituteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private InstituteRepository instituteRepository;

    // ========== DTO Conversion Methods ==========

    /**
     * Convert Department entity to DepartmentResponseDTO
     */
    private DepartmentResponseDTO convertToResponseDTO(Department department) {
        if (department == null) {
            return null;
        }
        String instituteName = department.getInstitute() != null ? department.getInstitute().getName() : null;
        Long instituteId = department.getInstitute() != null ? department.getInstitute().getId() : null;
        
        return new DepartmentResponseDTO(
                department.getId(),
                department.getName(),
                instituteId,
                instituteName,
                department.getCreatedAt(),
                department.getUpdatedAt()
        );
    }

    /**
     * Convert DepartmentRequestDTO to Department entity
     */
    private Department convertToEntity(DepartmentRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        
        // Fetch institute by ID
        Institute institute = null;
        if (dto.getInstituteId() != null) {
            institute = instituteRepository.findById(dto.getInstituteId())
                    .orElseThrow(() -> new RuntimeException("Institute not found with ID: " + dto.getInstituteId()));
        } else {
            throw new IllegalArgumentException("Institute ID is required for department creation");
        }

        Department department = new Department();
        department.setName(dto.getName());
        department.setInstitute(institute);
        return department;
    }

    // ========== Service Methods (now using DTOs) ==========

    /**
     * Get all departments with response DTOs
     */
    public List<DepartmentResponseDTO> getAllDepartments() {
        return departmentRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get department by ID with response DTO
     */
    public Optional<DepartmentResponseDTO> getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .map(this::convertToResponseDTO);
    }

    /**
     * Get department by name with response DTO
     */
    public Optional<DepartmentResponseDTO> getDepartmentByName(String name) {
        return departmentRepository.findByName(name)
                .map(this::convertToResponseDTO);
    }

    /**
     * Get all departments by institute with response DTOs
     */
    public List<DepartmentResponseDTO> getDepartmentsByInstitute(Long instituteId) {
        return departmentRepository.findByInstituteId(instituteId)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create new department from request DTO
     */
    public DepartmentResponseDTO createDepartment(DepartmentRequestDTO requestDTO) {
        // Validate input
        if (requestDTO.getName() == null || requestDTO.getName().isBlank()) {
            throw new IllegalArgumentException("Department name is required");
        }

        if (requestDTO.getInstituteId() == null) {
            throw new IllegalArgumentException("Institute ID is required for department creation");
        }

        // Check if department with same name already exists in the same institute
        // Allows same department name in different institutes
        if (departmentRepository.existsByNameAndInstituteId(requestDTO.getName(), requestDTO.getInstituteId())) {
            throw new IllegalArgumentException("Department with name '" + requestDTO.getName() + 
                    "' already exists in this institute");
        }

        // Convert DTO to entity and save
        Department department = convertToEntity(requestDTO);
        Department savedDepartment = departmentRepository.save(department);
        
        return convertToResponseDTO(savedDepartment);
    }

    /**
     * Update department from request DTO
     */
    public DepartmentResponseDTO updateDepartment(Long id, DepartmentRequestDTO requestDTO) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with ID: " + id));

        // Validate name change doesn't duplicate existing names in the same institute
        // Only check if the name is actually being changed
        if (!department.getName().equals(requestDTO.getName())) {
            // Determine which institute to use for validation
            Long instituteIdToCheck = requestDTO.getInstituteId() != null ? 
                    requestDTO.getInstituteId() : department.getInstitute().getId();
            
            // Check if another department with the same name exists in this institute
            if (departmentRepository.existsByNameAndInstituteId(requestDTO.getName(), instituteIdToCheck)) {
                throw new IllegalArgumentException("Department with name '" + requestDTO.getName() + 
                        "' already exists in this institute");
            }
        }

        department.setName(requestDTO.getName());

        // Update institute if provided
        if (requestDTO.getInstituteId() != null) {
            Institute institute = instituteRepository.findById(requestDTO.getInstituteId())
                    .orElseThrow(() -> new RuntimeException("Institute not found with ID: " + requestDTO.getInstituteId()));
            department.setInstitute(institute);
        }

        Department updatedDepartment = departmentRepository.save(department);
        return convertToResponseDTO(updatedDepartment);
    }

    /**
     * Delete department
     */
    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new RuntimeException("Department not found with ID: " + id);
        }
        departmentRepository.deleteById(id);
    }

    /**
     * Check if department exists by name
     */
    public boolean existsByName(String name) {
        return departmentRepository.existsByName(name);
    }
}

