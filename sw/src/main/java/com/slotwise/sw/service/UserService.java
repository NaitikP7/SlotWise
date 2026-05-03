package com.slotwise.sw.service;

import com.slotwise.sw.dto.UserRequestDTO;
import com.slotwise.sw.dto.UserResponseDTO;
import com.slotwise.sw.entity.User;
import com.slotwise.sw.entity.UserRole;
import com.slotwise.sw.entity.Department;
import com.slotwise.sw.repository.UserRepository;
import com.slotwise.sw.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    // ========== DTO Conversion Methods ==========

    /**
     * Convert User entity to UserResponseDTO
     */
    private UserResponseDTO convertToResponseDTO(User user) {
        if (user == null) {
            return null;
        }
        String departmentName = user.getDepartmentEntity() != null ? user.getDepartmentEntity().getName() : null;
        Long departmentId = user.getDepartmentEntity() != null ? user.getDepartmentEntity().getId() : null;
        
        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                departmentId,
                departmentName,
                user.getRole(),
                user.getActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    /**
     * Convert UserRequestDTO to User entity
     */
    private User convertToEntity(UserRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        // Fetch department by ID
        Department department = null;
        if (dto.getDepartmentId() != null) {
            department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found with ID: " + dto.getDepartmentId()));
        } else {
            throw new IllegalArgumentException("Department ID is required for user creation");
        }

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setDepartment(department);
        
        // Set role (default to USER if not provided)
        user.setRole(dto.getRole() != null ? dto.getRole() : UserRole.USER);
        
        // Set active (default to true if not provided)
        user.setActive(dto.getActive() != null ? dto.getActive() : true);
        
        return user;
    }

    // ========== Service Methods (now using DTOs) ==========

    /**
     * Get all users with response DTOs
     */
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get user by ID with response DTO
     */
    public Optional<UserResponseDTO> getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::convertToResponseDTO);
    }

    /**
     * Get user by email with response DTO
     */
    public Optional<UserResponseDTO> getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(this::convertToResponseDTO);
    }

    /**
     * Get all users by department with response DTOs
     */
    public List<UserResponseDTO> getUsersByDepartment(Long departmentId) {
        return userRepository.findByDepartmentId(departmentId)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all users by role with response DTOs
     */
    public List<UserResponseDTO> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all active users with response DTOs
     */
    public List<UserResponseDTO> getActiveUsers() {
        return userRepository.findByActive(true)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all inactive users with response DTOs
     */
    public List<UserResponseDTO> getInactiveUsers() {
        return userRepository.findByActive(false)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create new user from request DTO (default role is USER)
     */
    public UserResponseDTO createUser(UserRequestDTO requestDTO) {
        // Validate input
        if (requestDTO.getName() == null || requestDTO.getName().isBlank()) {
            throw new IllegalArgumentException("User name is required");
        }

        if (requestDTO.getEmail() == null || requestDTO.getEmail().isBlank()) {
            throw new IllegalArgumentException("User email is required");
        }

        if (requestDTO.getPassword() == null || requestDTO.getPassword().isBlank()) {
            throw new IllegalArgumentException("User password is required");
        }

        if (userRepository.existsByEmail(requestDTO.getEmail())) {
            throw new IllegalArgumentException("User with email '" + requestDTO.getEmail() + "' already exists");
        }

        // Convert DTO to entity and save
        User user = convertToEntity(requestDTO);
        User savedUser = userRepository.save(user);
        
        return convertToResponseDTO(savedUser);
    }

    /**
     * Update user from request DTO
     */
    public UserResponseDTO updateUser(Long id, UserRequestDTO requestDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        // Validate email change doesn't duplicate existing emails
        if (!user.getEmail().equals(requestDTO.getEmail()) &&
                userRepository.existsByEmail(requestDTO.getEmail())) {
            throw new IllegalArgumentException("User with email '" + requestDTO.getEmail() + "' already exists");
        }

        user.setName(requestDTO.getName());
        user.setEmail(requestDTO.getEmail());
        
        // Only update password if a new one is provided (non-null and non-blank)
        if (requestDTO.getPassword() != null && !requestDTO.getPassword().isBlank()) {
            user.setPassword(requestDTO.getPassword());
        }

        // Update department if provided
        if (requestDTO.getDepartmentId() != null) {
            Department department = departmentRepository.findById(requestDTO.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found with ID: " + requestDTO.getDepartmentId()));
            user.setDepartment(department);
        }

        // Update role if provided
        if (requestDTO.getRole() != null) {
            user.setRole(requestDTO.getRole());
        }

        // Update active status if provided
        if (requestDTO.getActive() != null) {
            user.setActive(requestDTO.getActive());
        }

        User updatedUser = userRepository.save(user);
        return convertToResponseDTO(updatedUser);
    }

    /**
     * Delete user
     */
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with ID: " + id);
        }
        userRepository.deleteById(id);
    }

    /**
     * Activate user
     */
    public UserResponseDTO activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        user.setActive(true);
        User updatedUser = userRepository.save(user);
        return convertToResponseDTO(updatedUser);
    }

    /**
     * Deactivate user
     */
    public UserResponseDTO deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        user.setActive(false);
        User updatedUser = userRepository.save(user);
        return convertToResponseDTO(updatedUser);
    }

    /**
     * Check if user exists by email
     */
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}



