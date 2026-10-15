package com.dorriss.vey.modules.iam.security;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Kiểm claim sau khi decoder đã xác minh chữ ký. Hai loại passport dùng cùng JWKS nhưng có mục đích
 * riêng: identity tạo Vey session; revocation thông báo thu hồi từ server Better Auth.
 */
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
final class IdentityJwtContract implements OAuth2TokenValidator<Jwt> {
  String audience;

  IdentityJwtContract(String audience) {
    this.audience = audience;
  }

  /** Giới hạn lifetime và kiểm kiểu claim trước khi controller sử dụng các giá trị từ JWT. */
  @Override
  public OAuth2TokenValidatorResult validate(Jwt jwt) {
    boolean valid =
        jwt.getAudience() != null
            && jwt.getAudience().contains(audience)
            && jwt.getExpiresAt() != null
            && jwt.getIssuedAt() != null
            && jwt.getExpiresAt().isAfter(jwt.getIssuedAt())
            && !jwt.getIssuedAt().isAfter(Instant.now().plusSeconds(60))
            && text(jwt.getSubject(), 255)
            && text(jwt.getHeaders().get("kid"), 255);
    if (valid && "identity".equals(jwt.getClaim("token_use"))) {
      valid =
          uuid(jwt.getClaim("jti"))
              && text(jwt.getClaim("email"), 320)
              && jwt.getClaim("emailVerified") instanceof Boolean
              && optionalText(jwt.getClaim("name"), 255)
              && (jwt.getClaim("image") == null || jwt.getClaim("image") instanceof String)
              && text(jwt.getClaim("sid"), 255)
              && timestamp(jwt.getClaim("auth_session_created_at"))
              && Duration.between(jwt.getIssuedAt(), jwt.getExpiresAt())
                      .compareTo(Duration.ofMinutes(16))
                  <= 0;
    } else if (valid && "revocation".equals(jwt.getClaim("token_use"))) {
      // Revoke một phiên cần sid; reset mật khẩu dùng cutoff toàn identity nên sid phải null.
      valid =
          uuid(jwt.getClaim("jti"))
              && timestamp(jwt.getClaim("occurred_at"))
              && Duration.between(jwt.getIssuedAt(), jwt.getExpiresAt())
                      .compareTo(Duration.ofMinutes(2))
                  <= 0
              && (("SESSION_REVOKED".equals(jwt.getClaim("reason"))
                      && text(jwt.getClaim("sid"), 255))
                  || ("PASSWORD_RESET".equals(jwt.getClaim("reason"))
                      && jwt.getClaim("sid") == null));
    } else {
      valid = false;
    }
    return valid
        ? OAuth2TokenValidatorResult.success()
        : OAuth2TokenValidatorResult.failure(
            new OAuth2Error("invalid_token", "Invalid identity contract", null));
  }

  private static boolean text(Object value, int length) {
    return value instanceof String text && !text.isBlank() && text.length() <= length;
  }

  private static boolean optionalText(Object value, int length) {
    // Profile tùy chọn được phép null/rỗng, khác với các claim định danh bắt buộc ở text().
    return value == null || value instanceof String text && text.length() <= length;
  }

  private static boolean timestamp(Object value) {
    // Contract dùng epoch milliseconds nguyên dương, cho phép lệch đồng hồ về tương lai tối đa 60s.
    return value instanceof Number number
        && number.longValue() > 0
        && number.doubleValue() == number.longValue()
        && number.longValue() <= System.currentTimeMillis() + 60000;
  }

  private static boolean uuid(Object value) {
    // jti là ID passport/event; service dùng ID này để chống replay hoặc xử lý event trùng.
    if (!(value instanceof String text) || text.length() != 36) {
      return false;
    }
    try {
      UUID.fromString(text);
      return true;
    } catch (IllegalArgumentException ex) {
      return false;
    }
  }
}
