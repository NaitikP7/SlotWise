package com.slotwise.sw.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

/**
 * Jackson configuration for proper date serialization.
 * In Jackson 3.x (tools.jackson, used by Spring Boot 4.x):
 * - Java 8 date/time support is built into core (no separate jsr310 module)
 * - ISO-8601 string serialization is the DEFAULT behavior
 * - WRITE_DATES_AS_TIMESTAMPS no longer exists as it was removed
 * 
 * This bean simply ensures a clean ObjectMapper is available.
 */
@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        return JsonMapper.builder()
                .build();
    }
}
