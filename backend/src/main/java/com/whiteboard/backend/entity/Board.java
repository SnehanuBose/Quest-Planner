package com.whiteboard.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * JPA entity representing a visual workspace board.
 *
 * <p>Each board encapsulates a canvas containing nodes (To-Do lists, sticky notes,
 * ER tables) and edges (connections between nodes). The canvas data is stored as
 * a native PostgreSQL {@code jsonb} column, enabling flexible schema-less storage
 * of the dynamic visual tree while retaining query capabilities.</p>
 *
 * <p>Lifecycle timestamps ({@code createdAt}, {@code updatedAt}) are managed
 * automatically via JPA callbacks to ensure audit consistency.</p>
 *
 * @author Whiteboard Team
 * @version 1.0.0
 */
@Entity
@Table(name = "boards", indexes = {
        @Index(name = "idx_boards_updated_at", columnList = "updated_at"),
        @Index(name = "idx_boards_user_id", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Board {

    /**
     * Unique identifier for the board, auto-generated using database identity strategy.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The user who owns this board.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    /**
     * Human-readable title of the board. Required and limited to 255 characters.
     */
    @Column(name = "title", nullable = false, length = 255)
    private String title;

    /**
     * Optional longer description providing context about the board's purpose.
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * Dynamic JSON tree representing the visual canvas state.
     *
     * <p>Stored as PostgreSQL {@code jsonb} for efficient querying and indexing.
     * The structure follows the pattern:
     * <pre>
     * {
     *   "nodes": [ { "id": "...", "type": "todoNode|stickyNote|imageNode", "position": {...}, "data": {...} } ],
     *   "edges": [ { "id": "...", "source": "...", "target": "...", "data": {...} } ],
     *   "drawings": [ { "id": "...", "points": [...], "color": "...", "width": 4 } ]
     * }
     * </pre>
     * </p>
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "canvas_data", columnDefinition = "jsonb")
    private Map<String, Object> canvasData;

    /**
     * Timestamp of when the board was first created. Set once during initial persist.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp of the most recent update. Refreshed on every modification.
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * JPA lifecycle callback that initializes timestamps before the entity is
     * first persisted to the database.
     */
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    /**
     * JPA lifecycle callback that refreshes the {@code updatedAt} timestamp
     * before every subsequent update.
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
