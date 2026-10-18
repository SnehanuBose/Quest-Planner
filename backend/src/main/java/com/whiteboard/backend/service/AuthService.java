package com.whiteboard.backend.service;

import com.whiteboard.backend.dto.request.LoginRequest;
import com.whiteboard.backend.dto.request.RegisterRequest;
import com.whiteboard.backend.dto.response.AuthResponse;

/**
 * Service defining authentication operations (registration and login).
 */
public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
