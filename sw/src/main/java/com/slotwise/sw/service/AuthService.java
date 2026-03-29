package com.slotwise.sw.service;

import com.slotwise.sw.dto.LoginRequest;
import com.slotwise.sw.dto.LoginResponse;
import com.slotwise.sw.entity.User;
import com.slotwise.sw.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.Optional;

/**
 * AuthService handles authentication logic
 * Implements simple login without Spring Security or JWT
 */
@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Authenticates user using email and password
     * 
     * @param loginRequest containing email and password
     * @return LoginResponse with user details (without password)
     * @throws IllegalArgumentException if credentials are invalid or user is inactive
     */
    public LoginResponse login(LoginRequest loginRequest) {
        // Validate input
        if (loginRequest == null || loginRequest.getEmail() == null || loginRequest.getPassword() == null) {
            throw new IllegalArgumentException("Email and password are required");
        }

        String email = loginRequest.getEmail().trim();
        String password = loginRequest.getPassword();

        // Fetch user from database by email
        Optional<User> userOptional = userRepository.findByEmail(email);

        // If user does not exist
        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        User user = userOptional.get();

        // If password does not match
        if (!user.getPassword().equals(password)) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        // If user is not active
        if (!user.getActive()) {
            throw new IllegalArgumentException("User account is deactivated");
        }

        // Return login response without password
        return new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getDepartment(), // Department name from user entity
                user.getRole(),
                user.getActive(),
                user.getCreatedAt()
        );
    }
}

