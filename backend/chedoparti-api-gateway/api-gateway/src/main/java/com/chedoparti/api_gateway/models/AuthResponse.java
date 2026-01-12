package com.chedoparti.api_gateway.models;

import lombok.Data;

@Data
public class AuthResponse {
    private String message;
    private boolean success;
}
