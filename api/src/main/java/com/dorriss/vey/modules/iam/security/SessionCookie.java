package com.dorriss.vey.modules.iam.security;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import org.springframework.http.ResponseCookie;

/** Cookie mang token opaque; database chỉ lưu hash của token này. */
public final class SessionCookie {
  public static final String NAME = "vey_session";

  private SessionCookie() {}

  /** Chỉ lấy token từ request; xác thực và kiểm quyền thuộc IamSessionService. */
  public static String read(HttpServletRequest request) {
    if (request.getCookies() != null) {
      for (var cookie : request.getCookies()) {
        if (NAME.equals(cookie.getName())) {
          return cookie.getValue();
        }
      }
    }
    return null;
  }

  /**
   * Tạo giá trị Set-Cookie để controller ghi vào response. clear=true đặt Max-Age=0 để xóa cookie;
   * việc này không tự thu hồi session trong database.
   */
  public static ResponseCookie create(String value, AuthProperties properties, boolean clear) {
    return ResponseCookie.from(NAME, value)
        .httpOnly(true)
        .secure(properties.cookieSecure())
        .sameSite("Lax")
        .path("/")
        .maxAge(clear ? Duration.ZERO : properties.sessionTtl())
        .build();
  }
}
