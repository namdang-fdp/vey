package com.dorriss.vey.modules.iam.persistence;

import com.dorriss.vey.modules.iam.domain.entity.User;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, UUID> {
  Optional<User> findByAuthUserId(String authUserId);
}
