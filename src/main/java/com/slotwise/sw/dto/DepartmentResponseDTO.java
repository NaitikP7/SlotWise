package com.slotwise.sw.dto;

import java.time.LocalDateTime;

/**
 * Response DTO for Department
 * Includes institute name to avoid exposing full entity relationships
 */
public class DepartmentResponseDTO {
    private Long id;
    private String name;
    private Long instituteId;
    private String instituteName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public DepartmentResponseDTO() {
    }

    public DepartmentResponseDTO(Long id, String name, Long instituteId, String instituteName, 
                                LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.instituteId = instituteId;
        this.instituteName = instituteName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public Long getInstituteId() {
        return instituteId;
    }

    public void setInstituteId(Long instituteId) {
        this.instituteId = instituteId;
    }

    public String getInstituteName() {
        return instituteName;
    }

    public void setInstituteName(String instituteName) {
        this.instituteName = instituteName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "DepartmentResponseDTO{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", instituteId=" + instituteId +
                ", instituteName='" + instituteName + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}

