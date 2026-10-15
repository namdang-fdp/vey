package com.dorriss.vey.modules.iam.persistence;

import com.dorriss.vey.modules.iam.domain.entity.WorkspaceMembership;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkspaceMembershipRepository extends JpaRepository<WorkspaceMembership, UUID> {
  Optional<WorkspaceMembership> findByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);

  List<WorkspaceMembership> findByUserId(UUID userId);
}
