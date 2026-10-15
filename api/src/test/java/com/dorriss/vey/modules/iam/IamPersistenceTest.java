package com.dorriss.vey.modules.iam;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.dorriss.vey.infrastructure.persistence.BaseEntity;
import com.dorriss.vey.modules.iam.domain.MembershipRole;
import com.dorriss.vey.modules.iam.domain.MembershipStatus;
import com.dorriss.vey.modules.iam.domain.Session;
import com.dorriss.vey.modules.iam.domain.SessionStatus;
import com.dorriss.vey.modules.iam.domain.User;
import com.dorriss.vey.modules.iam.domain.UserStatus;
import com.dorriss.vey.modules.iam.domain.Workspace;
import com.dorriss.vey.modules.iam.domain.WorkspaceMembership;
import com.dorriss.vey.modules.iam.domain.WorkspaceStatus;
import com.dorriss.vey.modules.iam.domain.WorkspaceType;
import com.dorriss.vey.modules.iam.persistence.SessionRepository;
import com.dorriss.vey.modules.iam.persistence.UserRepository;
import com.dorriss.vey.modules.iam.persistence.WorkspaceMembershipRepository;
import com.dorriss.vey.modules.iam.persistence.WorkspaceRepository;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
@DataJpaTest(properties = "spring.jpa.hibernate.ddl-auto=validate")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class IamPersistenceTest {
  private static final Instant TIME = Instant.parse("2026-01-01T00:00:00Z");
  @Container static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

  @DynamicPropertySource
  static void postgresProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", postgres::getJdbcUrl);
    registry.add("spring.datasource.username", postgres::getUsername);
    registry.add("spring.datasource.password", postgres::getPassword);
  }

  @Autowired private UserRepository users;
  @Autowired private WorkspaceRepository workspaces;
  @Autowired private WorkspaceMembershipRepository memberships;
  @Autowired private SessionRepository sessions;
  @Autowired private EntityManager entityManager;
  @Autowired private JdbcTemplate jdbc;

  @Test
  void freshMigrationCreatesIamTablesWithoutSampleRows() {
    assertThat(
            jdbc.queryForList(
                "select tablename from pg_tables where schemaname = 'iam'", String.class))
        .containsExactlyInAnyOrder(
            "users", "workspaces", "workspace_memberships", "sessions", "auth_revocations");
    assertThat(
            jdbc.queryForObject(
                "select count(*) from public.flyway_schema_history where version = '1' and success",
                Integer.class))
        .isEqualTo(1);
    assertThat(users.count()).isZero();
    assertThat(workspaces.count()).isZero();
    assertThat(memberships.count()).isZero();
    assertThat(sessions.count()).isZero();
  }

  @Test
  void allRepositoriesRoundTripCompleteStateAndInheritedUuidV7Metadata() {
    var user =
        users.saveAndFlush(
            User.builder()
                .authUserId("user_mapping")
                .primaryEmail("mapping@vey.example")
                .emailVerified(true)
                .firstName("Alex")
                .lastName("Nguyen")
                .displayName("Alex Nguyen")
                .avatarUrl("https://vey.example/avatar.png")
                .locale("en")
                .timezone("Asia/Ho_Chi_Minh")
                .status(UserStatus.DISABLED)
                .lastSeenAt(TIME)
                .deletedAt(TIME)
                .build());
    var workspace =
        workspaces.saveAndFlush(
            Workspace.builder()
                .type(WorkspaceType.TEAM)
                .name("Mapping Team")
                .slug("mapping-team")
                .createdByUserId(user.getId())
                .status(WorkspaceStatus.ARCHIVED)
                .build());
    var membership =
        memberships.saveAndFlush(
            WorkspaceMembership.builder()
                .workspaceId(workspace.getId())
                .userId(user.getId())
                .role(MembershipRole.ADMIN)
                .status(MembershipStatus.SUSPENDED)
                .joinedAt(TIME)
                .build());
    var session =
        sessions.saveAndFlush(
            Session.builder()
                .userId(user.getId())
                .tokenHash("a".repeat(64))
                .activeWorkspaceId(workspace.getId())
                .status(SessionStatus.REVOKED)
                .expiresAt(TIME.plusSeconds(3600))
                .lastSeenAt(TIME)
                .revokedAt(TIME)
                .revokedReason("TEST")
                .build());
    entityManager.clear();

    assertThat(users.findByAuthUserId("user_mapping").orElseThrow())
        .usingRecursiveComparison()
        .isEqualTo(user);
    assertThat(workspaces.findById(workspace.getId()).orElseThrow())
        .usingRecursiveComparison()
        .isEqualTo(workspace);
    assertThat(
            memberships.findByWorkspaceIdAndUserId(workspace.getId(), user.getId()).orElseThrow())
        .usingRecursiveComparison()
        .isEqualTo(membership);
    assertThat(memberships.findByUserId(user.getId())).containsExactly(membership);
    assertThat(sessions.findByTokenHash("a".repeat(64)).orElseThrow())
        .usingRecursiveComparison()
        .isEqualTo(session);
    for (BaseEntity entity : List.of(user, workspace, membership, session)) {
      assertThat(entity.getId().version()).isEqualTo(7);
      assertThat(entity.getCreatedAt()).isNotNull();
      assertThat(entity.getUpdatedAt()).isNotNull();
    }
    assertThat(jdbc.queryForObject("select status from iam.users", String.class))
        .isEqualTo("DISABLED");
    assertThat(jdbc.queryForObject("select type from iam.workspaces", String.class))
        .isEqualTo("TEAM");
    assertThat(jdbc.queryForObject("select status from iam.workspaces", String.class))
        .isEqualTo("ARCHIVED");
    assertThat(jdbc.queryForObject("select role from iam.workspace_memberships", String.class))
        .isEqualTo("ADMIN");
    assertThat(jdbc.queryForObject("select status from iam.workspace_memberships", String.class))
        .isEqualTo("SUSPENDED");
    assertThat(jdbc.queryForObject("select status from iam.sessions", String.class))
        .isEqualTo("REVOKED");
  }

  @Test
  void allowsMultiplePersonalWorkspacesForOneCreator() {
    var user = user("personal");
    workspace(user.getId(), "personal-one", WorkspaceType.PERSONAL);
    workspace(user.getId(), "personal-two", WorkspaceType.PERSONAL);
    assertThat(workspaces.count()).isEqualTo(2);
  }

  @ParameterizedTest
  @CsvSource({
    "users,auth_user_id,uq_users_auth_user_id",
    "workspaces,slug,uq_workspaces_slug",
    "workspace_memberships,workspace_id,uq_memberships_workspace_user",
    "sessions,token_hash,uq_sessions_token_hash"
  })
  void databaseEnforcesUniqueKeys(String table, String column, String constraint) {
    var user = user("unique");
    var first = workspace(user.getId(), "first", WorkspaceType.TEAM);
    var second = workspace(user.getId(), "second", WorkspaceType.TEAM);
    membership(user.getId(), first.getId());
    membership(user.getId(), second.getId());
    user("another");
    session(user.getId(), "a");
    session(user.getId(), "b");
    assertThatThrownBy(
            () ->
                jdbc.update(
                    "update iam."
                        + table
                        + " set "
                        + column
                        + " = (select "
                        + column
                        + " from iam."
                        + table
                        + " order by id limit 1)"))
        .isInstanceOf(DataIntegrityViolationException.class)
        .hasStackTraceContaining(constraint);
  }

  @ParameterizedTest
  @CsvSource({
    "workspaces,created_by_user_id,fk_workspaces_creator",
    "workspace_memberships,user_id,fk_memberships_user",
    "workspace_memberships,workspace_id,fk_memberships_workspace",
    "sessions,user_id,fk_sessions_user",
    "sessions,active_workspace_id,fk_sessions_workspace"
  })
  void databaseRejectsEveryDanglingForeignKey(String table, String column, String constraint) {
    fixture();
    assertThatThrownBy(
            () ->
                jdbc.update(
                    "update iam."
                        + table
                        + " set "
                        + column
                        + " = '00000000-0000-0000-0000-000000000000'"))
        .isInstanceOf(DataIntegrityViolationException.class)
        .hasStackTraceContaining(constraint);
  }

  @ParameterizedTest
  @CsvSource({
    "users,status,ck_users_status",
    "workspaces,type,ck_workspaces_type",
    "workspaces,status,ck_workspaces_status",
    "workspace_memberships,role,ck_memberships_role",
    "workspace_memberships,status,ck_memberships_status",
    "sessions,status,ck_sessions_status",
    "sessions,token_hash,ck_sessions_token_hash"
  })
  void databaseRejectsUnknownEnumsAndMalformedHash(String table, String column, String constraint) {
    fixture();
    assertThatThrownBy(() -> jdbc.update("update iam." + table + " set " + column + " = 'INVALID'"))
        .isInstanceOf(DataIntegrityViolationException.class)
        .hasStackTraceContaining(constraint);
  }

  @ParameterizedTest
  @CsvSource({"users", "workspaces"})
  void referencedIdentityAndWorkspaceCannotBeDeleted(String table) {
    fixture();
    assertThatThrownBy(() -> jdbc.update("delete from iam." + table))
        .isInstanceOf(DataIntegrityViolationException.class)
        .hasStackTraceContaining("foreign key constraint");
  }

  private void fixture() {
    var user = user("fixture");
    var workspace = workspace(user.getId(), "fixture", WorkspaceType.TEAM);
    membership(user.getId(), workspace.getId());
    session(user.getId(), "a");
    jdbc.update("update iam.sessions set active_workspace_id = ?", workspace.getId());
  }

  private User user(String key) {
    return users.saveAndFlush(
        User.builder()
            .authUserId("user_" + key)
            .primaryEmail(key + "@vey.example")
            .status(UserStatus.ACTIVE)
            .build());
  }

  private Workspace workspace(UUID creator, String slug, WorkspaceType type) {
    return workspaces.saveAndFlush(
        Workspace.builder()
            .createdByUserId(creator)
            .slug(slug)
            .name(slug)
            .type(type)
            .status(WorkspaceStatus.ACTIVE)
            .build());
  }

  private void membership(UUID user, UUID workspace) {
    memberships.saveAndFlush(
        WorkspaceMembership.builder()
            .userId(user)
            .workspaceId(workspace)
            .role(MembershipRole.MEMBER)
            .status(MembershipStatus.ACTIVE)
            .joinedAt(TIME)
            .build());
  }

  private Session session(UUID user, String hashCharacter) {
    return sessions.saveAndFlush(
        Session.builder()
            .userId(user)
            .tokenHash(hashCharacter.repeat(64))
            .status(SessionStatus.EXPIRED)
            .expiresAt(TIME)
            .build());
  }
}
