package com.chedoparti.user_service.dto;

import java.time.LocalDateTime;
import java.util.Set;

import com.chedoparti.user_service.enums.ERole;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;

    private String username;
    private String email;
    private String password;
    private String phoneNumber;
    private String address;
    private String profilePictureUrl;

    private Set<ERole> roles;

    private String createdBy;
    private LocalDateTime createdDate;
    private String lastModifiedBy;
    private LocalDateTime lastModifiedDate;

    private boolean enabled;
    private boolean accountNonExpired;
    private boolean credentialsNonExpired;
    private boolean accountNonLocked;

    private String resetToken;

}
