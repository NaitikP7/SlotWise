package com.slotwise.sw.dto;

/**
 * Request DTO for creating/updating Venue
 */
public class VenueRequestDTO {
    private String name;
    private Integer capacity;
    private String location;
    private Long instituteId;

    // Constructors
    public VenueRequestDTO() {
    }

    public VenueRequestDTO(String name, Integer capacity, String location, Long instituteId) {
        this.name = name;
        this.capacity = capacity;
        this.location = location;
        this.instituteId = instituteId;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Long getInstituteId() {
        return instituteId;
    }

    public void setInstituteId(Long instituteId) {
        this.instituteId = instituteId;
    }

    @Override
    public String toString() {
        return "VenueRequestDTO{" +
                "name='" + name + '\'' +
                ", capacity=" + capacity +
                ", location='" + location + '\'' +
                ", instituteId=" + instituteId +
                '}';
    }
}

