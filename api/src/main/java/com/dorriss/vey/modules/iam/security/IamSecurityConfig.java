package com.dorriss.vey.modules.iam.security;

import com.dorriss.vey.modules.iam.application.service.IamSessionService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;

/**
 * Hai ranh giới xác thực: JWT của Better Auth để exchange/revoke, cookie Vey cho API nghiệp vụ.
 * Spring chọn chain khớp đầu tiên; request bị từ chối không chuyển sang chain tiếp theo.
 */
@Configuration
@EnableMethodSecurity
@EnableConfigurationProperties(AuthProperties.class)
public class IamSecurityConfig {
  // Docs có điều kiện riêng, không được gộp vào nhóm permitAll cố định.
  private static final String[] DOC_PATHS = {
    "/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**"
  };

  private static final String[] PUBLIC_PATHS = {"/api/v1/health", "/actuator/health", "/error"};
  private static final String SESSION_EXCHANGE_PATH = "/api/v1/auth/session";
  private static final String IDENTITY_REVOCATION_PATH = "/api/v1/auth/identity/revoke";
  private static final String LOGOUT_PATH = "/api/v1/auth/session/logout";

  /** Decoder kiểm chữ ký ES256 và issuer/thời gian; contract kiểm các claim riêng của Vey. */
  @Bean
  JwtDecoder jwtDecoder(AuthProperties properties) {
    var decoder =
        NimbusJwtDecoder.withJwkSetUri(properties.jwksUri())
            .jwsAlgorithm(SignatureAlgorithm.ES256)
            .build();
    decoder.setJwtValidator(
        new DelegatingOAuth2TokenValidator<>(
            JwtValidators.createDefaultWithIssuer(properties.issuer()),
            new IdentityJwtContract(properties.audience())));
    return decoder;
  }

  /** Chỉ hai POST server/identity này nhận Bearer JWT, với token_use riêng cho từng mục đích. */
  @Bean
  @Order(1)
  SecurityFilterChain exchangeChain(HttpSecurity http, JwtDecoder decoder) throws Exception {
    http.securityMatcher(
            request ->
                request.getMethod().equals("POST")
                    && (request.getServletPath().equals(SESSION_EXCHANGE_PATH)
                        || request.getServletPath().equals(IDENTITY_REVOCATION_PATH)))
        .cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            a ->
                a.requestMatchers(SESSION_EXCHANGE_PATH)
                    .access(
                        (authentication, context) ->
                            new AuthorizationDecision(
                                authentication.get().getPrincipal() instanceof Jwt jwt
                                    && "identity".equals(jwt.getClaim("token_use"))))
                    .anyRequest()
                    .access(
                        (authentication, context) ->
                            new AuthorizationDecision(
                                authentication.get().getPrincipal() instanceof Jwt jwt
                                    && "revocation".equals(jwt.getClaim("token_use")))))
        .oauth2ResourceServer(o -> o.jwt(j -> j.decoder(decoder)));
    return http.build();
  }

  /**
   * API nghiệp vụ dùng session trong PostgreSQL. STATELESS chỉ tắt HTTP session của Spring;
   * VeySessionFilter vẫn xác thực cookie và đọc membership ở mỗi request.
   */
  @Bean
  @Order(2)
  SecurityFilterChain applicationChain(
      HttpSecurity http,
      IamSessionService sessions,
      @Value("${vey.cors.allowed-origin}") String allowedOrigin,
      @Value("${vey.api-docs.enabled:false}") boolean docsEnabled)
      throws Exception {
    // Cookie tự được trình duyệt gửi; VeySessionFilter kiểm Origin cho API thay đổi dữ liệu.
    http.cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .requestCache(c -> c.disable())
        .formLogin(f -> f.disable())
        .httpBasic(b -> b.disable())
        .logout(l -> l.disable())
        .authorizeHttpRequests(
            a ->
                a.requestMatchers(DOC_PATHS)
                    .access((authentication, context) -> new AuthorizationDecision(docsEnabled))
                    .requestMatchers(HttpMethod.OPTIONS, "/**")
                    .permitAll()
                    .requestMatchers(PUBLIC_PATHS)
                    .permitAll()
                    // Cho phép xóa cookie cả khi session đã hết hạn/revoke; Origin vẫn được kiểm
                    // tra.
                    .requestMatchers(HttpMethod.POST, LOGOUT_PATH)
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .exceptionHandling(
            e ->
                e.authenticationEntryPoint((req, res, ex) -> res.sendError(401))
                    .accessDeniedHandler((req, res, ex) -> res.sendError(403)))
        // Nạp principal và authorities trước khi Spring gán authentication anonymous.
        .addFilterBefore(
            new VeySessionFilter(sessions, allowedOrigin), AnonymousAuthenticationFilter.class);
    return http.build();
  }
}
