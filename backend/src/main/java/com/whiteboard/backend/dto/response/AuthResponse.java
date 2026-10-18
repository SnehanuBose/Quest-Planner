package com.whiteboard.backend.dto.response;

import com.whiteboard.backend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Authentication response returned upon successful registration, login,
 * or access token renewal.
 *
 * <p>Contains both a short-lived access token for stateless API requests
 * and a long-lived refresh token for background renewal.</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    private String refreshToken;

    @Builder.Default
    private String tokenType = "Bearer";

    private Long expiresIn;

    /**
     * Backward-compatibility alias returning the active access token.
     */
    public String getToken() {
        return accessToken != null ? accessToken : token;
    }

    private String token;

    private Long id;
    private String username;
    private String email;
    private Role role;
}
