package com.whiteboard.backend.service.impl;

import com.whiteboard.backend.dto.request.LoginRequest;
import com.whiteboard.backend.dto.request.RefreshTokenRequest;
import com.whiteboard.backend.dto.request.RegisterRequest;
import com.whiteboard.backend.dto.response.AuthResponse;
import com.whiteboard.backend.entity.RefreshToken;
import com.whiteboard.backend.entity.Role;
import com.whiteboard.backend.entity.User;
import com.whiteboard.backend.repository.RefreshTokenRepository;
import com.whiteboard.backend.repository.UserRepository;
import com.whiteboard.backend.security.JwtTokenProvider;
import com.whiteboard.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Implementation of {@link AuthService} handling registration, credential verification,
 * short-lived JWT access token issuance, and long-lived refresh token rotation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
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

        // Generate short-lived access token & long-lived refresh token
        String accessToken = tokenProvider.generateAccessToken(savedUser.getId(), savedUser.getUsername(), savedUser.getRole().name());
        RefreshToken refreshToken = createAndPersistRefreshToken(savedUser);

        return buildAuthResponse(savedUser, accessToken, refreshToken.getToken());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsername().trim();
        log.debug("Authenticating login request for identifier: '{}'", identifier);

        User user = userRepository.findByUsernameOrEmail(identifier, identifier.toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password.");
        }

        // Clean up previous refresh tokens for this user and issue a fresh pair
        refreshTokenRepository.deleteByUser(user);

        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getUsername(), user.getRole().name());
        RefreshToken refreshToken = createAndPersistRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshToken.getToken());
    }

    @Override
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String requestRefreshToken = request.getRefreshToken();
        log.debug("Processing token refresh request");

        if (requestRefreshToken == null || requestRefreshToken.isBlank()) {
            throw new BadCredentialsException("Refresh token cannot be blank.");
        }

        RefreshToken storedToken = refreshTokenRepository.findByToken(requestRefreshToken)
                .orElseThrow(() -> new BadCredentialsException("Invalid or unrecognized refresh token."));

        if (storedToken.isRevoked() || storedToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(storedToken);
            log.warn("Attempted to use expired or revoked refresh token for user ID: {}", storedToken.getUser().getId());
            throw new BadCredentialsException("Refresh token is expired or revoked. Please log in again.");
        }

        User user = storedToken.getUser();

        // Generate a new short-lived access token
        String newAccessToken = tokenProvider.generateAccessToken(user.getId(), user.getUsername(), user.getRole().name());

        // Refresh Token Rotation: Rotate the refresh token to prevent replay attacks
        storedToken.setToken(tokenProvider.generateRefreshTokenString());
        storedToken.setExpiryDate(Instant.now().plusMillis(tokenProvider.getRefreshExpirationMs()));
        RefreshToken rotatedToken = refreshTokenRepository.save(storedToken);

        log.debug("Successfully refreshed access token and rotated refresh token for user '{}'", user.getUsername());

        return buildAuthResponse(user, newAccessToken, rotatedToken.getToken());
    }

    @Override
    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            log.info("Revoking refresh token on logout");
            refreshTokenRepository.deleteByToken(refreshToken);
        }
    }

    // -------------------------------------------------------------------------
    // Private Helpers
    // -------------------------------------------------------------------------

    private RefreshToken createAndPersistRefreshToken(User user) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(tokenProvider.generateRefreshTokenString())
                .expiryDate(Instant.now().plusMillis(tokenProvider.getRefreshExpirationMs()))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .token(accessToken) // backward-compatibility alias
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessExpirationSeconds())
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
