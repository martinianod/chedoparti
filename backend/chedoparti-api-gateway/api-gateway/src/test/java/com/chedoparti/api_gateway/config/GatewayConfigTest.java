package com.chedoparti.api_gateway.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.route.RouteLocator;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class GatewayConfigTest {

    @Autowired
    private RouteLocator routeLocator;

    @Test
    void gatewayRoutes_BeanIsCreated() {
        assertThat(routeLocator).isNotNull();
    }
}
