package com.whiteboard.backend.service.impl;

import com.whiteboard.backend.dto.request.CreateBoardRequest;
import com.whiteboard.backend.dto.request.UpdateBoardRequest;
import com.whiteboard.backend.dto.response.BoardResponse;
import com.whiteboard.backend.dto.response.BoardSummaryResponse;
import com.whiteboard.backend.entity.Board;
import com.whiteboard.backend.entity.User;
import com.whiteboard.backend.exception.ResourceNotFoundException;
import com.whiteboard.backend.repository.BoardRepository;
import com.whiteboard.backend.repository.UserRepository;
import com.whiteboard.backend.security.SecurityUtils;
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
 * transactional boundaries. All board operations are strictly scoped to the
 * authenticated user, enforcing complete cross-user data isolation.</p>
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
    private final UserRepository userRepository;

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public List<BoardSummaryResponse> getAllBoards() {
        Long userId = SecurityUtils.getCurrentUserId();
        log.debug("Fetching board summaries for user id: {}", userId);

        if (userId == null) {
            return Collections.emptyList();
        }

        return boardRepository.findAllByUserIdOrderByUpdatedAtDesc(userId).stream()
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
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("Creating new board with title: '{}' for user id: {}", request.getTitle(), userId);

        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        // Initialize with default empty canvas structure
        Map<String, Object> defaultCanvas = new LinkedHashMap<>();
        defaultCanvas.put("nodes", new ArrayList<>());
        defaultCanvas.put("edges", new ArrayList<>());

        Board board = Board.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .canvasData(defaultCanvas)
                .user(user)
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

    /**
     * {@inheritDoc}
     */
    @Override
    @SuppressWarnings("unchecked")
    public BoardResponse deleteNode(Long boardId, String nodeId) {
        log.info("Deleting node '{}' from board with id: {}", nodeId, boardId);

        Board board = findBoardOrThrow(boardId);
        Map<String, Object> canvasData = board.getCanvasData();

        if (canvasData != null && nodeId != null) {
            // Remove node matching nodeId
            Object nodesObj = canvasData.get("nodes");
            if (nodesObj instanceof List<?>) {
                List<Map<String, Object>> nodes = (List<Map<String, Object>>) nodesObj;
                List<Map<String, Object>> filteredNodes = nodes.stream()
                        .filter(node -> !nodeId.equals(String.valueOf(node.get("id"))))
                        .collect(Collectors.toList());
                canvasData.put("nodes", filteredNodes);
            }

            // Cascade-remove any connected edges (source == nodeId || target == nodeId)
            Object edgesObj = canvasData.get("edges");
            if (edgesObj instanceof List<?>) {
                List<Map<String, Object>> edges = (List<Map<String, Object>>) edgesObj;
                List<Map<String, Object>> filteredEdges = edges.stream()
                        .filter(edge -> !nodeId.equals(String.valueOf(edge.get("source")))
                                     && !nodeId.equals(String.valueOf(edge.get("target"))))
                        .collect(Collectors.toList());
                canvasData.put("edges", filteredEdges);
            }

            board.setCanvasData(canvasData);
            board = boardRepository.save(board);
        }

        return toFullResponse(board);
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
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new ResourceNotFoundException("Board", "id", id);
        }
        return boardRepository.findByIdAndUserId(id, userId)
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
