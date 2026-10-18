package com.whiteboard.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Lightweight board summary DTO for dashboard listing endpoints.
 *
 * <p>Deliberately omits the heavy {@code canvasData} JSON to minimize payload
 * size and improve dashboard load performance. The frontend only needs metadata
 * to render board cards and can fetch full details on demand.</p>
 *
 * @author Whiteboard Team
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardSummaryResponse {

    private Long id;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
