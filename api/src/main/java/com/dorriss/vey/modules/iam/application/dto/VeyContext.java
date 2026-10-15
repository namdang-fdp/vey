package com.dorriss.vey.modules.iam.application.dto;

import java.util.UUID;

/**
 * Snapshot trả cho UI; tách DTO khỏi entity để không lộ credential, token/hash và metadata nội bộ.
 */
public record VeyContext(UserView user, WorkspaceView activeWorkspace, MembershipView membership) {
  public record UserView(UUID id, String email, String displayName, String avatarUrl) {}

  public record WorkspaceView(UUID id, String name, String type) {}

  public record MembershipView(String role) {}
}
