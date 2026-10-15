package com.dorriss.vey.modules.iam.api;

import com.dorriss.vey.common.response.ApiResponse;
import com.dorriss.vey.common.security.VeyPrincipal;
import com.dorriss.vey.modules.iam.application.dto.AuthenticatedIdentity;
import com.dorriss.vey.modules.iam.application.dto.VeyContext;
import com.dorriss.vey.modules.iam.application.service.IamSessionService;
import com.dorriss.vey.modules.iam.application.support.SessionTokens;
import com.dorriss.vey.modules.iam.security.AuthProperties;
import com.dorriss.vey.modules.iam.security.SessionCookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** HTTP boundary của IAM; service giữ transaction database, controller quản lý cookie/response. */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthController {
  IamSessionService sessions;
  AuthProperties properties;

  /** JWT đã được chain identity kiểm tra; chỉ phát cookie sau khi exchange commit thành công. */
  @PostMapping("/session")
  public ResponseEntity<ApiResponse<VeyContext>> exchange(@AuthenticationPrincipal Jwt jwt) {
    // Diagnostics include public protocol metadata only, never identity values or credentials.
    log.debug(
        "Verified exchange JWT: alg={}, kidPresent={}, issuer={}, audience={}, ttlSeconds={}, claimNames={}",
        jwt.getHeaders().get("alg"),
        jwt.getHeaders().containsKey("kid"),
        jwt.getIssuer(),
        jwt.getAudience(),
        java.time.Duration.between(jwt.getIssuedAt(), jwt.getExpiresAt()).toSeconds(),
        jwt.getClaims().keySet());
    var identity =
        new AuthenticatedIdentity(
            jwt.getSubject(),
            jwt.getClaimAsString("email"),
            Boolean.TRUE.equals(jwt.getClaimAsBoolean("emailVerified")),
            jwt.getClaimAsString("name"),
            jwt.getClaimAsString("image"),
            jwt.getClaimAsString("sid"),
            java.time.Instant.ofEpochMilli(
                ((Number) jwt.getClaim("auth_session_created_at")).longValue()));
    String token = SessionTokens.generate();
    // Consume the immutable passport ID, not malleable compact-JWS signature encodings.
    var context =
        sessions.exchange(identity, SessionTokens.hash(jwt.getIssuer() + "|" + jwt.getId()), token);
    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, SessionCookie.create(token, properties, false).toString())
        .body(ApiResponse.<VeyContext>builder().result(context).build());
  }

  /** Principal do VeySessionFilter tạo sau khi kiểm session và membership trong database. */
  @GetMapping("/me")
  public ApiResponse<VeyContext> me(@AuthenticationPrincipal VeyPrincipal principal) {
    return ApiResponse.<VeyContext>builder().result(sessions.me(principal)).build();
  }

  /** Thông báo server-to-server từ Better Auth; JWT jti là event ID để nhận retry an toàn. */
  @PostMapping("/identity/revoke")
  public ResponseEntity<Void> revokeIdentity(@AuthenticationPrincipal Jwt jwt) {
    sessions.revokeIdentity(
        java.util.UUID.fromString(jwt.getId()),
        jwt.getSubject(),
        jwt.getClaimAsString("sid"),
        java.time.Instant.ofEpochMilli(((Number) jwt.getClaim("occurred_at")).longValue()),
        jwt.getClaimAsString("reason"));
    return ResponseEntity.noContent().build();
  }

  /** Thu hồi ở IAM trước rồi xóa cookie; frontend tiếp tục sign-out phiên Better Auth. */
  @PostMapping("/session/logout")
  public ResponseEntity<Void> logout(HttpServletRequest request) {
    sessions.logout(SessionCookie.read(request));
    return ResponseEntity.noContent()
        .header(HttpHeaders.SET_COOKIE, SessionCookie.create("", properties, true).toString())
        .build();
  }
}
