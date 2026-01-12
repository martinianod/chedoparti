package com.chedoparti.user_service.dto;

import com.chedoparti.user_service.entity.Permission;
import com.chedoparti.user_service.entity.User;
import com.chedoparti.user_service.enums.ERole;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Set;

@Data
public class RoleDTO {

    private Long id;
    private ERole name;
    private String description;
    private Set<User> users;
    private Set<Permission> permissions;
}
