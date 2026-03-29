package com.slotwise.sw.dto;

import com.slotwise.sw.entity.UserRole;

/**
 * Request DTO for creating/updating User
 */
public class UserRequestDTO {
    private String name;
    private String email;
    private String password;
    private Long departmentId;
    private UserRole role; // Optional, defaults to USER if not provided
    private Boolean active; // Optional, defaults to true if not provided

    // Constructors
    public UserRequestDTO() {
    }

    public UserRequestDTO(String name, String email, String password, Long departmentId) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.departmentId = departmentId;
    }

    public UserRequestDTO(String name, String email, String password, Long departmentId, UserRole role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.departmentId = departmentId;
        this.role = role;
    }

    // Getters and Setters
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
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

    @Override
    public String toString() {
        return "UserRequestDTO{" +
                "name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", departmentId=" + departmentId +
                ", role=" + role +
                ", active=" + active +
                '}';
    }
}

