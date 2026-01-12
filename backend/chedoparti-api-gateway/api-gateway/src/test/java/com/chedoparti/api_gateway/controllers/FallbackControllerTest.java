package com.chedoparti.api_gateway.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.reactive.server.WebTestClient;

class FallbackControllerTest {

    private WebTestClient webTestClient;

    @BeforeEach
    void setUp() {
        webTestClient = WebTestClient.bindToController(new FallbackController()).build();
    }

    @Test
    void paymentServiceFallBack_ReturnsExpectedMessage() {
        webTestClient.get().uri("/paymentFallBack")
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class)
                .isEqualTo("Payment Service is unavailable. Please try again later.");
    }

    @Test
    void reservationServiceFallBack_ReturnsExpectedMessage() {
        webTestClient.get().uri("/reservationFallBack")
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class)
                .isEqualTo("Reservation Service is unavailable. Please try again later.");
    }

    @Test
    void authServiceFallBack_ReturnsExpectedMessage() {
        webTestClient.get().uri("/authFallBack")
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class)
                .isEqualTo("Auth Service is unavailable. Please try again later.");
    }

    @Test
    void institutionServiceFallBack_ReturnsExpectedMessage() {
        webTestClient.get().uri("/institutionFallBack")
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class)
                .isEqualTo("Institution Service is unavailable. Please try again later.");
    }

    @Test
    void userServiceFallBack_ReturnsExpectedMessage() {
        webTestClient.get().uri("/userFallBack")
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class)
                .isEqualTo("User Service is unavailable. Please try again later.");
    }
}