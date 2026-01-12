package com.chedoparti.user_service.service;

import com.chedoparti.user_service.dto.RoleDTO;

import java.util.List;
import java.util.Optional;

public interface RoleService {

    RoleDTO createRole(RoleDTO role);

    RoleDTO updateRole(Long roleId, RoleDTO roleDetails);

    void deleteRole(Long roleId);

    Optional<RoleDTO> getRoleById(Long id);

    List<RoleDTO> getAll();
}
