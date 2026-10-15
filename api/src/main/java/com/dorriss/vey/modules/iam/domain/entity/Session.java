package com.dorriss.vey.modules.iam.domain.entity;

import com.dorriss.vey.infrastructure.persistence.BaseEntity;
import com.dorriss.vey.modules.iam.domain.enums.SessionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/** Phiên truy cập Vey, độc lập với thời hạn cookie/session của Better Auth. */
@Entity
@Table(schema = "iam", name = "sessions")
@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Session extends BaseEntity {
  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(name = "auth_session_id", length = 255)
  // Liên kết logic đến identity session, không tạo foreign key xuyên schema auth/iam.
  private String authSessionId;

  @Column(name = "auth_session_created_at")
  // Cutoff reset mật khẩu xét thời điểm identity session được tạo, không xét thời điểm Vey
  // exchange.
  private Instant authSessionCreatedAt;

  @Column(name = "exchange_token_hash", length = 64)
  // Fingerprint issuer|jti đã tiêu thụ để chặn exchange lại cùng một passport.
  private String exchangeTokenHash;

  @Column(name = "token_hash", length = 64, nullable = false)
  private String tokenHash;

  @Column(name = "active_workspace_id")
  private UUID activeWorkspaceId;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", length = 16, nullable = false)
  private SessionStatus status;

  @Column(name = "expires_at", nullable = false)
  private Instant expiresAt;

  @Column(name = "last_seen_at")
  private Instant lastSeenAt;

  @Column(name = "revoked_at")
  private Instant revokedAt;

  @Column(name = "revoked_reason", length = 255)
  private String revokedReason;
}
