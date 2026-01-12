package com.chedoparti.user_service.mapper;

import com.chedoparti.user_service.dto.RoleDTO;
import com.chedoparti.user_service.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    RoleMapper INSTANCE = Mappers.getMapper(RoleMapper.class);

    RoleDTO roleToRoleDTO(Role role);

    Role roleDTOToRole(RoleDTO roleDTO);

    List<RoleDTO> rolesToRoleDTOs(List<Role> roles);

    List<Role> roleDTOsToRoles(List<RoleDTO> roleDTOs);
}
