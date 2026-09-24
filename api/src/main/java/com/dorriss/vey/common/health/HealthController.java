package com.dorriss.vey.common.health;

import com.dorriss.vey.common.response.ApiResponse;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {
    @GetMapping
    public ApiResponse<HealthStatus> health() {
        return ApiResponse.<HealthStatus>builder()
                .code(1000)
                .message("Success")
                .result(new HealthStatus("vey-api", "UP"))
                .build();
    }

    public record HealthStatus(String service, String status) {}
}
