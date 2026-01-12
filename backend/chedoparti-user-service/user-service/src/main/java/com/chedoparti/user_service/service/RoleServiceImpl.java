package com.chedoparti.user_service.service;

import com.chedoparti.user_service.dto.RoleDTO;
import com.chedoparti.user_service.entity.Role;
import com.chedoparti.user_service.mapper.RoleMapper;
import com.chedoparti.user_service.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoleServiceImpl implements RoleService {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private RoleMapper roleMapper;

    @Override
    public RoleDTO createRole(RoleDTO role) {
        return roleMapper.roleToRoleDTO(roleRepository.save(roleMapper.roleDTOToRole(role)));
    }

    @Override
    public RoleDTO updateRole(Long roleId, RoleDTO roleDetails) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        role.setName(roleDetails.getName());
        return roleMapper.roleToRoleDTO(roleRepository.save(role));
    }

    @Override
    public void deleteRole(Long roleId) {
        roleRepository.deleteById(roleId);
    }

    @Override
    public Optional<RoleDTO> getRoleById(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        return Optional.ofNullable(roleMapper.roleToRoleDTO(role));
    }

    @Override
    public List<RoleDTO> getAll() {
        List<Role> roles = roleRepository.findAll();
        return roleMapper.rolesToRoleDTOs(roles);
    }

}
