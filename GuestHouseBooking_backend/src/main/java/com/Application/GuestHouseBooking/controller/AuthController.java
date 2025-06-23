package com.Application.GuestHouseBooking.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.Application.GuestHouseBooking.Authentication.AuthRequest;
import com.Application.GuestHouseBooking.Config.JwtUtil;
import com.Application.GuestHouseBooking.MailServices.MailService;
import com.Application.GuestHouseBooking.dto.PasswordResetDTO;
import com.Application.GuestHouseBooking.entity.User;
import com.Application.GuestHouseBooking.repository.UserRepository;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/auth") // Remove 'api' from here since SecurityConfig already has it
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService; // Your custom UserDetailsService implementation

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository; // Add this

    @Autowired
    private MailService mailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Handles user login and generates a JWT upon successful authentication.
     * Accessible at /auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequest authRequest) {
        logger.debug("Login attempt for email: {}", authRequest.getEmail());
        
        try {
            // Validate input
            if (authRequest.getEmail() == null || authRequest.getEmail().trim().isEmpty() ||
                authRequest.getPassword() == null || authRequest.getPassword().trim().isEmpty()) {
                logger.warn("Login attempt with empty email or password");
                return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required"));
            }

            // Find user by email
            User user = userRepository.findByEmail(authRequest.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + authRequest.getEmail()));

            // Authenticate user using username (email will be mapped to username internally)
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    user.getUsername(),
                    authRequest.getPassword()
                )
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate JWT token
            final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
            final String jwt = jwtUtil.generateToken(userDetails);

            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("role", user.getRole().name());
            response.put("id", user.getId());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());

            logger.info("Successful login for email: {}", authRequest.getEmail());
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            logger.warn("Failed login attempt for email: {} - Bad credentials", authRequest.getEmail());
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        } catch (DisabledException e) {
            logger.warn("Failed login attempt for email: {} - Account disabled", authRequest.getEmail());
            return ResponseEntity.status(401).body(Map.of("message", "Account is disabled"));
        } catch (UsernameNotFoundException e) {
            logger.warn("Failed login attempt - User not found: {}", authRequest.getEmail());
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        } catch (Exception e) {
            logger.error("Login error for email: {} - {}", authRequest.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("message", "An error occurred during login"));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        logger.debug("Token refresh request received");
        
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.warn("Invalid authorization header format");
                return ResponseEntity.status(401).body(Map.of("message", "Invalid authorization header"));
            }

            String oldToken = authHeader.substring(7);
            
            if (jwtUtil.isTokenBlacklisted(oldToken)) {
                logger.warn("Attempt to refresh blacklisted token");
                return ResponseEntity.status(401).body(Map.of("message", "Token is blacklisted"));
            }

            String username = jwtUtil.extractUsername(oldToken);
            if (username == null) {
                logger.warn("Could not extract username from token");
                return ResponseEntity.status(401).body(Map.of("message", "Invalid token"));
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            String newToken = jwtUtil.generateToken(userDetails);
            jwtUtil.invalidateToken(oldToken);

            logger.info("Token refreshed successfully for user: {}", username);
            return ResponseEntity.ok(Map.of("token", newToken));

        } catch (Exception e) {
            logger.error("Error refreshing token: {}", e.getMessage(), e);
            return ResponseEntity.status(401).body(Map.of("message", "Token refresh failed"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        logger.debug("Logout request received");
        
        try {
            SecurityContextHolder.clearContext();
            
            if (token != null && token.startsWith("Bearer ")) {
                String jwt = token.substring(7);
                jwtUtil.invalidateToken(jwt);
                logger.info("User logged out successfully");
            }
            
            return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
        } catch (Exception e) {
            logger.error("Error during logout: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("message", "Error during logout"));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody PasswordResetDTO request) {
        try {
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + request.getEmail()));

            // Generate reset token
            String token = UUID.randomUUID().toString();
            user.setResetToken(token);
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(24)); // Token valid for 24 hours
            userRepository.save(user);

            // Send email with reset link
            mailService.sendPasswordResetEmail(user.getEmail(), token);

            return ResponseEntity.ok(Map.of("message", "Password reset instructions sent to your email"));
        } catch (UsernameNotFoundException e) {
            // Return same message even if email doesn't exist (security best practice)
            return ResponseEntity.ok(Map.of("message", "If your email exists in our system, you will receive password reset instructions"));
        } catch (Exception e) {
            logger.error("Error in forgot password: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("message", "Error processing request"));
        }
    }

    @GetMapping("/validate-reset-token/{token}")
    public ResponseEntity<?> validateResetToken(@PathVariable String token) {
        try {
            User user = userRepository.findByResetTokenAndResetTokenExpiryAfter(token, LocalDateTime.now())
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
            return ResponseEntity.ok(Map.of("valid", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "message", "Invalid or expired token"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetDTO request) {
        try {
            User user = userRepository.findByResetTokenAndResetTokenExpiryAfter(request.getToken(), LocalDateTime.now())
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

            // Update password
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Password has been reset successfully"));
        } catch (Exception e) {
            logger.error("Error in reset password: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired token"));
        }
    }

    // You might also have a registration endpoint here if it's not handled elsewhere,
    // e.g., @PostMapping("/register")
}