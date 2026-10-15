package com.dorriss.vey.modules.iam;

import static org.assertj.core.api.Assertions.assertThat;

import com.dorriss.vey.modules.iam.application.SessionTokens;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.ECDSASigner;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.jwk.Curve;
import com.nimbusds.jose.jwk.ECKey;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.gen.ECKeyGenerator;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.concurrent.Executors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {"org.jobrunr.background-job-server.enabled=false", "vey.api-docs.enabled=true"})
class AuthBridgeTest {
  @Container static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");
  private static final String ISSUER = "https://identity.vey.test";
  private static final ECKey KEY;
  private static final HttpServer JWKS;

  static {
    try {
      KEY = new ECKeyGenerator(Curve.P_256).keyID("test-key").generate();
      JWKS = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
      JWKS.createContext(
          "/jwks",
          exchange -> {
            byte[] body = new JWKSet(KEY.toPublicJWK()).toString().getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
          });
      JWKS.start();
    } catch (Exception ex) {
      throw new ExceptionInInitializerError(ex);
    }
  }

  @DynamicPropertySource
  static void properties(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", postgres::getJdbcUrl);
    registry.add("spring.datasource.username", postgres::getUsername);
    registry.add("spring.datasource.password", postgres::getPassword);
    registry.add("vey.auth.issuer", () -> ISSUER);
    registry.add("vey.auth.audience", () -> ISSUER);
    registry.add(
        "vey.auth.jwks-uri", () -> "http://127.0.0.1:" + JWKS.getAddress().getPort() + "/jwks");
  }

  @Autowired private TestRestTemplate http;
  @Autowired private JdbcTemplate jdbc;

  @BeforeEach
  void clearIam() {
    jdbc.execute(
        "truncate iam.auth_revocations, iam.sessions, iam.workspace_memberships, iam.workspaces, iam.users cascade");
  }

  @Test
  void completeExchangeCookieMeLogoutAndRepeatLogin() throws Exception {
    String passport = token("user-one", "First Name", "valid");
    var exchange = exchange(passport);
    assertThat(exchange.getStatusCode().value()).isEqualTo(200);
    String cookie = exchange.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
    assertThat(cookie)
        .contains("HttpOnly", "Path=/", "SameSite=Lax", "Max-Age=604800")
        .doesNotContain("Secure");
    String raw = cookie.split(";", 2)[0].substring("vey_session=".length());
    assertThat(java.util.Base64.getUrlDecoder().decode(raw)).hasSize(32);
    assertThat(jdbc.queryForObject("select token_hash from iam.sessions", String.class))
        .isEqualTo(SessionTokens.hash(raw))
        .isNotEqualTo(raw);
    assertThat(
            jdbc.queryForObject(
                "select extract(epoch from (expires_at - last_seen_at)) from iam.sessions",
                Long.class))
        .isEqualTo(604800);
    var me = call(HttpMethod.GET, "/api/v1/auth/me", cookie, null);
    assertThat(me.getStatusCode().value()).isEqualTo(200);
    assertThat(me.getBody())
        .contains("First Name", "PERSONAL", "OWNER")
        .doesNotContain("token", "authUserId");
    assertThat(exchange(passport).getStatusCode().value()).isEqualTo(401);
    assertThat(
            call(HttpMethod.POST, "/api/v1/auth/session/logout", cookie, null)
                .getHeaders()
                .getFirst(HttpHeaders.SET_COOKIE))
        .contains("Max-Age=0");
    assertThat(jdbc.queryForObject("select status from iam.sessions", String.class))
        .isEqualTo("REVOKED");
    assertThat(call(HttpMethod.GET, "/api/v1/auth/me", cookie, null).getStatusCode().value())
        .isEqualTo(401);
    assertThat(
            call(HttpMethod.POST, "/api/v1/auth/session/logout", cookie, null)
                .getStatusCode()
                .value())
        .isEqualTo(204);
    assertThat(exchange(token("user-one", "Updated Name", "fresh-session")).getStatusCode().value())
        .isEqualTo(200);
    assertThat(count("users")).isEqualTo(1);
    assertThat(count("workspaces")).isEqualTo(1);
    assertThat(count("workspace_memberships")).isEqualTo(1);
    assertThat(count("sessions")).isEqualTo(2);
    assertThat(jdbc.queryForObject("select display_name from iam.users", String.class))
        .isEqualTo("Updated Name");
    assertThat(
            jdbc.queryForObject(
                "select role || ':' || status from iam.workspace_memberships", String.class))
        .isEqualTo("OWNER:ACTIVE");
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "signature",
        "expired",
        "issuer",
        "audience",
        "algorithm",
        "missing",
        "claims",
        "kid",
        "missing-audience",
        "missing-expiry",
        "missing-sid",
        "missing-auth-time",
        "wrong-auth-time",
        "future-auth-time"
      })
  void rejectsInvalidPassports(String kind) throws Exception {
    assertThat(
            exchange(kind.equals("missing") ? null : token("invalid", "Name", kind))
                .getStatusCode()
                .value())
        .isEqualTo(401);
    assertThat(count("users")).isZero();
  }

  @Test
  void businessEndpointRejectsJwtAndUnknownOrMissingCookies() throws Exception {
    assertThat(
            call(HttpMethod.GET, "/api/v1/auth/me", null, token("user", "Name", "valid"))
                .getStatusCode()
                .value())
        .isEqualTo(401);
    assertThat(call(HttpMethod.GET, "/api/v1/auth/me", null, null).getStatusCode().value())
        .isEqualTo(401);
    assertThat(
            call(HttpMethod.GET, "/api/v1/auth/me", "vey_session=unknown", null)
                .getStatusCode()
                .value())
        .isEqualTo(401);
    assertThat(
            call(HttpMethod.POST, "/api/v1/auth/session/logout", "vey_session=unknown", null)
                .getStatusCode()
                .value())
        .isEqualTo(204);
  }

  @Test
  void rejectsCookieMutationsWithoutTheConfiguredOrigin() throws Exception {
    String cookie =
        exchange(token("csrf-user", "Name", "valid")).getHeaders().getFirst(HttpHeaders.SET_COOKIE);

    assertThat(
            call(
                    HttpMethod.POST,
                    "/api/v1/auth/session/logout",
                    cookie,
                    null,
                    "https://attacker.example")
                .getStatusCode()
                .value())
        .isEqualTo(403);
    assertThat(
            call(HttpMethod.POST, "/api/v1/auth/session/logout", cookie, null, null)
                .getStatusCode()
                .value())
        .isEqualTo(403);
    assertThat(jdbc.queryForObject("select status from iam.sessions", String.class))
        .isEqualTo("ACTIVE");
    assertThat(
            call(HttpMethod.POST, "/api/v1/auth/session/logout", cookie, null)
                .getStatusCode()
                .value())
        .isEqualTo(204);
  }

  @ParameterizedTest
  @ValueSource(strings = {"expired", "revoked", "suspended", "missing-membership", "disabled-user"})
  void validatesSessionAndActiveMembership(String kind) throws Exception {
    String cookie =
        exchange(token("user", "Name", "valid")).getHeaders().getFirst(HttpHeaders.SET_COOKIE);
    switch (kind) {
      case "expired" ->
          jdbc.update("update iam.sessions set expires_at = now() - interval '1 second'");
      case "revoked" -> jdbc.update("update iam.sessions set revoked_at = now()");
      case "suspended" -> jdbc.update("update iam.workspace_memberships set status = 'SUSPENDED'");
      case "missing-membership" -> jdbc.update("delete from iam.workspace_memberships");
      case "disabled-user" -> jdbc.update("update iam.users set status = 'DISABLED'");
      default -> throw new IllegalArgumentException();
    }
    int expected = List.of("suspended", "missing-membership").contains(kind) ? 403 : 401;
    assertThat(call(HttpMethod.GET, "/api/v1/auth/me", cookie, null).getStatusCode().value())
        .isEqualTo(expected);
  }

  @Test
  void concurrentProvisioningReusesInitialResources() throws Exception {
    try (var executor = Executors.newFixedThreadPool(6)) {
      var jobs =
          java.util.stream.IntStream.range(0, 6)
              .mapToObj(
                  i ->
                      executor.submit(
                          () ->
                              exchange(token("concurrent", "Name", "valid"))
                                  .getStatusCode()
                                  .value()))
              .toList();
      for (var job : jobs) {
        assertThat(job.get()).isEqualTo(200);
      }
    }
    assertThat(count("users")).isEqualTo(1);
    assertThat(count("workspaces")).isEqualTo(1);
    assertThat(count("workspace_memberships")).isEqualTo(1);
    assertThat(count("sessions")).isEqualTo(6);
  }

  @Test
  void randomSecretsAreIndependentAndCorsRestrictsOrigin() {
    assertThat(SessionTokens.generate()).isNotEqualTo(SessionTokens.generate());
    HttpHeaders headers = new HttpHeaders();
    headers.setOrigin("http://localhost:3000");
    headers.set("Access-Control-Request-Method", "POST");
    headers.set("Access-Control-Request-Headers", "authorization");
    var response =
        http.exchange(
            "/api/v1/auth/session", HttpMethod.OPTIONS, new HttpEntity<>(headers), String.class);
    assertThat(response.getHeaders().getFirst("Access-Control-Allow-Credentials"))
        .isEqualTo("true");
    headers.setOrigin("https://untrusted.example");
    assertThat(
            http.exchange(
                    "/api/v1/auth/session",
                    HttpMethod.OPTIONS,
                    new HttpEntity<>(headers),
                    String.class)
                .getStatusCode()
                .value())
        .isEqualTo(403);
  }

  @Test
  void identityRevocationInvalidatesCookiesAndRejectsPreviouslyMintedPassports() throws Exception {
    String passport = token("revoked-identity", "Name", "valid");
    String cookie = exchange(passport).getHeaders().getFirst(HttpHeaders.SET_COOKIE);
    String event = revocation("revoked-identity", "revoked-identity-sid", "SESSION_REVOKED");
    assertThat(revoke(event).getStatusCode().value()).isEqualTo(204);
    assertThat(revoke(event).getStatusCode().value()).isEqualTo(204);
    assertThat(call(HttpMethod.GET, "/api/v1/auth/me", cookie, null).getStatusCode().value())
        .isEqualTo(401);
    assertThat(exchange(token("revoked-identity", "Name", "valid")).getStatusCode().value())
        .isEqualTo(401);
    assertThat(count("users")).isEqualTo(1);
    assertThat(count("workspaces")).isEqualTo(1);
    assertThat(count("auth_revocations")).isEqualTo(1);
    var fresh =
        new JWTClaimsSet.Builder(SignedJWT.parse(passport).getJWTClaimsSet())
            .jwtID(java.util.UUID.randomUUID().toString())
            .claim("sid", "new-identity-session")
            .build();
    assertThat(exchange(signed(fresh)).getStatusCode().value()).isEqualTo(200);
  }

  @Test
  void passwordResetRevokesAllIdentitySessionsAndKeepsOtherUsersSignedIn() throws Exception {
    String passport = token("reset-user", "Name", "valid");
    String first = exchange(passport).getHeaders().getFirst(HttpHeaders.SET_COOKIE);
    String secondPassport =
        signed(
            new JWTClaimsSet.Builder(SignedJWT.parse(passport).getJWTClaimsSet())
                .jwtID(java.util.UUID.randomUUID().toString())
                .claim("sid", "second-device")
                .build());
    String second = exchange(secondPassport).getHeaders().getFirst(HttpHeaders.SET_COOKIE);
    String other =
        exchange(token("other-user", "Other", "valid"))
            .getHeaders()
            .getFirst(HttpHeaders.SET_COOKIE);
    assertThat(revoke(revocation("reset-user", null, "PASSWORD_RESET")).getStatusCode().value())
        .isEqualTo(204);
    for (String cookie : List.of(first, second)) {
      assertThat(call(HttpMethod.GET, "/api/v1/auth/me", cookie, null).getStatusCode().value())
          .isEqualTo(401);
    }
    assertThat(call(HttpMethod.GET, "/api/v1/auth/me", other, null).getStatusCode().value())
        .isEqualTo(200);
    assertThat(exchange(secondPassport).getStatusCode().value()).isEqualTo(401);
    String fresh =
        signed(
            new JWTClaimsSet.Builder(SignedJWT.parse(passport).getJWTClaimsSet())
                .jwtID(java.util.UUID.randomUUID().toString())
                .claim("sid", "after-reset")
                .claim("auth_session_created_at", System.currentTimeMillis() + 1)
                .build());
    assertThat(exchange(fresh).getStatusCode().value()).isEqualTo(200);
  }

  @Test
  void revocationBeforeFirstExchangeStillBlocksOldIdentitySession() throws Exception {
    assertThat(
            revoke(revocation("not-provisioned", null, "PASSWORD_RESET")).getStatusCode().value())
        .isEqualTo(204);
    assertThat(exchange(token("not-provisioned", "Name", "valid")).getStatusCode().value())
        .isEqualTo(401);
    assertThat(count("users")).isZero();
  }

  @Test
  void identityAndRevocationTokensCannotBeUsedInterchangeably() throws Exception {
    assertThat(revoke(token("user", "Name", "valid")).getStatusCode().value()).isEqualTo(403);
    assertThat(exchange(revocation("user", "user-sid", "SESSION_REVOKED")).getStatusCode().value())
        .isEqualTo(403);
    assertThat(revoke(null).getStatusCode().value()).isEqualTo(401);
    assertThat(count("users")).isZero();
  }

  @Test
  void concurrentExchangeCannotRecreateSessionsAfterIdentityRevocation() throws Exception {
    try (var executor = Executors.newFixedThreadPool(7)) {
      var jobs =
          java.util.stream.IntStream.range(0, 6)
              .mapToObj(
                  i ->
                      executor.submit(
                          () ->
                              exchange(token("revocation-race", "Name", "valid"))
                                  .getStatusCode()
                                  .value()))
              .toList();
      var revoke =
          executor.submit(
              () ->
                  revoke(revocation("revocation-race", "revocation-race-sid", "SESSION_REVOKED"))
                      .getStatusCode()
                      .value());
      assertThat(revoke.get()).isEqualTo(204);
      for (var job : jobs) {
        assertThat(job.get()).isIn(200, 401);
      }
    }
    assertThat(
            jdbc.queryForObject(
                "select count(*) from iam.sessions where status = 'ACTIVE'", Integer.class))
        .isZero();
    assertThat(exchange(token("revocation-race", "Name", "valid")).getStatusCode().value())
        .isEqualTo(401);
  }

  @Test
  void consumesPassportIdDespiteAlternateJwsSignatureEncoding() throws Exception {
    String passport = token("one-use", "Name", "valid");
    // Nimbus accepts equivalent padded base64url signatures. Both encode the same passport.
    assertThat(exchange(passport + "=").getStatusCode().value()).isEqualTo(200);
    assertThat(exchange(passport).getStatusCode().value()).isEqualTo(401);
    assertThat(count("sessions")).isEqualTo(1);
  }

  @Test
  void swaggerIsAvailableWhenExplicitlyEnabled() {
    assertThat(http.getForEntity("/swagger-ui/index.html", String.class).getStatusCode().value())
        .isEqualTo(200);
    assertThat(http.getForEntity("/v3/api-docs", String.class).getStatusCode().value())
        .isEqualTo(200);
  }

  private ResponseEntity<String> revoke(String passport) {
    return call(HttpMethod.POST, "/api/v1/auth/identity/revoke", null, passport);
  }

  private String revocation(String user, String sid, String reason) throws Exception {
    return signed(
        new JWTClaimsSet.Builder()
            .subject(user)
            .issuer(ISSUER)
            .audience(ISSUER)
            .issueTime(Date.from(Instant.now()))
            .jwtID(java.util.UUID.randomUUID().toString())
            .expirationTime(Date.from(Instant.now().plusSeconds(60)))
            .jwtID(java.util.UUID.randomUUID().toString())
            .claim("token_use", "revocation")
            .claim("sid", sid)
            .claim("reason", reason)
            .claim("occurred_at", System.currentTimeMillis())
            .build());
  }

  private String signed(JWTClaimsSet claims) throws Exception {
    var jwt =
        new SignedJWT(
            new JWSHeader.Builder(JWSAlgorithm.ES256).keyID(KEY.getKeyID()).build(), claims);
    jwt.sign(new ECDSASigner(KEY));
    return jwt.serialize();
  }

  private int count(String table) {
    return jdbc.queryForObject("select count(*) from iam." + table, Integer.class);
  }

  private ResponseEntity<String> exchange(String token) {
    return call(HttpMethod.POST, "/api/v1/auth/session", null, token);
  }

  private ResponseEntity<String> call(HttpMethod method, String path, String cookie, String token) {
    return call(method, path, cookie, token, "http://localhost:3000");
  }

  private ResponseEntity<String> call(
      HttpMethod method, String path, String cookie, String token, String origin) {
    HttpHeaders headers = new HttpHeaders();
    if (origin != null) {
      headers.setOrigin(origin);
    }
    if (cookie != null) {
      headers.set(HttpHeaders.COOKIE, cookie.split(";", 2)[0]);
    }
    if (token != null) {
      headers.setBearerAuth(token);
    }
    return http.exchange(path, method, new HttpEntity<>(headers), String.class);
  }

  private String token(String sub, String name, String kind) throws Exception {
    String sid =
        switch (kind) {
          case "missing-sid" -> null;
          case "fresh-session" -> java.util.UUID.randomUUID().toString();
          default -> sub + "-sid";
        };
    Object authCreatedAt =
        switch (kind) {
          case "missing-auth-time" -> null;
          case "wrong-auth-time" -> "not-a-timestamp";
          case "future-auth-time" -> System.currentTimeMillis() + 120000;
          default -> System.currentTimeMillis() - 60000;
        };
    var claims =
        new JWTClaimsSet.Builder()
            .subject(sub)
            .issuer(kind.equals("issuer") ? "https://wrong.test" : ISSUER)
            .audience(
                kind.equals("missing-audience") ? null : kind.equals("audience") ? "wrong" : ISSUER)
            .issueTime(Date.from(Instant.now()))
            .jwtID(java.util.UUID.randomUUID().toString())
            .expirationTime(
                kind.equals("missing-expiry")
                    ? null
                    : Date.from(Instant.now().plusSeconds(kind.equals("expired") ? -120 : 900)))
            .claim("token_use", "identity")
            .claim("sid", sid)
            .claim("auth_session_created_at", authCreatedAt)
            .claim("email", "user@example.com")
            .claim("name", name)
            .claim("emailVerified", !kind.equals("claims") ? true : "true")
            .claim("image", null)
            .build();
    var jwt =
        new SignedJWT(
            new JWSHeader.Builder(
                    kind.equals("algorithm") ? JWSAlgorithm.HS256 : JWSAlgorithm.ES256)
                .keyID(kind.equals("kid") ? "unknown-key" : KEY.getKeyID())
                .build(),
            claims);
    if (kind.equals("algorithm")) {
      jwt.sign(new MACSigner(new byte[32]));
    } else {
      jwt.sign(
          new ECDSASigner(
              kind.equals("signature") ? new ECKeyGenerator(Curve.P_256).generate() : KEY));
    }
    return jwt.serialize();
  }
}
