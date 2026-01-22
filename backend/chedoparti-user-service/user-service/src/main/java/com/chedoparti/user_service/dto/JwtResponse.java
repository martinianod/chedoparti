package com.chedoparti.user_service.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class JwtResponse {
    private final String token;
    private final String email;
    private final String name;
    private final Long userId;
}
