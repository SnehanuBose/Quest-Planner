package com.whiteboard.backend.service;

import java.util.Map;

/**
 * Service interface for generating SQL DDL scripts from ER diagram canvas data.
 *
 * <p>Parses Entity-Relationship table nodes and their connecting edges from the
 * canvas JSON structure to produce syntactically valid PostgreSQL schema scripts.
 * This enables users to visually design their database and export it as executable SQL.</p>
 *
 * @author Whiteboard Team
 * @version 1.0.0
 */
public interface SqlExportService {

    /**
     * Generates a PostgreSQL-compatible DDL script from the ER nodes in canvas data.
     *
     * <p>Processes the canvas data to extract:</p>
     * <ul>
     *   <li>{@code erTable} nodes → {@code CREATE TABLE} statements with columns and types</li>
     *   <li>Primary key constraints from column definitions</li>
     *   <li>Foreign key constraints derived from edge connections between tables</li>
     * </ul>
     *
     * @param canvasData the canvas JSON containing nodes and edges
     * @return a complete PostgreSQL DDL script as a string
     * @throws IllegalArgumentException if the canvas data is null or contains malformed ER definitions
     */
    String generateSqlScript(Map<String, Object> canvasData);
}
