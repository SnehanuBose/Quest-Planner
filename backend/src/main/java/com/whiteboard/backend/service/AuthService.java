package com.whiteboard.backend.service;

import com.whiteboard.backend.dto.request.LoginRequest;
import com.whiteboard.backend.dto.request.RefreshTokenRequest;
import com.whiteboard.backend.dto.request.RegisterRequest;
import com.whiteboard.backend.dto.response.AuthResponse;

/**
 * Service interface for user registration, authentication, token renewal, and session termination.
 */
public interface AuthService {

    /**
     * Registers a new standard user account and issues initial access + refresh tokens.
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Authenticates user credentials and issues short-lived access + long-lived refresh tokens.
     */
    AuthResponse login(LoginRequest request);

    /**
     * Renews an expired short-lived access token using a valid, unrevoked refresh token.
     */
    AuthResponse refreshToken(RefreshTokenRequest request);

    /**
     * Revokes a refresh token, terminating the active session.
     */
    void logout(String refreshToken);
}
