package com.chedoparti.user_service.service;

import java.util.List;
import java.util.Set;

import com.chedoparti.user_service.dto.UserDTO;
import com.chedoparti.user_service.enums.ERole;
import com.chedoparti.user_service.entity.User;

public interface UserService {

    UserDTO createUser(UserDTO userDTO);

    UserDTO getUserById(Long id);

    List<UserDTO> getAllUsers();

    UserDTO updateUser(Long id, UserDTO userDTO);

    void deleteUser(Long id);
    
    User findByUsernameOrEmail(String usernameOrEmail);

}
