package com.whiteboard.backend.service;

import com.whiteboard.backend.dto.response.AdminUserSummaryResponse;

import java.util.List;

/**
 * Service defining administrative operations.
 */
public interface AdminService {

    /**
     * Retrieves high-level user statistics for the Admin dashboard.
     *
     * <p>STRICT PRIVACY GUARD: Exposes strictly user metadata and the numeric
     * count of plans created. Does NOT load or leak board contents or titles.</p>
     *
     * @return list of privacy-compliant user summaries
     */
    List<AdminUserSummaryResponse> getAllUsersSummary();
}
