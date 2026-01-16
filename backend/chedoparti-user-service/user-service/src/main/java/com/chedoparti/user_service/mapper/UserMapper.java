package com.chedoparti.user_service.mapper;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import com.chedoparti.user_service.dto.UserDTO;
import com.chedoparti.user_service.entity.Role;
import com.chedoparti.user_service.entity.User;
import com.chedoparti.user_service.enums.ERole;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    @Mapping(source = "roles", target = "roles", qualifiedByName = "rolesToEnums")
    UserDTO userToUserDTO(User user);

    @Mapping(source = "roles", target = "roles", qualifiedByName = "enumsToRoles")
    User userDTOToUser(UserDTO userDTO);

    List<UserDTO> usersToUserDTOs(List<User> users);

    List<User> userDTOsToUsers(List<UserDTO> userDTOs);
    
    @Named("rolesToEnums")
    default Set<ERole> rolesToEnums(Set<Role> roles) {
        if (roles == null) {
            return null;
        }
        return roles.stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
    }
    
    @Named("enumsToRoles")
    default Set<Role> enumsToRoles(Set<ERole> enums) {
        if (enums == null) {
            return null;
        }
        return enums.stream()
                .map(eRole -> {
                    Role role = new Role();
                    role.setName(eRole);
                    return role;
                })
                .collect(Collectors.toSet());
    }
}
