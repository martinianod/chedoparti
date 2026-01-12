package com.chedoparti.user_service.service;

import com.chedoparti.user_service.dto.UserDTO;
import com.chedoparti.user_service.entity.User;
import com.chedoparti.user_service.mapper.UserMapper;
import com.chedoparti.user_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class JwtUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isEmpty()) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }

        UserDTO userDTO = userMapper.userToUserDTO(user.get());

        return org.springframework.security.core.userdetails.User.withUsername(userDTO.getUsername())
                .password(userDTO.getPassword())
                .authorities(userDTO.getRoles().stream()
                        .map(Enum::name)
                        .toArray(String[]::new))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }
}
