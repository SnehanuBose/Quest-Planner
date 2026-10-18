package com.whiteboard.backend.controller;

import com.whiteboard.backend.dto.response.AdminUserSummaryResponse;
import com.whiteboard.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for administrative management and oversight.
 *
 * <p>STRICT PRIVACY GUARD: Exposes user metadata and total plan counts only.
 * Admins are strictly forbidden from viewing or inspecting user board contents or canvas details.</p>
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<AdminUserSummaryResponse>> getAllUsers() {
        log.info("GET /api/v1/admin/users — Admin requesting user summary list");
        List<AdminUserSummaryResponse> users = adminService.getAllUsersSummary();
        return ResponseEntity.ok(users);
    }
}
