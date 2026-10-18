package com.whiteboard.backend.repository;

import com.whiteboard.backend.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

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
     * <p>This ensures the most recently modified boards appear first in dashboard views,
     * leveraging the {@code idx_boards_updated_at} index for performant sorting.</p>
     *
     * @return list of boards sorted by {@code updatedAt} descending
     */
    List<Board> findAllByOrderByUpdatedAtDesc();
}
