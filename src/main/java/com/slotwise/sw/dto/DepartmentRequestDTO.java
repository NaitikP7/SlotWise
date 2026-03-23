package com.slotwise.sw.dto;

/**
 * Request DTO for creating/updating Department
 */
public class DepartmentRequestDTO {
    private String name;
    private Long instituteId;

    // Constructors
    public DepartmentRequestDTO() {
    }

        public DepartmentRequestDTO(String name, Long instituteId) {
        this.name = name;
        this.instituteId = instituteId;
    }

    // Getters and Setters
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

    @Override
    public String toString() {
        return "DepartmentRequestDTO{" +
                "name='" + name + '\'' +
                ", instituteId=" + instituteId +
                '}';
    }
}

