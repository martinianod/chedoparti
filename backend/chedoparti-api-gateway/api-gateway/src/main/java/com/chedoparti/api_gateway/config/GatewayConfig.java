package com.chedoparti.api_gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("user_service", r -> r.path("/user/**")
                        .uri("http://chedoparti-user-service"))
                .route("reservation_service", r -> r.path("/reservation/**")
                        .uri("http://chedoparti-reservation-service"))
                .route("payment_service", r -> r.path("/payment/**")
                        .uri("http://chedoparti-payment-service"))
                .route("institution_service", r -> r.path("/institution/**")
                        .uri("http://chedoparti-institution-service"))
                .build();
    }
}

