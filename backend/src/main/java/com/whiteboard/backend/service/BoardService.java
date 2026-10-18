package com.whiteboard.backend.service;

import com.whiteboard.backend.dto.request.CreateBoardRequest;
import com.whiteboard.backend.dto.request.UpdateBoardRequest;
import com.whiteboard.backend.dto.response.BoardResponse;
import com.whiteboard.backend.dto.response.BoardSummaryResponse;

import java.util.List;

/**
 * Service interface defining business operations for board management.
 *
 * <p>Abstracts the business logic layer from controller concerns, enabling
 * clean separation of HTTP handling from domain logic. Implementations handle
 * entity lifecycle, validation, and DTO transformations.</p>
 *
 * @author Whiteboard Team
 * @version 1.0.0
 */
public interface BoardService {

    /**
     * Retrieves lightweight summaries of all boards, sorted by most recently updated.
     *
     * <p>Omits the heavy {@code canvasData} payload to optimize dashboard loading.
     * The returned list uses the {@code idx_boards_updated_at} index for fast sorting.</p>
     *
     * @return list of board summaries ordered by {@code updatedAt} descending
     */
    List<BoardSummaryResponse> getAllBoards();

    /**
     * Retrieves the full details of a specific board including its complete canvas data.
     *
     * @param id the unique identifier of the board to retrieve
     * @return the complete board response with canvas data
     * @throws com.whiteboard.backend.exception.ResourceNotFoundException if no board exists with the given ID
     */
    BoardResponse getBoardById(Long id);

    /**
     * Creates a new board with the provided title and optional description.
     *
     * <p>Initializes the canvas with a default empty structure containing
     * empty {@code nodes} and {@code edges} arrays, ready for the frontend
     * to populate as the user interacts with the canvas.</p>
     *
     * @param request the creation payload with validated title and optional description
     * @return the created board response including generated ID and timestamps
     */
    BoardResponse createBoard(CreateBoardRequest request);

    /**
     * Updates an existing board's title, description, and/or canvas data.
     *
     * <p>Supports partial updates — only non-null fields in the request will
     * overwrite existing values. This design optimizes autosave operations
     * where only changed fields are transmitted.</p>
     *
     * @param id      the unique identifier of the board to update
     * @param request the update payload containing fields to modify
     * @return the updated board response reflecting all changes
     * @throws com.whiteboard.backend.exception.ResourceNotFoundException if no board exists with the given ID
     */
    BoardResponse updateBoard(Long id, UpdateBoardRequest request);

    /**
     * Permanently deletes a board and all its associated canvas data.
     *
     * @param id the unique identifier of the board to delete
     * @throws com.whiteboard.backend.exception.ResourceNotFoundException if no board exists with the given ID
     */
    void deleteBoard(Long id);
}
