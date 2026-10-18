package com.whiteboard.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating a new board.
 *
 * <p>Enforces that every board must have a non-blank title. The description is
 * optional and can be provided during creation or added later via update.</p>
 *
 * @author Whiteboard Team
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBoardRequest {

    /**
     * Title for the new board. Must not be blank and cannot exceed 255 characters.
     */
    @NotBlank(message = "Board title is required and cannot be blank")
    @Size(max = 255, message = "Board title must not exceed 255 characters")
    private String title;

    /**
     * Optional description providing additional context about the board.
     */
    private String description;
}
