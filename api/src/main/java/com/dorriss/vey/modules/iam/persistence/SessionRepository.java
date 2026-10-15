package com.dorriss.vey.modules.iam.persistence;

import com.dorriss.vey.modules.iam.domain.entity.Session;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionRepository extends JpaRepository<Session, UUID> {
  Optional<Session> findByTokenHash(String tokenHash);
}
