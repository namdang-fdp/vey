package com.dorriss.vey.modules.iam.security;

import com.dorriss.vey.modules.iam.application.service.IamSessionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/** Đổi cookie Vey đã xác thực thành principal và authorities trong SecurityContext của request. */
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VeySessionFilter extends OncePerRequestFilter {
  IamSessionService sessions;
  String allowedOrigin;

  public VeySessionFilter(IamSessionService sessions, String allowedOrigin) {
    this.sessions = sessions;
    this.allowedOrigin = allowedOrigin;
  }

  /** Bỏ qua custom filter ở các request này; luật truy cập của SecurityFilterChain vẫn áp dụng. */
  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return !request.getRequestURI().startsWith("/api/")
        || request.getRequestURI().equals("/api/v1/health")
        || request.getMethod().equals("OPTIONS");
  }

  /** Đọc session/membership từ database mỗi request, không khôi phục HTTP session của Spring. */
  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    // Cookie gửi tự động: mutation phải đến từ đúng frontend, kể cả endpoint logout public.
    if (isStateChanging(request.getMethod())
        && !allowedOrigin.equals(request.getHeader("Origin"))) {
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    // Session hết hạn/revoke vẫn phải xóa được cookie; controller tự xử lý logout idempotent.
    if (request.getRequestURI().equals("/api/v1/auth/session/logout")) {
      chain.doFilter(request, response);
      return;
    }

    String token = SessionCookie.read(request);
    if (token != null) {
      try {
        var principal = sessions.authenticate(token);
        // Chỉ cấp role của active workspace, không hợp nhất role từ các workspace khác.
        var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + principal.membershipRole()));
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(
            UsernamePasswordAuthenticationToken.authenticated(principal, null, authorities));
        SecurityContextHolder.setContext(context);
      } catch (AuthenticationException ex) {
        response.sendError(401);
        return;
      } catch (AccessDeniedException ex) {
        response.sendError(403);
        return;
      }
    }
    // Không có cookie thì để rule authenticated() quyết định; filter không tự mở quyền truy cập.
    chain.doFilter(request, response);
  }

  /** Các API mutation dùng Origin làm điều kiện bảo vệ bổ sung cho cookie authentication. */
  private boolean isStateChanging(String method) {
    return switch (method) {
      case "POST", "PUT", "PATCH", "DELETE" -> true;
      default -> false;
    };
  }
}
