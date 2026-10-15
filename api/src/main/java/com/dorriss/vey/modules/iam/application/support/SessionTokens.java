package com.dorriss.vey.modules.iam.application.support;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Sinh secret cho cookie và fingerprint lưu database; không đưa token gốc vào log hoặc response
 * body.
 */
public final class SessionTokens {
  private static final SecureRandom RANDOM = new SecureRandom();

  private SessionTokens() {}

  /** 32 byte ngẫu nhiên, mã hóa base64url để dùng làm opaque token trong cookie. */
  public static String generate() {
    byte[] bytes = new byte[32];
    RANDOM.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  /** SHA-256 cho token cookie và issuer|jti; cùng passport ID luôn có cùng fingerprint. */
  public static String hash(String value) {
    try {
      return HexFormat.of()
          .formatHex(
              MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
    } catch (NoSuchAlgorithmException ex) {
      throw new IllegalStateException("SHA-256 unavailable", ex);
    }
  }
}
