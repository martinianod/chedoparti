package com.chedoparti.api_gateway.exception;

import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.context.annotation.Import;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootTest
@AutoConfigureWebTestClient
@Import(TestSecurityConfig.class)
@ActiveProfiles("test")
class GlobalExceptionHandlerTest {

    @Autowired
    private WebTestClient webTestClient;

    @Test
    void handleAuthenticationException_ReturnsUnauthorized() {
        webTestClient.get().uri("/auth-ex")
                .exchange()
                .expectStatus().isUnauthorized()
                .expectBody(String.class)
                .isEqualTo("Autenticación fallida: Test auth exception");
    }

    @Test
    void handleAccessDeniedException_ReturnsForbidden() {
        webTestClient.get().uri("/access-denied-ex")
                .exchange()
                .expectStatus().isForbidden()
                .expectBody(String.class)
                .isEqualTo("Acceso denegado: Test access denied");
    }

    @Test
    void handleExpiredJwtException_ReturnsUnauthorized() {
        webTestClient.get().uri("/jwt-expired-ex")
                .exchange()
                .expectStatus().isUnauthorized()
                .expectBody(String.class)
                .isEqualTo("Token expirado: Test jwt expired");
    }
}

// Dummy controller to trigger exceptions
@RestController
class DummyController {
    @GetMapping("/auth-ex")
    public void authEx() {
        throw new AuthenticationException("Test auth exception") {};
    }

    @GetMapping("/access-denied-ex")
    public void accessDeniedEx() {
        throw new AccessDeniedException("Test access denied");
    }

    @GetMapping("/jwt-expired-ex")
    public void jwtExpiredEx() {
        throw new ExpiredJwtException(null, null, "Test jwt expired");
    }
}
