package com.chedoparti.api_gateway.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
public class FallbackController {

    /**
     * Returns a Mono that contains a string indicating that the Payment Service is unavailable.
     * This method is used as a fallback when the Payment Service is unavailable.
     *
     * @return a Mono that contains a string indicating that the Payment Service is unavailable
     */
    @GetMapping("/paymentFallBack")
    public Mono<String> paymentServiceFallBack() {
        return Mono.just("Payment Service is unavailable. Please try again later.");
    }

    /**
     * Return a Mono that contains a string indicating that the Reservation Service is unavailable.
     * This method is used as a fallback when the Reservation Service is unavailable.
     *
     * @return a Mono that contains a string indicating that the Reservation Service is unavailable
     */
    @GetMapping("/reservationFallBack")
    public Mono<String> reservationServiceFallBack() {
        return Mono.just("Reservation Service is unavailable. Please try again later.");
    }

    /**
     * Return a Mono that contains a string indicating that the Auth Service is unavailable.
     * This method is used as a fallback when the Auth Service is unavailable.

    /**
     * Return a Mono that contains a string indicating that the Institution Service is unavailable.
     * This method is used as a fallback when the Institution Service is unavailable.
     *
     * @return a Mono that contains a string indicating that the Institution Service is unavailable
     */
    @GetMapping("/authFallBack")
    public Mono<String> authServiceFallBack() {
        return Mono.just("Auth Service is unavailable. Please try again later.");
    }

    /**
     * Return a Mono that contains a string indicating that the Institution Service is unavailable.
     * This method is used as a fallback when the Institution Service is unavailable.
     *
     * @return a Mono that contains a string indicating that the Institution Service is unavailable
     */
    @GetMapping("/institutionFallBack")
    public Mono<String> institutionServiceFallBack() {
        return Mono.just("Institution Service is unavailable. Please try again later.");
    }

    /**
     * Return a Mono that contains a string indicating that the User Service is unavailable.
     * This method is used as a fallback when the User Service is unavailable.
     *
     * @return a Mono that contains a string indicating that the User Service is unavailable
     */
    @GetMapping("/userFallBack")
    public Mono<String> userServiceFallBack() {
        return Mono.just("User Service is unavailable. Please try again later.");
    }
}

