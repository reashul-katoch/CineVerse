package com.cineverse.auth.service;

import com.cineverse.auth.entity.User;
import com.cineverse.auth.repository.UserRepository;
import com.cineverse.auth.util.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User register(User user) {
        Optional<User> existing = userRepository.findByEmail(user.getEmail());
        if (existing.isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        // Encrypt the password before saving
        user.setPassword(PasswordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public String login(String email, String password, String role) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Match hashed password
        if (!PasswordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        if (!user.getRole().equalsIgnoreCase(role)) {
            throw new RuntimeException("Role mismatch for this account");
        }

        if ("Suspended".equalsIgnoreCase(user.getStatus())) {
            throw new RuntimeException("Account is suspended. Please contact admin.");
        }

        // Generate a simple secure-looking token: base64(email + ":" + role)
        String rawToken = user.getEmail() + ":" + user.getRole();
        return Base64.getEncoder().encodeToString(rawToken.getBytes());
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if ("Active".equalsIgnoreCase(user.getStatus())) {
            user.setStatus("Suspended");
        } else {
            user.setStatus("Active");
        }
        return userRepository.save(user);
    }

    // Initialize default users if db is empty (for SWC Assessment quick testing)
    public void initDefaultUsers() {
        if (userRepository.count() == 0) {
            userRepository.save(new User(null, "Naitik Pathak", "naitik@cineverse.com", PasswordEncoder.encode("123456"), "Admin", "Active"));
            userRepository.save(new User(null, "Alice Smith", "alice@cineverse.com", PasswordEncoder.encode("123456"), "User", "Active"));
            userRepository.save(new User(null, "Bob Jones", "bob@cineverse.com", PasswordEncoder.encode("123456"), "User", "Active"));
            userRepository.save(new User(null, "Cinema Manager", "manager@cineverse.com", PasswordEncoder.encode("123456"), "Theatre Owner", "Active"));
        }
    }
}
