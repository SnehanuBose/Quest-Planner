package com.whiteboard.backend.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * Helper utilities to retrieve authenticated user information from the security context.
 */
public final class SecurityUtils {

    private SecurityUtils() {}

    public static Optional<CustomUserDetails> getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            return Optional.of(userDetails);
        }
        return Optional.empty();
    }

    public static Long getCurrentUserId() {
        return getCurrentUserDetails()
                .map(CustomUserDetails::getId)
                .orElse(null);
    }

    public static String getCurrentUsername() {
        return getCurrentUserDetails()
                .map(CustomUserDetails::getUsername)
                .orElse(null);
    }
}
