package com.dorriss.vey.modules.iam.domain.entity;

import com.dorriss.vey.infrastructure.persistence.BaseEntity;
import com.dorriss.vey.modules.iam.domain.enums.UserStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/** User nghiệp vụ của Vey; authUserId ánh xạ identity, credential do Better Auth quản lý. */
@Entity
@Table(schema = "iam", name = "users")
@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {
  @Column(name = "auth_user_id", length = 255, nullable = false)
  private String authUserId;

  @Column(name = "primary_email", length = 320, nullable = false)
  private String primaryEmail;

  @Column(name = "email_verified", nullable = false)
  private boolean emailVerified;

  @Column(name = "first_name", length = 255)
  private String firstName;

  @Column(name = "last_name", length = 255)
  private String lastName;

  @Column(name = "display_name", length = 255)
  private String displayName;

  @Column(name = "avatar_url", columnDefinition = "text")
  private String avatarUrl;

  @Column(name = "locale", length = 64)
  private String locale;

  @Column(name = "timezone", length = 64)
  private String timezone;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", length = 16, nullable = false)
  private UserStatus status;

  @Column(name = "last_seen_at")
  private Instant lastSeenAt;

  @Column(name = "deleted_at")
  private Instant deletedAt;

  /** Chỉ đồng bộ profile từ identity; locale/timezone và trạng thái truy cập do Vey quản lý. */
  public void updateIdentity(
      String email, boolean verified, String name, String image, Instant now) {
    primaryEmail = email;
    emailVerified = verified;
    displayName = name;
    avatarUrl = image;
    lastSeenAt = now;
  }
}
