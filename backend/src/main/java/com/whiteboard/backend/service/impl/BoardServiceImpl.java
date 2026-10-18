package com.whiteboard.backend.service.impl;

import com.whiteboard.backend.dto.request.CreateBoardRequest;
import com.whiteboard.backend.dto.request.UpdateBoardRequest;
import com.whiteboard.backend.dto.response.BoardResponse;
import com.whiteboard.backend.dto.response.BoardSummaryResponse;
import com.whiteboard.backend.entity.Board;
import com.whiteboard.backend.exception.ResourceNotFoundException;
import com.whiteboard.backend.repository.BoardRepository;
import com.whiteboard.backend.service.BoardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation of {@link BoardService} managing the full lifecycle of boards.
 *
 * <p>Handles entity creation, retrieval, update, and deletion with proper
 * transactional boundaries. Read-only operations are optimized with
 * {@code @Transactional(readOnly = true)} to leverage Hibernate flush-mode
 * optimizations and potential read-replica routing.</p>
 *
 * <p>All entity-to-DTO transformations are centralized in private mapping methods
 * to maintain consistency and reduce duplication across service methods.</p>
 *
 * @author Whiteboard Team
 * @version 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class BoardServiceImpl implements BoardService {

    private final BoardRepository boardRepository;

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public List<BoardSummaryResponse> getAllBoards() {
        log.debug("Fetching all board summaries");

        return boardRepository.findAllByOrderByUpdatedAtDesc().stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public BoardResponse getBoardById(Long id) {
        log.debug("Fetching board with id: {}", id);

        Board board = findBoardOrThrow(id);
        return toFullResponse(board);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public BoardResponse createBoard(CreateBoardRequest request) {
        log.info("Creating new board with title: '{}'", request.getTitle());

        // Initialize with default empty canvas structure
        Map<String, Object> defaultCanvas = new LinkedHashMap<>();
        defaultCanvas.put("nodes", new ArrayList<>());
        defaultCanvas.put("edges", new ArrayList<>());

        Board board = Board.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .canvasData(defaultCanvas)
                .build();

        Board savedBoard = boardRepository.save(board);
        log.info("Board created successfully with id: {}", savedBoard.getId());

        return toFullResponse(savedBoard);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public BoardResponse updateBoard(Long id, UpdateBoardRequest request) {
        log.debug("Updating board with id: {}", id);

        Board board = findBoardOrThrow(id);

        // Apply partial updates — only overwrite non-null fields
        if (request.getTitle() != null) {
            board.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            board.setDescription(request.getDescription());
        }
        if (request.getCanvasData() != null) {
            board.setCanvasData(request.getCanvasData());
        }

        Board updatedBoard = boardRepository.save(board);
        log.debug("Board updated successfully with id: {}", updatedBoard.getId());

        return toFullResponse(updatedBoard);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void deleteBoard(Long id) {
        log.info("Deleting board with id: {}", id);

        Board board = findBoardOrThrow(id);
        boardRepository.delete(board);

        log.info("Board deleted successfully with id: {}", id);
    }

    // -------------------------------------------------------------------------
    // Private Helper Methods
    // -------------------------------------------------------------------------

    /**
     * Retrieves a board by ID or throws {@link ResourceNotFoundException}.
     *
     * @param id the board ID to look up
     * @return the found board entity
     */
    private Board findBoardOrThrow(Long id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Board", "id", id));
    }

    /**
     * Maps a {@link Board} entity to a full {@link BoardResponse} DTO.
     */
    private BoardResponse toFullResponse(Board board) {
        return BoardResponse.builder()
                .id(board.getId())
                .title(board.getTitle())
                .description(board.getDescription())
                .canvasData(board.getCanvasData())
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .build();
    }

    /**
     * Maps a {@link Board} entity to a lightweight {@link BoardSummaryResponse} DTO,
     * deliberately omitting the canvas data to minimize response size.
     */
    private BoardSummaryResponse toSummaryResponse(Board board) {
        return BoardSummaryResponse.builder()
                .id(board.getId())
                .title(board.getTitle())
                .description(board.getDescription())
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .build();
    }
}
