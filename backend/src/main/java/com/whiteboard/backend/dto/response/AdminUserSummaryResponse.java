package com.whiteboard.backend.dto.response;

import com.whiteboard.backend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Lightweight privacy-compliant user summary response for the Admin dashboard.
 *
 * <p>STRICT PRIVACY GUARD: Exposes ONLY the user identifier, username, email,
 * role, registration date, and the total plan count. Strictly omits all board
 * contents, titles, canvasData, and notes.</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserSummaryResponse {

    private Long id;
    private String username;
    private String email;
    private Role role;
    private LocalDateTime createdAt;
    private long planCount;
}
