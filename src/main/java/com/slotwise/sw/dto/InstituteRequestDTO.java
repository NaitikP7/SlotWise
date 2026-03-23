package com.slotwise.sw.dto;

/**
 * Request DTO for creating/updating Institute
 */
public class InstituteRequestDTO {
    private String name;

    // Constructors
    public InstituteRequestDTO() {
    }

    public InstituteRequestDTO(String name) {
        this.name = name;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "InstituteRequestDTO{" +
                "name='" + name + '\'' +
                '}';
    }
}

