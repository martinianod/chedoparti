package com.chedoparti.user_service.controller;

import com.chedoparti.user_service.dto.JwtResponse;
import com.chedoparti.user_service.dto.UserDTO;
import com.chedoparti.user_service.model.User;
import com.chedoparti.user_service.service.JwtUserDetailsService;
import com.chedoparti.user_service.service.UserService;
import com.chedoparti.user_service.util.JwtTokenUtil;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@Slf4j
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private JwtUserDetailsService userDetailsService;

    @PostMapping("/authenticate")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody UserDTO authenticationRequest) throws Exception {
        String usernameOrEmail = authenticationRequest.getUsername() != null 
            ? authenticationRequest.getUsername() 
            : authenticationRequest.getEmail();
        
        authenticate(usernameOrEmail, authenticationRequest.getPassword());

        final UserDetails userDetails = userDetailsService.loadUserByUsername(usernameOrEmail);
        final String token = jwtTokenUtil.generateToken(userDetails);
        
        User user = userService.findByUsernameOrEmail(usernameOrEmail);
        
        return ResponseEntity.ok(new JwtResponse(
            token, 
            user.getEmail(), 
            user.getUsername(),
            user.getId()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) throws Exception {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        
        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }
        
        authenticate(email, password);

        final UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        final String token = jwtTokenUtil.generateToken(userDetails);
        
        User user = userService.findByUsernameOrEmail(email);
        
        return ResponseEntity.ok(new JwtResponse(
            token, 
            user.getEmail(), 
            user.getUsername(),
            user.getId()
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            String username = authentication.getName();
            User user = userService.findByUsernameOrEmail(username);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            
            UserDTO userDTO = new UserDTO();
            userDTO.setId(user.getId());
            userDTO.setUsername(user.getUsername());
            userDTO.setEmail(user.getEmail());
            userDTO.setPhoneNumber(user.getPhoneNumber());
            userDTO.setAddress(user.getAddress());
            userDTO.setProfilePictureUrl(user.getProfilePictureUrl());
            userDTO.setRoles(user.getRoles());
            userDTO.setEnabled(user.isEnabled());
            
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            log.error("Error getting current user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.createUser(userDTO));
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.createUser(userDTO));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("valid", false));
            }
            
            String token = authHeader.substring(7);
            String username = jwtTokenUtil.getUsernameFromToken(token);
            
            if (username != null && jwtTokenUtil.validateToken(token, userDetailsService.loadUserByUsername(username))) {
                User user = userService.findByUsernameOrEmail(username);
                return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "userId", user.getId()
                ));
            }
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("valid", false));
        } catch (Exception e) {
            log.error("Error verifying token", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("valid", false));
        }
    }

    private void authenticate(String username, String password) throws Exception {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        } catch (DisabledException e) {
            throw new Exception("USER_DISABLED", e);
        } catch (BadCredentialsException e) {
            throw new Exception("INVALID_CREDENTIALS", e);
        }
    }

}
