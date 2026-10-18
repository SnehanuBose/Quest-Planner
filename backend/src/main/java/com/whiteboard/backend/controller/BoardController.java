package com.whiteboard.backend.controller;

import com.whiteboard.backend.dto.request.CreateBoardRequest;
import com.whiteboard.backend.dto.request.UpdateBoardRequest;
import com.whiteboard.backend.dto.response.BoardResponse;
import com.whiteboard.backend.dto.response.BoardSummaryResponse;
import com.whiteboard.backend.service.BoardService;
import com.whiteboard.backend.service.SqlExportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller exposing CRUD endpoints for board management and SQL export.
 *
 * <p>All endpoints are prefixed with {@code /api/v1/boards} and follow RESTful
 * conventions. This controller acts as a thin HTTP orchestration layer — all
 * business logic, validations, and transformations are delegated to the service layer.</p>
 *
 * <h3>Endpoint Summary:</h3>
 * <ul>
 *   <li>{@code GET    /api/v1/boards}              — List all board summaries</li>
 *   <li>{@code GET    /api/v1/boards/{id}}          — Get full board details</li>
 *   <li>{@code POST   /api/v1/boards}               — Create a new board</li>
 *   <li>{@code PUT    /api/v1/boards/{id}}           — Update (autosave) a board</li>
 *   <li>{@code DELETE /api/v1/boards/{id}}           — Delete a board</li>
 *   <li>{@code POST   /api/v1/boards/{id}/export-sql} — Export ER diagram as SQL DDL</li>
 * </ul>
 *
 * @author Whiteboard Team
 * @version 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;
    private final SqlExportService sqlExportService;

    /**
     * Retrieves a lightweight list of all boards for dashboard display.
     *
     * <p>Returns board summaries without canvas data to minimize payload size
     * and improve dashboard loading performance.</p>
     *
     * @return HTTP 200 with list of board summaries
     */
    @GetMapping
    public ResponseEntity<List<BoardSummaryResponse>> getAllBoards() {
        log.debug("GET /api/v1/boards — Fetching all board summaries");
        List<BoardSummaryResponse> boards = boardService.getAllBoards();
        return ResponseEntity.ok(boards);
    }

    /**
     * Retrieves the full details of a specific board including its canvas data.
     *
     * @param id the unique identifier of the board
     * @return HTTP 200 with the complete board response, or HTTP 404 if not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<BoardResponse> getBoardById(@PathVariable Long id) {
        log.debug("GET /api/v1/boards/{} — Fetching board details", id);
        BoardResponse board = boardService.getBoardById(id);
        return ResponseEntity.ok(board);
    }

    /**
     * Creates a new board with default empty canvas data.
     *
     * @param request the validated creation payload containing title and optional description
     * @return HTTP 201 with the created board response
     */
    @PostMapping
    public ResponseEntity<BoardResponse> createBoard(@Valid @RequestBody CreateBoardRequest request) {
        log.info("POST /api/v1/boards — Creating board with title: '{}'", request.getTitle());
        BoardResponse board = boardService.createBoard(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(board);
    }

    /**
     * Updates an existing board's title, description, and/or canvas data.
     *
     * <p>Designed for autosave — supports partial updates where only modified
     * fields are transmitted from the frontend.</p>
     *
     * @param id      the unique identifier of the board to update
     * @param request the update payload with fields to modify
     * @return HTTP 200 with the updated board response, or HTTP 404 if not found
     */
    @PutMapping("/{id}")
    public ResponseEntity<BoardResponse> updateBoard(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBoardRequest request) {
        log.debug("PUT /api/v1/boards/{} — Updating board", id);
        BoardResponse board = boardService.updateBoard(id, request);
        return ResponseEntity.ok(board);
    }

    /**
     * Permanently deletes the specified board.
     *
     * @param id the unique identifier of the board to delete
     * @return HTTP 204 No Content on successful deletion, or HTTP 404 if not found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long id) {
        log.info("DELETE /api/v1/boards/{} — Deleting board", id);
        boardService.deleteBoard(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Removes a specific node and its connected edges from a board's canvas data.
     *
     * @param boardId the unique identifier of the board
     * @param nodeId  the unique identifier of the node to remove
     * @return HTTP 200 with the updated board details
     */
    @DeleteMapping("/{boardId}/nodes/{nodeId}")
    public ResponseEntity<BoardResponse> deleteNode(
            @PathVariable Long boardId,
            @PathVariable String nodeId) {
        log.info("DELETE /api/v1/boards/{}/nodes/{} — Deleting node", boardId, nodeId);
        return ResponseEntity.ok(boardService.deleteNode(boardId, nodeId));
    }

    /**
     * Exports the ER diagram from a board's canvas data as a PostgreSQL DDL script.
     *
     * <p>Parses all {@code erTable} nodes and edge connections from the board's
     * canvas data to generate {@code CREATE TABLE} statements with column definitions,
     * primary key constraints, and foreign key relationships.</p>
     *
     * @param id the unique identifier of the board whose ER diagram to export
     * @return HTTP 200 with the generated SQL script as plain text
     */
    @PostMapping("/{id}/export-sql")
    public ResponseEntity<Map<String, String>> exportSql(@PathVariable Long id) {
        log.info("POST /api/v1/boards/{}/export-sql — Exporting SQL schema", id);

        BoardResponse board = boardService.getBoardById(id);
        String sqlScript = sqlExportService.generateSqlScript(board.getCanvasData());

        Map<String, String> response = Map.of("sql", sqlScript);
        return ResponseEntity.ok(response);
    }
}
