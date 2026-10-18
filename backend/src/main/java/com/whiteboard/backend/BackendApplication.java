package com.whiteboard.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Whiteboard Backend application.
 *
 * <p>This Spring Boot application serves as the REST API backend for a visual
 * workspace that combines interactive To-Do lists, a freeform whiteboard canvas,
 * and an Entity-Relationship (ER) diagram builder.</p>
 *
 * <p>The application bootstraps all auto-configured Spring components including
 * Spring Web MVC, Spring Data JPA with PostgreSQL, and Jakarta Bean Validation.</p>
 *
 * @author Whiteboard Team
 * @version 1.0.0
 */
@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
