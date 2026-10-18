package com.whiteboard.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global CORS configuration for the Whiteboard API.
 *
 * <p>Allows cross-origin requests from configured frontend development servers.
 * Origins, methods, and headers are externalized to {@code application.yml} for
 * environment-specific flexibility without code changes.</p>
 *
 * <p>Default configuration permits the Vite dev server at {@code http://localhost:5173}
 * and a fallback origin at {@code http://localhost:3000}.</p>
 *
 * @author Whiteboard Team
 * @version 1.0.0
 */
@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
    private String[] allowedOrigins;

    @Value("${cors.allowed-origin-patterns:https://*.vercel.app}")
    private String[] allowedOriginPatterns;

    @Value("${cors.allowed-methods:GET,POST,PUT,DELETE,OPTIONS}")
    private String[] allowedMethods;

    @Value("${cors.allowed-headers:*}")
    private String allowedHeaders;

    @Value("${cors.max-age:3600}")
    private long maxAge;

    /**
     * Registers a global CORS mapping that applies to all API endpoints.
     *
     * @return a {@link WebMvcConfigurer} with CORS rules applied to {@code /api/**}
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                var mapping = registry.addMapping("/api/**")
                        .allowedMethods(allowedMethods)
                        .allowedHeaders(allowedHeaders.split(","))
                        .allowCredentials(true)
                        .maxAge(maxAge);

                if (allowedOrigins != null && allowedOrigins.length > 0) {
                    mapping.allowedOrigins(allowedOrigins);
                }

                if (allowedOriginPatterns != null && allowedOriginPatterns.length > 0) {
                    mapping.allowedOriginPatterns(allowedOriginPatterns);
                }
            }
        };
    }
}
