package com.whiteboard.backend.service.impl;

import com.whiteboard.backend.service.SqlExportService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation of {@link SqlExportService} that parses ER diagram nodes from
 * canvas data and generates syntactically valid PostgreSQL DDL scripts.
 *
 * <p>The export logic processes two primary structures from the canvas JSON:</p>
 * <ol>
 *   <li><strong>Nodes</strong> with type {@code "erTable"}: Each node's {@code data}
 *       contains a table label and column definitions, producing {@code CREATE TABLE}
 *       statements with column types, nullability, and primary key constraints.</li>
 *   <li><strong>Edges</strong>: Connections between ER table nodes are interpreted as
 *       foreign key relationships, generating {@code ALTER TABLE ... ADD CONSTRAINT}
 *       statements linking source and target columns.</li>
 * </ol>
 *
 * <p>The generated script follows PostgreSQL conventions and is designed to be
 * directly executable against a PostgreSQL instance.</p>
 *
 * @author Whiteboard Team
 * @version 1.0.0
 */
@Slf4j
@Service
public class SqlExportServiceImpl implements SqlExportService {

    /**
     * {@inheritDoc}
     */
    @Override
    public String generateSqlScript(Map<String, Object> canvasData) {
        if (canvasData == null) {
            throw new IllegalArgumentException("Canvas data cannot be null for SQL export");
        }

        log.info("Starting SQL export from canvas data");

        StringBuilder sql = new StringBuilder();
        sql.append("-- ============================================\n");
        sql.append("-- Generated PostgreSQL Schema\n");
        sql.append("-- Exported from Whiteboard ER Diagram Builder\n");
        sql.append(String.format("-- Generated at: %s\n", java.time.LocalDateTime.now()));
        sql.append("-- ============================================\n\n");

        // Extract nodes and edges from canvas data
        List<Map<String, Object>> nodes = extractList(canvasData, "nodes");
        List<Map<String, Object>> edges = extractList(canvasData, "edges");

        // Filter only ER table nodes
        List<Map<String, Object>> erTables = nodes.stream()
                .filter(node -> "erTable".equals(node.get("type")))
                .collect(Collectors.toList());

        if (erTables.isEmpty()) {
            log.warn("No ER table nodes found in canvas data");
            sql.append("-- No ER table nodes found in the canvas.\n");
            return sql.toString();
        }

        // Build a lookup map from node ID to table name for FK resolution
        Map<String, String> nodeIdToTableName = new LinkedHashMap<>();
        for (Map<String, Object> table : erTables) {
            String nodeId = (String) table.get("id");
            Map<String, Object> data = extractMap(table, "data");
            String tableName = sanitizeIdentifier((String) data.getOrDefault("label", "unnamed_table"));
            nodeIdToTableName.put(nodeId, tableName);
        }

        log.info("Found {} ER table(s) to export", erTables.size());

        // Generate CREATE TABLE statements
        for (Map<String, Object> table : erTables) {
            Map<String, Object> data = extractMap(table, "data");
            String tableName = sanitizeIdentifier((String) data.getOrDefault("label", "unnamed_table"));
            List<Map<String, Object>> columns = extractList(data, "columns");

            sql.append(String.format("CREATE TABLE %s (\n", tableName));

            List<String> columnDefinitions = new ArrayList<>();
            List<String> primaryKeys = new ArrayList<>();

            for (Map<String, Object> column : columns) {
                String colName = sanitizeIdentifier((String) column.getOrDefault("name", "unnamed_column"));
                String colType = (String) column.getOrDefault("type", "VARCHAR(255)");
                boolean isPrimaryKey = Boolean.TRUE.equals(column.get("primaryKey"));
                boolean isNullable = column.containsKey("nullable") ? Boolean.TRUE.equals(column.get("nullable")) : true;

                StringBuilder colDef = new StringBuilder();
                colDef.append(String.format("    %-30s %s", colName, colType.toUpperCase()));

                if (!isNullable && !isPrimaryKey) {
                    colDef.append(" NOT NULL");
                }

                columnDefinitions.add(colDef.toString());

                if (isPrimaryKey) {
                    primaryKeys.add(colName);
                }
            }

            // Add primary key constraint if any columns are marked as PK
            if (!primaryKeys.isEmpty()) {
                String pkConstraint = String.format("    CONSTRAINT pk_%s PRIMARY KEY (%s)",
                        tableName, String.join(", ", primaryKeys));
                columnDefinitions.add(pkConstraint);
            }

            // Fallback for tables defined without explicit columns
            if (columnDefinitions.isEmpty()) {
                columnDefinitions.add("    id                             SERIAL PRIMARY KEY");
            }

            sql.append(String.join(",\n", columnDefinitions));
            sql.append("\n);\n\n");
        }

        // Generate foreign key constraints from edges
        List<String> fkStatements = generateForeignKeys(edges, nodeIdToTableName);
        if (!fkStatements.isEmpty()) {
            sql.append("-- Foreign Key Constraints\n");
            sql.append("-- ============================================\n\n");
            fkStatements.forEach(fk -> sql.append(fk).append("\n\n"));
        }

        String result = sql.toString();
        log.info("SQL export completed. Generated {} table(s) and {} foreign key(s)",
                erTables.size(), fkStatements.size());

        return result;
    }

    // -------------------------------------------------------------------------
    // Private Helper Methods
    // -------------------------------------------------------------------------

    /**
     * Generates ALTER TABLE statements for foreign key constraints derived from edges.
     *
     * <p>Each edge connecting two ER table nodes is treated as a foreign key relationship.
     * The edge's {@code data.sourceColumn} (or visual handle) and {@code data.targetColumn}
     * fields specify the columns involved in the constraint.</p>
     *
     * @param edges            list of edge definitions from the canvas
     * @param nodeIdToTableName mapping of node IDs to sanitized table names
     * @return list of ALTER TABLE SQL statements
     */
    private List<String> generateForeignKeys(List<Map<String, Object>> edges,
                                              Map<String, String> nodeIdToTableName) {
        List<String> fkStatements = new ArrayList<>();
        int fkCounter = 1;

        for (Map<String, Object> edge : edges) {
            String sourceNodeId = (String) edge.get("source");
            String targetNodeId = (String) edge.get("target");

            // Only process edges between known ER table nodes
            if (!nodeIdToTableName.containsKey(sourceNodeId) ||
                    !nodeIdToTableName.containsKey(targetNodeId)) {
                continue;
            }

            String sourceTable = nodeIdToTableName.get(sourceNodeId);
            String targetTable = nodeIdToTableName.get(targetNodeId);

            Map<String, Object> edgeData = extractMap(edge, "data");

            // Support sourceColumn, with fallback to React Flow sourceHandle, then targetTable_id convention
            String sourceCol = (String) edgeData.get("sourceColumn");
            if (sourceCol == null || sourceCol.isBlank()) {
                sourceCol = (String) edge.get("sourceHandle");
            }
            if (sourceCol == null || sourceCol.isBlank()) {
                sourceCol = targetTable + "_id";
            }
            String sourceColumn = sanitizeIdentifier(sourceCol);

            // Support targetColumn, with fallback to React Flow targetHandle, then 'id' convention
            String targetCol = (String) edgeData.get("targetColumn");
            if (targetCol == null || targetCol.isBlank()) {
                targetCol = (String) edge.get("targetHandle");
            }
            if (targetCol == null || targetCol.isBlank()) {
                targetCol = "id";
            }
            String targetColumn = sanitizeIdentifier(targetCol);

            String constraintName = String.format("fk_%s_%s_%d", sourceTable, targetTable, fkCounter++);

            String fkStatement = String.format(
                    "ALTER TABLE %s\n    ADD CONSTRAINT %s\n    FOREIGN KEY (%s) REFERENCES %s (%s);" ,
                    sourceTable, constraintName, sourceColumn, targetTable, targetColumn);

            fkStatements.add(fkStatement);
        }

        return fkStatements;
    }

    /**
     * Sanitizes an identifier for safe use in SQL by removing non-alphanumeric characters
     * (except underscores) and converting to lowercase.
     *
     * @param identifier the raw identifier string
     * @return a sanitized, SQL-safe identifier
     */
    private String sanitizeIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return "unnamed";
        }
        return identifier.toLowerCase().replaceAll("[^a-z0-9_]", "_").trim();
    }

    /**
     * Safely extracts a list from a map, returning an empty list if the key is
     * missing or the value is not a list.
     */
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extractList(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof List<?>) {
            return (List<Map<String, Object>>) value;
        }
        return Collections.emptyList();
    }

    /**
     * Safely extracts a nested map from a parent map, returning an empty map if
     * the key is missing or the value is not a map.
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> extractMap(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Map<?, ?>) {
            return (Map<String, Object>) value;
        }
        return Collections.emptyMap();
    }
}
