package com.whiteboard.backend.exception;

/**
 * Custom runtime exception thrown when a requested resource cannot be found.
 *
 * <p>This exception is caught by the {@link GlobalExceptionHandler} and
 * translated into an HTTP 404 response with a structured error body.
 * Using a dedicated exception class rather than generic exceptions enables
 * precise error differentiation in the global handler.</p>
 *
 * @author Whiteboard Team
 * @version 1.0.0
 */
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Constructs a new {@code ResourceNotFoundException} with a descriptive message.
     *
     * @param message a human-readable explanation of which resource was not found
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }

    /**
     * Constructs a new {@code ResourceNotFoundException} with a formatted message
     * identifying the resource type and lookup key.
     *
     * @param resourceName the type of resource (e.g., "Board")
     * @param fieldName    the field used for lookup (e.g., "id")
     * @param fieldValue   the value that was not found
     */
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue));
    }
}
