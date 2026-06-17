package com.cineverse.auth.controller;

import com.cineverse.auth.dto.LoginDTO;
import com.cineverse.auth.dto.RegisterDTO;
import com.cineverse.auth.entity.User;
import com.cineverse.auth.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDTO dto) {
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setRole(dto.getRole());
        user.setStatus("Active");

        User registeredUser = userService.register(user);
        String token = Base64.getEncoder().encodeToString((registeredUser.getEmail() + ":" + registeredUser.getRole()).getBytes());
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("email", registeredUser.getEmail());
        response.put("name", registeredUser.getName());
        response.put("role", registeredUser.getRole());
        response.put("status", registeredUser.getStatus());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO credentials) {
        // Resolve email/username property
        String email = credentials.getEmail();
        if (email == null || email.isBlank()) {
            email = credentials.getUsername();
        }

        // Support short username inputs from older tests/requests
        if (email != null && !email.contains("@")) {
            email = email + "@cineverse.com";
        }

        String password = credentials.getPassword();
        String role = credentials.getRole();

        String token = userService.login(email, password, role);
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("role", user.getRole());
        response.put("status", user.getStatus());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestParam String token) {
        try {
            byte[] decodedBytes = Base64.getDecoder().decode(token);
            String decoded = new String(decodedBytes);
            String[] parts = decoded.split(":");
            if (parts.length >= 2) {
                String email = parts[0];
                String role = parts[1];
                
                User user = userService.getUserByEmail(email)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                
                Map<String, Object> response = new HashMap<>();
                response.put("valid", true);
                response.put("email", email);
                response.put("name", user.getName());
                response.put("role", role);
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.ok(Map.of("valid", false));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("valid", false));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/users/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        User updatedUser = userService.toggleUserStatus(id);
        return ResponseEntity.ok(updatedUser);
    }
}
