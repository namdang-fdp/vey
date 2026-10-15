package com.dorriss.vey.modules.iam.domain.entity;

import com.dorriss.vey.infrastructure.persistence.BaseEntity;
import com.dorriss.vey.modules.iam.domain.enums.WorkspaceStatus;
import com.dorriss.vey.modules.iam.domain.enums.WorkspaceType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/** Không gian làm việc; quyền truy cập nằm trong WorkspaceMembership, không nằm ở người tạo. */
@Entity
@Table(schema = "iam", name = "workspaces")
@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Workspace extends BaseEntity {
  @Enumerated(EnumType.STRING)
  @Column(name = "type", length = 16, nullable = false)
  private WorkspaceType type;

  @Column(name = "name", length = 255, nullable = false)
  private String name;

  @Column(name = "slug", length = 255, nullable = false)
  private String slug;

  @Column(name = "created_by_user_id", nullable = false)
  private UUID createdByUserId;

  @Column(name = "initial_for_user_id")
  // Unique nullable: chỉ đánh dấu workspace PERSONAL khởi tạo, không giới hạn các workspace khác.
  private UUID initialForUserId;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", length = 16, nullable = false)
  private WorkspaceStatus status;
}
