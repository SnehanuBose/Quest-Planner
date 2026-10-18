package com.whiteboard.backend.repository;

import com.whiteboard.backend.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Board} entities.
 *
 * <p>Provides standard CRUD operations out of the box, plus custom query methods
 * for optimized data access patterns. Boards are sorted by most recently updated
 * first to support dashboard-style listing.</p>
 *
 * @author Whiteboard Team
 * @version 1.0.0
 */
@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {

    /**
     * Retrieves all boards ordered by their last update timestamp in descending order.
     *
     * @return list of boards sorted by {@code updatedAt} descending
     */
    List<Board> findAllByOrderByUpdatedAtDesc();

    /**
     * Retrieves all boards belonging to a specific user ordered by their last update timestamp descending.
     *
     * @param userId the ID of the board owner
     * @return list of user-owned boards sorted by {@code updatedAt} descending
     */
    List<Board> findAllByUserIdOrderByUpdatedAtDesc(Long userId);

    /**
     * Finds a board by ID and owning user ID for secure ownership verification.
     *
     * @param id     the board ID
     * @param userId the owning user ID
     * @return optional containing the board if owned by user
     */
    Optional<Board> findByIdAndUserId(Long id, Long userId);

    /**
     * Counts the total number of boards created by a user.
     * Used for the Admin dashboard user summary without exposing any canvas data.
     *
     * @param userId the user ID to count plans for
     * @return total count of plans created by the user
     */
    long countByUserId(Long userId);
}
