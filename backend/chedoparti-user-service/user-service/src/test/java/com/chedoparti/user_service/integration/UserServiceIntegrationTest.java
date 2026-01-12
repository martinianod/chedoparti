package com.chedoparti.user_service.integration;

import com.chedoparti.user_service.dto.UserDTO;
import com.chedoparti.user_service.entity.User;
import com.chedoparti.user_service.repository.UserRepository;
import com.chedoparti.user_service.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.util.Objects;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class UserServiceIntegrationTest {
    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Test
    public void testCreateUser() {
        UserDTO userDTO = new UserDTO();
        userDTO.setUsername("testuser");
        userDTO.setPassword("password");

        HttpHeaders headers = new HttpHeaders();
        HttpEntity<UserDTO> request = new HttpEntity<>(userDTO, headers);

        ResponseEntity<User> response = restTemplate.exchange(
                "/api/users",
                HttpMethod.POST,
                request,
                User.class
        );

        assertEquals(201, response.getStatusCode().value());
        assertEquals("testuser", Objects.requireNonNull(response.getBody()).getUsername());
    }
}
