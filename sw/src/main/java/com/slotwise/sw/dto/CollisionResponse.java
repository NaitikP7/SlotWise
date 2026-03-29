package com.slotwise.sw.dto;

import java.util.List;

/**
 * CollisionResponse DTO returned when an event collision is detected
 * Contains error message and alternative recommendations
 */
public class CollisionResponse {
    private boolean collision;
    private String message;
    private List<VenueResponseDTO> sameTimeAlternativeVenues;
    private List<TimeSlot> availableTimeSlots;
    private TimeSlot closestAvailableSlot;

    // Constructors
    public CollisionResponse() {
    }

    public CollisionResponse(boolean collision, String message) {
        this.collision = collision;
        this.message = message;
    }

    public CollisionResponse(boolean collision, String message, 
                            List<VenueResponseDTO> sameTimeAlternativeVenues,
                            List<TimeSlot> availableTimeSlots,
                            TimeSlot closestAvailableSlot) {
        this.collision = collision;
        this.message = message;
        this.sameTimeAlternativeVenues = sameTimeAlternativeVenues;
        this.availableTimeSlots = availableTimeSlots;
        this.closestAvailableSlot = closestAvailableSlot;
    }

    // Getters and Setters
    public boolean isCollision() {
        return collision;
    }

    public void setCollision(boolean collision) {
        this.collision = collision;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<VenueResponseDTO> getSameTimeAlternativeVenues() {
        return sameTimeAlternativeVenues;
    }

    public void setSameTimeAlternativeVenues(List<VenueResponseDTO> sameTimeAlternativeVenues) {
        this.sameTimeAlternativeVenues = sameTimeAlternativeVenues;
    }

    public List<TimeSlot> getAvailableTimeSlots() {
        return availableTimeSlots;
    }

    public void setAvailableTimeSlots(List<TimeSlot> availableTimeSlots) {
        this.availableTimeSlots = availableTimeSlots;
    }

    public TimeSlot getClosestAvailableSlot() {
        return closestAvailableSlot;
    }

    public void setClosestAvailableSlot(TimeSlot closestAvailableSlot) {
        this.closestAvailableSlot = closestAvailableSlot;
    }

    @Override
    public String toString() {
        return "CollisionResponse{" +
                "collision=" + collision +
                ", message='" + message + '\'' +
                ", sameTimeAlternativeVenues=" + sameTimeAlternativeVenues +
                ", availableTimeSlots=" + availableTimeSlots +
                ", closestAvailableSlot=" + closestAvailableSlot +
                '}';
    }
}

