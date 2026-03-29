package com.slotwise.sw.exception;

import com.slotwise.sw.dto.CollisionResponse;

/**
 * Custom exception for event collision detection
 * Encapsulates collision information and recommendations
 */
public class EventCollisionException extends RuntimeException {
    private CollisionResponse collisionResponse;

    public EventCollisionException(String message) {
        super(message);
    }

    public EventCollisionException(String message, CollisionResponse collisionResponse) {
        super(message);
        this.collisionResponse = collisionResponse;
    }

    public EventCollisionException(String message, Throwable cause) {
        super(message, cause);
    }

    public EventCollisionException(String message, Throwable cause, CollisionResponse collisionResponse) {
        super(message, cause);
        this.collisionResponse = collisionResponse;
    }

    public CollisionResponse getCollisionResponse() {
        return collisionResponse;
    }

    public void setCollisionResponse(CollisionResponse collisionResponse) {
        this.collisionResponse = collisionResponse;
    }
}

