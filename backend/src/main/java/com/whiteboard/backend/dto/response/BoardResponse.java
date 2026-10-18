package com.whiteboard.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Full board response DTO returned for single-board detail requests.
 *
 * <p>Includes the complete {@code canvasData} JSON tree alongside metadata.
 * This DTO is used when the frontend needs to render the full canvas and
 * requires all node and edge information.</p>
 *
 * @author Whiteboard Team
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardResponse {

    private Long id;
    private String title;
    private String description;
    private Map<String, Object> canvasData;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
