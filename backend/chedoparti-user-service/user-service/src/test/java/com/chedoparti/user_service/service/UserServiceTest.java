package com.chedoparti.user_service.service;

import com.chedoparti.user_service.dto.UserDTO;
import com.chedoparti.user_service.entity.User;
import com.chedoparti.user_service.enums.ERole;
import com.chedoparti.user_service.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService; // asumiendo que UserServiceImpl implementa UserService

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testCreateUser() {
        // Simulamos un UserDTO para crear
        UserDTO userDTO = new UserDTO();
        userDTO.setUsername("testUser");
        userDTO.setPassword("password123");
        userDTO.setRoles(Set.of(ERole.ROLE_USER)); // inicializar el conjunto de roles para evitar NullPointerException

        // Llamamos al método de creación del usuario
        UserDTO createdUser = userService.createUser(userDTO);

        // Verificamos que se haya creado correctamente
        assertNotNull(createdUser);
        assertEquals("testUser", createdUser.getUsername());
    }
}
