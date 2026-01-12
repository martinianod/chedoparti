package com.chedoparti.user_service.service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

import com.chedoparti.user_service.entity.Role;
import com.chedoparti.user_service.enums.ERole;
import com.chedoparti.user_service.service.factory.UserFactory;
import com.chedoparti.user_service.service.factory.UserFactoryProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.chedoparti.user_service.dto.UserDTO;
import com.chedoparti.user_service.entity.User;
import com.chedoparti.user_service.exception.CustomException;
import com.chedoparti.user_service.mapper.UserMapper;
import com.chedoparti.user_service.repository.UserRepository;
import com.chedoparti.user_service.repository.RoleRepository;

@Service
@Slf4j
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private UserFactoryProvider userFactoryProvider;

    @Override
    public UserDTO createUser(UserDTO userDTO) {

        if (userDTO.getRoles().stream().findFirst().isEmpty()) {
            throw new NoSuchElementException("Role Not found");
        }

        // Retrieve the role from the database
        ERole roleDTO = userDTO.getRoles().stream().findFirst().get();
        Optional<Role> role = roleRepository.findByName(userDTO.getRoles().stream().findFirst().get());
        if (role.isEmpty()) {
            throw new IllegalArgumentException("Invalid role: " + roleDTO.name());
        }

        UserFactory userFactory = userFactoryProvider.getFactory(role.get().getName());
        User user = userFactory.createUser(userDTO.getUsername(), userDTO.getPassword());
        return userMapper.userToUserDTO(user);

    }

    @Override
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomException("User not found"));
        return userMapper.userToUserDTO(user);
    }

    @Override
    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(userMapper::userToUserDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomException("User not found"));
        userMapper.userDTOToUser(userDTO);
        user = userRepository.save(user);
        return userMapper.userToUserDTO(user);
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}