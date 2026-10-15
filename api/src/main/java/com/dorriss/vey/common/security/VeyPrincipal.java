package com.dorriss.vey.common.security;

import java.util.UUID;

/** Context đã xác thực cho các module; membershipRole chỉ có hiệu lực trong activeWorkspaceId. */
public record VeyPrincipal(
    UUID sessionId,
    UUID userId,
    UUID activeWorkspaceId,
    UUID membershipId,
    String membershipRole) {}
