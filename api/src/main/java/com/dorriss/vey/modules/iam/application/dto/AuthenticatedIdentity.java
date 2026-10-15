package com.dorriss.vey.modules.iam.application.dto;

import java.time.Instant;

/** Dữ liệu đầu vào chỉ được tạo từ JWT đã xác minh, không nhận trực tiếp từ request body. */
public record AuthenticatedIdentity(
    String authUserId,
    String email,
    boolean emailVerified,
    String displayName,
    String avatarUrl,
    String authSessionId,
    Instant authSessionCreatedAt) {}
