package com.whiteboard.backend.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Request DTO for updating an existing board.
 *
 * <p>Supports partial updates — any field left {@code null} will not overwrite
 * the existing value. This design enables efficient autosave from the frontend,
 * where only changed fields need to be transmitted.</p>
 *
 * @author Whiteboard Team
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBoardRequest {

    /**
     * Updated board title. If provided, must not exceed 255 characters.
     */
    @Size(max = 255, message = "Board title must not exceed 255 characters")
    private String title;

    /**
     * Updated board description.
     */
    private String description;

    /**
     * Updated canvas data containing the full node/edge tree.
     * This is the primary payload for autosave operations.
     */
    private Map<String, Object> canvasData;
}
