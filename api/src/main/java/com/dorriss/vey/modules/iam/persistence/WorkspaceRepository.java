package com.dorriss.vey.modules.iam.persistence;

import com.dorriss.vey.modules.iam.domain.entity.Workspace;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkspaceRepository extends JpaRepository<Workspace, UUID> {
  Optional<Workspace> findByInitialForUserId(UUID userId);
}
