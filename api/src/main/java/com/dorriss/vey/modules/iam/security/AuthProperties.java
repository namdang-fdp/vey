package com.dorriss.vey.modules.iam.security;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Duration;
import org.hibernate.validator.constraints.time.DurationMin;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Cấu hình identity bridge, được validate khi khởi động. Issuer/audience/JWKS thuộc Better Auth;
 * sessionTtl dùng chung cho hạn phiên trong database và Max-Age của cookie Vey.
 */
@Validated
@ConfigurationProperties("vey.auth")
public record AuthProperties(
    @NotBlank String issuer,
    @NotBlank String jwksUri,
    @NotBlank String audience,
    @NotNull @DurationMin(seconds = 1) Duration sessionTtl,
    boolean cookieSecure) {}
