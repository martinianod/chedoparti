package com.chedoparti.reservation_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${openapi.service.url}")
    private String serviceUrl;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .servers(List.of(
                        new Server()
                                .url(serviceUrl)
                                .description("Service URL")
                ))
                .info(new Info()
                        .title("ChedoParti Reservation Service API")
                        .description("""
                                ## Comprehensive API Documentation for ChedoParti Reservation Service
                                
                                This API provides endpoints for managing court reservations, users, and related operations.
                                
                                ### Authentication
                                - The API uses JWT for authentication.
                                - Include the JWT token in the `Authorization` header for authenticated requests.
                                
                                ### Error Handling
                                - All error responses follow a consistent format with appropriate HTTP status codes.
                                - Error responses include a message and a timestamp.
                                
                                ### Rate Limiting
                                - The API implements rate limiting to ensure fair usage.
                                - Check response headers for rate limit information.
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("ChedoParti Support")
                                .email("support@chedoparti.com")
                                .url("https://www.chedoparti.com/support"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html"))
                        .termsOfService("https://www.chedoparti.com/terms"));
    }
}
