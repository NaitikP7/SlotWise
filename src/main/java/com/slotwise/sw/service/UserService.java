package com.slotwise.sw.service;

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

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    /**
     * Get all users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Get user by ID
     */
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Get user by email
     */
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Get all users by department
     */
    public List<User> getUsersByDepartment(Long departmentId) {
        return userRepository.findByDepartmentId(departmentId);
    }

    /**
     * Get all users by role
     */
    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    /**
     * Get all active users
     */
    public List<User> getActiveUsers() {
        return userRepository.findByActive(true);
    }

    /**
     * Get all inactive users
     */
    public List<User> getInactiveUsers() {
        return userRepository.findByActive(false);
    }

    /**
     * Create new user
     */
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("User with email '" + user.getEmail() + "' already exists");
        }

        if (user.getDepartmentEntity() != null && user.getDepartmentEntity().getId() != null) {
            Department department = departmentRepository.findById(user.getDepartmentEntity().getId())
                    .orElseThrow(() -> new RuntimeException("Department not found with ID: " + user.getDepartmentEntity().getId()));
            user.setDepartment(department);
        } else {
            throw new IllegalArgumentException("Department is required for user creation");
        }

        // Set default role to ADMIN if not specified
        if (user.getRole() == null) {
            user.setRole(UserRole.ADMIN);
        }

        // Set active status to true if not specified
        if (user.getActive() == null) {
            user.setActive(true);
        }

        return userRepository.save(user);
    }

    /**
     * Update user
     */
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        if (!user.getEmail().equals(userDetails.getEmail()) &&
                userRepository.existsByEmail(userDetails.getEmail())) {
            throw new IllegalArgumentException("User with email '" + userDetails.getEmail() + "' already exists");
        }

        user.setName(userDetails.getName());
        user.setEmail(userDetails.getEmail());
        user.setPassword(userDetails.getPassword());

        if (userDetails.getDepartmentEntity() != null && userDetails.getDepartmentEntity().getId() != null) {
            Department department = departmentRepository.findById(userDetails.getDepartmentEntity().getId())
                    .orElseThrow(() -> new RuntimeException("Department not found with ID: " + userDetails.getDepartmentEntity().getId()));
            user.setDepartment(department);
        }

        if (userDetails.getRole() != null) {
            user.setRole(userDetails.getRole());
        }

        if (userDetails.getActive() != null) {
            user.setActive(userDetails.getActive());
        }

        return userRepository.save(user);
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
    public User activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        user.setActive(true);
        return userRepository.save(user);
    }

    /**
     * Deactivate user
     */
    public User deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        user.setActive(false);
        return userRepository.save(user);
    }

    /**
     * Check if user exists by email
     */
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}



