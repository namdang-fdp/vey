package com.dorriss.vey.modules.iam;

import static org.assertj.core.api.Assertions.assertThat;

import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
@DataJpaTest(properties = "spring.jpa.hibernate.ddl-auto=validate")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("local")
class IamLocalSeedTest {
  @Container static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

  @DynamicPropertySource
  static void postgresProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", postgres::getJdbcUrl);
    registry.add("spring.datasource.username", postgres::getUsername);
    registry.add("spring.datasource.password", postgres::getPassword);
  }

  @Autowired private JdbcTemplate jdbc;
  @Autowired private DataSource dataSource;
  @Autowired private Flyway flyway;

  @Test
  void localProfileSeedsOnlySyntheticDataAndScriptIsIdempotent() {
    assertThat(flyway.getConfiguration().getLocations())
        .extracting(Object::toString)
        .containsExactly("classpath:db/migration", "classpath:db/seed");
    assertThat(
            jdbc.queryForObject(
                "select count(*) from public.flyway_schema_history where success", Integer.class))
        .isEqualTo(3);
    assertSeed();
    var script =
        new ResourceDatabasePopulator(new ClassPathResource("db/seed/R__iam_sample_data.sql"));
    script.execute(dataSource);
    script.execute(dataSource);
    assertSeed();
  }

  private void assertSeed() {
    assertThat(jdbc.queryForList("select auth_user_id from iam.users", String.class))
        .containsExactlyInAnyOrder("user_vey_local_owner", "user_vey_local_member");
    assertThat(jdbc.queryForList("select slug from iam.workspaces", String.class))
        .containsExactlyInAnyOrder("vey-local-personal", "vey-local-team");
    assertThat(
            jdbc.queryForList(
                "select w.slug || ':' || u.auth_user_id || ':' || m.role "
                    + "from iam.workspace_memberships m join iam.users u on u.id = m.user_id "
                    + "join iam.workspaces w on w.id = m.workspace_id",
                String.class))
        .containsExactlyInAnyOrder(
            "vey-local-personal:user_vey_local_owner:OWNER",
            "vey-local-team:user_vey_local_owner:OWNER",
            "vey-local-team:user_vey_local_member:MEMBER");
    assertThat(jdbc.queryForObject("select count(*) from iam.sessions", Integer.class))
        .isEqualTo(1);
    assertThat(
            jdbc.queryForObject(
                "select status || ':' || revoked_reason from iam.sessions", String.class))
        .isEqualTo("REVOKED:LOCAL_SEED");
    assertThat(jdbc.queryForObject("select token_hash from iam.sessions", String.class))
        .isEqualTo("0".repeat(64));
  }
}
