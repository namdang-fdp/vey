package com.dorriss.vey.infrastructure.storage;

import java.net.URI;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "vey.storage")
public record StorageProperties(
    URI endpoint, String region, String accessKey, String secretKey, String bucket) {}
