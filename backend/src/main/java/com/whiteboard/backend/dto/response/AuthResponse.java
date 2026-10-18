package com.whiteboard.backend.dto.response;

import com.whiteboard.backend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Authentication response returned upon successful registration or login.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private Long id;
    private String username;
    private String email;
    private Role role;
}
