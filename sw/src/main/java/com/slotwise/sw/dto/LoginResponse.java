package com.slotwise.sw.dto;

import com.slotwise.sw.entity.UserRole;
import java.time.LocalDateTime;

/**
 * DTO for login response
 * Returns user details WITHOUT password for security
 */
public class LoginResponse {
    private Long id;
    private String name;
    private String email;
    private String departmentName;
    private UserRole role;
    private Boolean active;
    private LocalDateTime createdAt;

    // Constructors
    public LoginResponse() {
    }

    public LoginResponse(Long id, String name, String email, String departmentName, 
                        UserRole role, Boolean active, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.departmentName = departmentName;
        this.role = role;
        this.active = active;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "LoginResponse{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", departmentName='" + departmentName + '\'' +
                ", role=" + role +
                ", active=" + active +
                '}';
    }
}

