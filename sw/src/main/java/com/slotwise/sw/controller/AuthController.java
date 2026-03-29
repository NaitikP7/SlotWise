package com.slotwise.sw.controller;

import com.slotwise.sw.dto.LoginRequest;
import com.slotwise.sw.dto.LoginResponse;
import com.slotwise.sw.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController handles authentication endpoints
 * Provides login API without Spring Security or JWT
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Login endpoint
     * 
     * POST /api/auth/login
     * 
     * Request Body:
     * {
     *   "email": "user@example.com",
     *   "password": "password123"
     * }
     * 
     * Response (200 OK):
     * {
     *   "id": 1,
     *   "name": "John Doe",
     *   "email": "user@example.com",
     *   "departmentName": "Engineering",
     *   "role": "ADMIN",
     *   "active": true,
     *   "createdAt": "2026-03-27T10:30:00"
     * }
     * 
     * Response (401 Unauthorized): Invalid email or password
     * Response (403 Forbidden): User account is deactivated
     * 
     * @param loginRequest containing email and password
     * @return ResponseEntity with LoginResponse or error message
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Validate request body
            if (loginRequest == null || loginRequest.getEmail() == null || loginRequest.getPassword() == null) {
                return ResponseEntity.badRequest().body("Email and password are required");
            }

            // Authenticate user
            LoginResponse loginResponse = authService.login(loginRequest);
            return ResponseEntity.ok(loginResponse);

        } catch (IllegalArgumentException e) {
            String message = e.getMessage();

            // Check if user is inactive (403) or invalid credentials (401)
            if (message.contains("deactivated")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("User account is deactivated");
            }

            // Invalid credentials
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");

        } catch (Exception e) {
            // Unexpected error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred during login");
        }
    }

    /**
     * Health check endpoint to verify API is running
     * 
     * @return OK status
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Authentication service is running");
    }
}

