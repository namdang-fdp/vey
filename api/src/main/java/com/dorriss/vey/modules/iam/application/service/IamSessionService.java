package com.dorriss.vey.modules.iam.application.service;

import com.dorriss.vey.common.security.VeyPrincipal;
import com.dorriss.vey.modules.iam.application.dto.AuthenticatedIdentity;
import com.dorriss.vey.modules.iam.application.dto.VeyContext;
import com.dorriss.vey.modules.iam.application.support.SessionTokens;
import com.dorriss.vey.modules.iam.domain.entity.Session;
import com.dorriss.vey.modules.iam.domain.entity.User;
import com.dorriss.vey.modules.iam.domain.entity.Workspace;
import com.dorriss.vey.modules.iam.domain.entity.WorkspaceMembership;
import com.dorriss.vey.modules.iam.domain.enums.MembershipRole;
import com.dorriss.vey.modules.iam.domain.enums.MembershipStatus;
import com.dorriss.vey.modules.iam.domain.enums.SessionStatus;
import com.dorriss.vey.modules.iam.domain.enums.UserStatus;
import com.dorriss.vey.modules.iam.domain.enums.WorkspaceStatus;
import com.dorriss.vey.modules.iam.domain.enums.WorkspaceType;
import com.dorriss.vey.modules.iam.persistence.SessionRepository;
import com.dorriss.vey.modules.iam.persistence.UserRepository;
import com.dorriss.vey.modules.iam.persistence.WorkspaceMembershipRepository;
import com.dorriss.vey.modules.iam.persistence.WorkspaceRepository;
import com.dorriss.vey.modules.iam.security.AuthProperties;
import com.github.f4b6a3.uuid.UuidCreator;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Điều phối user/workspace/membership và Vey session trong schema iam. Danh tính đầu vào đã được
 * security boundary xác minh; service không đọc credential hoặc bảng của schema auth.
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class IamSessionService {
  JdbcTemplate jdbc;
  UserRepository users;
  WorkspaceRepository workspaces;
  WorkspaceMembershipRepository memberships;
  SessionRepository sessions;
  AuthProperties properties;

  /**
   * Đổi identity passport thành Vey session trong một transaction. Khóa theo identity và khóa user
   * row ngăn provisioning trùng; unique constraints là lớp bảo vệ cuối cùng khi có cạnh tranh.
   */
  @Transactional
  public VeyContext exchange(
      AuthenticatedIdentity identity, String jwtFingerprint, String rawToken) {
    Instant now = Instant.now();
    lockIdentity(identity.authUserId());
    // Ledger có thể tồn tại trước user IAM: passport cũ vẫn bị chặn sau logout/reset mật khẩu.
    if (Boolean.TRUE.equals(
        jdbc.queryForObject(
            """
        select exists (select 1 from iam.auth_revocations where auth_user_id = ? and
          (auth_session_id = ? or (auth_session_id is null and occurred_at >= ?)))
        """,
            Boolean.class,
            identity.authUserId(),
            identity.authSessionId(),
            java.sql.Timestamp.from(identity.authSessionCreatedAt())))) {
      throw new BadCredentialsException("Identity session was revoked");
    }
    jdbc.update(
        """
        insert into iam.users (id, auth_user_id, primary_email, email_verified, status, created_at)
        values (?, ?, ?, ?, 'ACTIVE', ?) on conflict (auth_user_id) do nothing
        """,
        UuidCreator.getTimeOrderedEpoch(),
        identity.authUserId(),
        identity.email(),
        identity.emailVerified(),
        java.sql.Timestamp.from(now));
    UUID userId =
        jdbc.queryForObject(
            "select id from iam.users where auth_user_id = ? for update",
            UUID.class,
            identity.authUserId());
    User user = users.findById(userId).orElseThrow();
    if (user.getStatus() != UserStatus.ACTIVE || user.getDeletedAt() != null) {
      throw new BadCredentialsException("User is unavailable");
    }
    if (jdbc.queryForObject(
            "select count(*) from iam.sessions where exchange_token_hash = ?",
            Integer.class,
            jwtFingerprint)
        != 0) {
      throw new BadCredentialsException("Exchange token already consumed");
    }
    // User đang được JPA quản lý; dirty checking ghi profile khi transaction flush/commit.
    user.updateIdentity(
        identity.email(),
        identity.emailVerified(),
        identity.displayName(),
        identity.avatarUrl(),
        now);
    // Exchange luôn chọn workspace cá nhân khởi tạo; không tạo lại ở mỗi lần đăng nhập.
    Workspace workspace =
        workspaces
            .findByInitialForUserId(userId)
            .orElseGet(
                () ->
                    workspaces.saveAndFlush(
                        Workspace.builder()
                            .type(WorkspaceType.PERSONAL)
                            .name("Personal workspace")
                            .slug("personal-" + userId)
                            .createdByUserId(userId)
                            .initialForUserId(userId)
                            .status(WorkspaceStatus.ACTIVE)
                            .build()));
    WorkspaceMembership membership =
        memberships
            .findByWorkspaceIdAndUserId(workspace.getId(), userId)
            .orElseGet(
                () ->
                    memberships.saveAndFlush(
                        WorkspaceMembership.builder()
                            .workspaceId(workspace.getId())
                            .userId(userId)
                            .role(MembershipRole.OWNER)
                            .status(MembershipStatus.ACTIVE)
                            .joinedAt(now)
                            .build()));
    if (workspace.getStatus() != WorkspaceStatus.ACTIVE
        || membership.getStatus() != MembershipStatus.ACTIVE) {
      throw new AccessDeniedException("Workspace access is unavailable");
    }
    sessions.saveAndFlush(
        Session.builder()
            .userId(userId)
            .authSessionId(identity.authSessionId())
            .authSessionCreatedAt(identity.authSessionCreatedAt())
            .activeWorkspaceId(workspace.getId())
            .tokenHash(SessionTokens.hash(rawToken))
            .exchangeTokenHash(jwtFingerprint)
            .status(SessionStatus.ACTIVE)
            .expiresAt(now.plus(properties.sessionTtl()))
            .lastSeenAt(now)
            .build());
    return context(user, workspace, membership);
  }

  /**
   * Xác thực mỗi request bằng hash token và trạng thái user/workspace/membership. Ghi last_seen_at
   * nhưng không gia hạn expires_at; role trả về chỉ thuộc active workspace của session này.
   */
  @Transactional
  public VeyPrincipal authenticate(String rawToken) {
    Session session =
        sessions
            .findByTokenHash(SessionTokens.hash(rawToken))
            .orElseThrow(() -> new BadCredentialsException("Invalid session"));
    Instant now = Instant.now();
    if (session.getStatus() != SessionStatus.ACTIVE
        || session.getRevokedAt() != null
        || !session.getExpiresAt().isAfter(now)) {
      throw new BadCredentialsException("Invalid session");
    }
    User user =
        users
            .findById(session.getUserId())
            .orElseThrow(() -> new BadCredentialsException("Invalid user"));
    if (user.getStatus() != UserStatus.ACTIVE || user.getDeletedAt() != null) {
      throw new BadCredentialsException("Invalid user");
    }
    if (session.getActiveWorkspaceId() == null) {
      throw new AccessDeniedException("No active workspace");
    }
    Workspace workspace =
        workspaces
            .findById(session.getActiveWorkspaceId())
            .orElseThrow(() -> new AccessDeniedException("No active workspace"));
    WorkspaceMembership membership =
        memberships
            .findByWorkspaceIdAndUserId(workspace.getId(), user.getId())
            .orElseThrow(() -> new AccessDeniedException("No active membership"));
    if (workspace.getStatus() != WorkspaceStatus.ACTIVE
        || membership.getStatus() != MembershipStatus.ACTIVE) {
      throw new AccessDeniedException("No active membership");
    }
    jdbc.update(
        "update iam.sessions set last_seen_at = ? where id = ?",
        java.sql.Timestamp.from(now),
        session.getId());
    return new VeyPrincipal(
        session.getId(),
        user.getId(),
        workspace.getId(),
        membership.getId(),
        membership.getRole().name());
  }

  /** Filter đã xác thực session và ghi heartbeat; API /me chỉ đọc lại context an toàn để trả về. */
  @Transactional(readOnly = true)
  public VeyContext me(VeyPrincipal principal) {
    return context(
        users.findById(principal.userId()).orElseThrow(),
        workspaces.findById(principal.activeWorkspaceId()).orElseThrow(),
        memberships.findById(principal.membershipId()).orElseThrow());
  }

  /**
   * Thu hồi các Vey session cùng identity sid và lưu tombstone để chặn exchange lại bằng passport
   * cũ. Không có token/không tìm thấy session vẫn cho phép controller xóa cookie.
   */
  @Transactional
  public void logout(String rawToken) {
    if (rawToken == null) {
      return;
    }
    var session = sessions.findByTokenHash(SessionTokens.hash(rawToken));
    if (session.isPresent() && session.get().getAuthSessionId() != null) {
      var user = users.findById(session.get().getUserId()).orElseThrow();
      revokeIdentity(
          UUID.randomUUID(),
          user.getAuthUserId(),
          session.get().getAuthSessionId(),
          Instant.now(),
          "SESSION_REVOKED");
    }
    // Với session có identity binding, revokeIdentity đã ghi SESSION_REVOKED; LOGOUT là fallback.
    jdbc.update(
        """
        update iam.sessions set status = 'REVOKED', revoked_at = now(), revoked_reason = 'LOGOUT', updated_at = now()
        where token_hash = ? and revoked_at is null
        """,
        SessionTokens.hash(rawToken));
  }

  /**
   * Lưu event thu hồi rồi cập nhật các session liên quan trong cùng transaction. sid xác định một
   * identity session; sid=null thu hồi theo auth_session_created_at <= cutoff khi reset mật khẩu.
   */
  @Transactional
  public void revokeIdentity(
      UUID eventId, String authUserId, String authSessionId, Instant occurredAt, String reason) {
    lockIdentity(authUserId);
    int inserted =
        jdbc.update(
            """
        insert into iam.auth_revocations (id, auth_user_id, auth_session_id, occurred_at, reason)
        values (?, ?, ?, ?, ?) on conflict (id) do nothing
        """,
            eventId,
            authUserId,
            authSessionId,
            java.sql.Timestamp.from(occurredAt),
            reason);
    if (inserted == 0) {
      // Retry cùng event ID không cần cập nhật lại session; event trước đó đã commit nguyên tử.
      return;
    }
    String update =
        """
        update iam.sessions s set status = 'REVOKED', revoked_at = now(),
          revoked_reason = ?, updated_at = now()
        from iam.users u where s.user_id = u.id and u.auth_user_id = ? and s.revoked_at is null
        """;
    if (authSessionId != null) {
      jdbc.update(update + " and s.auth_session_id = ?", reason, authUserId, authSessionId);
    } else {
      jdbc.update(
          update + " and s.auth_session_created_at <= ?",
          reason,
          authUserId,
          java.sql.Timestamp.from(occurredAt));
    }
  }

  private void lockIdentity(String authUserId) {
    // Xếp thứ tự exchange/revoke kể cả khi user IAM chưa tồn tại; PostgreSQL nhả khóa khi hết
    // transaction.
    jdbc.queryForList("select pg_advisory_xact_lock(hashtextextended(?, 0))", authUserId);
  }

  /** Chỉ xuất profile/context cần cho UI; không lộ token, hash hoặc ID nội bộ của Better Auth. */
  private VeyContext context(User user, Workspace workspace, WorkspaceMembership membership) {
    return new VeyContext(
        new VeyContext.UserView(
            user.getId(), user.getPrimaryEmail(), user.getDisplayName(), user.getAvatarUrl()),
        new VeyContext.WorkspaceView(
            workspace.getId(), workspace.getName(), workspace.getType().name()),
        new VeyContext.MembershipView(membership.getRole().name()));
  }
}
