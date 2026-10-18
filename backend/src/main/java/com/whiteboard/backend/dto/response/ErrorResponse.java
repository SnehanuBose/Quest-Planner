package com.whiteboard.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Standardized error response payload for consistent API error reporting.
 *
 * <p>Every error returned by the API follows this structure, providing clients
 * with a predictable format for error handling. Includes a timestamp for
 * debugging, HTTP status code, human-readable message, and the request path
 * that triggered the error.</p>
 *
 * @author Whiteboard Team
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    private int status;
    private String message;
    private String path;
}
