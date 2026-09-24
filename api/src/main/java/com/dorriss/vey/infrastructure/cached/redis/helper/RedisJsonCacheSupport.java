package com.dorriss.vey.infrastructure.cached.redis.helper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;

@Slf4j
@RequiredArgsConstructor
public abstract class RedisJsonCacheSupport {
  protected final StringRedisTemplate redis;
  protected final ObjectMapper objectMapper;

  protected Optional<String> readRawValue(String key) {
    try {
      return Optional.ofNullable(redis.opsForValue().get(key)).filter(value -> !value.isBlank());
    } catch (DataAccessException e) {
      log.warn("Redis read failed for key={}", key, e);
      return Optional.empty();
    }
  }

  protected boolean writeValue(String key, String json, Duration ttl) {
    if (ttl == null || ttl.isZero() || ttl.isNegative()) {
      return false;
    }
    try {
      redis.opsForValue().set(key, json, ttl);
      return true;
    } catch (DataAccessException e) {
      log.warn("Redis write failed for key={}", key, e);
      return false;
    }
  }

  protected boolean deleteKey(String key) {
    try {
      return Boolean.TRUE.equals(redis.delete(key));
    } catch (DataAccessException e) {
      log.warn("Redis delete failed for key={}", key, e);
      return false;
    }
  }

  protected <T> Optional<T> deserialize(String json, Class<T> type) {
    try {
      return Optional.of(objectMapper.readValue(json, type));
    } catch (JsonProcessingException e) {
      log.warn("Redis JSON decode failed", e);
      return Optional.empty();
    }
  }

  protected <T> Optional<T> deserialize(String json, TypeReference<T> type) {
    try {
      return Optional.of(objectMapper.readValue(json, type));
    } catch (JsonProcessingException e) {
      log.warn("Redis JSON decode failed", e);
      return Optional.empty();
    }
  }

  protected Optional<String> serialize(Object value) {
    try {
      return Optional.of(objectMapper.writeValueAsString(value));
    } catch (JsonProcessingException e) {
      log.warn("Redis JSON encode failed", e);
      return Optional.empty();
    }
  }

  protected long scanAndDelete(String pattern) {
    long deleted = 0;
    Set<String> batch = new HashSet<>();
    try (Cursor<String> cursor =
        redis.scan(ScanOptions.scanOptions().match(pattern).count(1000).build())) {
      while (cursor.hasNext()) {
        batch.add(cursor.next());
        if (batch.size() == 1000) {
          deleted += redis.delete(batch);
          batch.clear();
        }
      }
      if (!batch.isEmpty()) {
        deleted += redis.delete(batch);
      }
    } catch (DataAccessException e) {
      log.warn("Redis scan failed for pattern={}", pattern, e);
    }
    return deleted;
  }
}
