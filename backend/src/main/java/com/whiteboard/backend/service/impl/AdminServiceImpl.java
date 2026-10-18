package com.whiteboard.backend.service.impl;

import com.whiteboard.backend.dto.response.AdminUserSummaryResponse;
import com.whiteboard.backend.repository.BoardRepository;
import com.whiteboard.backend.repository.UserRepository;
import com.whiteboard.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of {@link AdminService} fulfilling the strict privacy guard.
 *
 * <p>STRICT PRIVACY GUARD: Exposes strictly user metadata and the numeric
 * count of plans created. Does NOT load or leak board contents or titles.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final BoardRepository boardRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AdminUserSummaryResponse> getAllUsersSummary() {
        log.info("Fetching admin user summaries with strict privacy guard");

        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(user -> {
                    long planCount = boardRepository.countByUserId(user.getId());
                    return AdminUserSummaryResponse.builder()
                            .id(user.getId())
                            .username(user.getUsername())
                            .email(user.getEmail())
                            .role(user.getRole())
                            .createdAt(user.getCreatedAt())
                            .planCount(planCount)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
