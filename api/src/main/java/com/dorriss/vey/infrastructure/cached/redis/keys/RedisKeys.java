package com.dorriss.vey.infrastructure.cached.redis.keys;

public final class RedisKeys {
  private RedisKeys() {}

  public static String vey(String suffix) {
    if (suffix == null || suffix.isBlank()) {
      throw new IllegalArgumentException("Redis key suffix must not be blank");
    }
    return "vey:" + suffix;
  }
}
