package com.whiteboard.backend.service.impl;

import com.whiteboard.backend.dto.request.LoginRequest;
import com.whiteboard.backend.dto.request.RegisterRequest;
import com.whiteboard.backend.dto.response.AuthResponse;
import com.whiteboard.backend.entity.Role;
import com.whiteboard.backend.entity.User;
import com.whiteboard.backend.repository.UserRepository;
import com.whiteboard.backend.security.JwtTokenProvider;
import com.whiteboard.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of {@link AuthService} handling registration, credential verification, and JWT generation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Override
    public AuthResponse register(RegisterRequest request) {
        log.info("Attempting to register user with username: '{}'", request.getUsername());

        if (userRepository.existsByUsername(request.getUsername().trim())) {
            throw new IllegalArgumentException("Username '" + request.getUsername().trim() + "' is already taken.");
        }

        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new IllegalArgumentException("Email '" + request.getEmail().trim().toLowerCase() + "' is already in use.");
        }

        // New account registrations are strictly assigned standard ROLE_USER.
        // Admin access is granted exclusively via direct database update.
        Role assignedRole = Role.ROLE_USER;

        User user = User.builder()
                .username(request.getUsername().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(assignedRole)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with id: {} and role: {}", savedUser.getId(), savedUser.getRole());

        String token = tokenProvider.generateToken(savedUser.getId(), savedUser.getUsername(), savedUser.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsername().trim();
        log.debug("Authenticating login request for identifier: '{}'", identifier);

        User user = userRepository.findByUsernameOrEmail(identifier, identifier.toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password.");
        }

        String token = tokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
