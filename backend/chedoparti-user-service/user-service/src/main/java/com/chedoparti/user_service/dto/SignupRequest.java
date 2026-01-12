package com.chedoparti.user_service.dto;

import com.chedoparti.user_service.enums.ERole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Set;

@Data
public class SignupRequest {

    @NotNull
    private String username;

    @NotNull
    private String password;

    @NotNull
    private Set<ERole> roles;

}
