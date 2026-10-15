package com.dorriss.vey.modules.iam.domain.entity;

import com.dorriss.vey.infrastructure.persistence.BaseEntity;
import com.dorriss.vey.modules.iam.domain.enums.MembershipRole;
import com.dorriss.vey.modules.iam.domain.enums.MembershipStatus;
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

/** Quan hệ user-workspace; role/status được kiểm lại ở mỗi request trong active workspace. */
@Entity
@Table(schema = "iam", name = "workspace_memberships")
@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WorkspaceMembership extends BaseEntity {
  @Column(name = "workspace_id", nullable = false)
  private UUID workspaceId;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Enumerated(EnumType.STRING)
  @Column(name = "role", length = 16, nullable = false)
  private MembershipRole role;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", length = 16, nullable = false)
  private MembershipStatus status;

  @Column(name = "joined_at", nullable = false)
  private Instant joinedAt;
}
