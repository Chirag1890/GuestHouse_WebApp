package com.Application.GuestHouseBooking.service.implementations;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.Application.GuestHouseBooking.dtos.UserDTO;
import com.Application.GuestHouseBooking.entity.User;
import com.Application.GuestHouseBooking.repository.UserRepository;
import com.Application.GuestHouseBooking.service.UserServices;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class UserServiceImplementations implements UserServices {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogServices auditLogService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole());
        dto.setIsEnabled(true);
        dto.setIsAccountNonLocked(true);
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setCreatedBy(user.getCreatedBy());
        dto.setLastModifiedBy(user.getLastModifiedBy());
        
        // Set additional display fields
        dto.setFullName(user.getFirstName() + " " + user.getLastName());
        
        // TODO: Calculate booking statistics if needed
        // For now, set default values
        dto.setTotalBookings(0);
        dto.setActiveBookings(0);
        
        return dto;
    }

    private User convertToEntity(UserDTO userDTO) {
        User user = new User();
        user.setId(userDTO.getId());
        user.setUsername(userDTO.getUsername());
        user.setPassword(userDTO.getPassword());
        user.setEmail(userDTO.getEmail());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setPhoneNumber(userDTO.getPhoneNumber());
        return user;
    }


    @Override
    public UserDTO createUser(UserDTO userDTO) {
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new RuntimeException("Username already exists: " + userDTO.getUsername());
        }
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new RuntimeException("Email already exists: " + userDTO.getEmail());
        }

        User user = convertToEntity(userDTO);
        if (user.getRole() == null) {
            user.setRole(User.UserRole.USER);
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        try {
            auditLogService.logAudit(
                    "User",
                    savedUser.getId(),
                    "CREATE",
                    savedUser.getCreatedBy(),
                    null,
                    objectMapper.writeValueAsString(savedUser),
                    "New User registered"
            );
        } catch (Exception e) {
            System.err.println("Failed to log audit for User creation: " + e.getMessage());
        }
        // --- End Audit Log ---

        return convertToDTO(savedUser);
    }

    public Optional<UserDTO> getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::convertToDTO);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<UserDTO> updateUser(Long id, UserDTO userDTO) {
        Optional<User> existingUserOptional = userRepository.findById(id);
        if (existingUserOptional.isPresent()) {
            User existingUser = existingUserOptional.get();

            // Update fields from DTO to existing entity
            existingUser.setUsername(userDTO.getUsername());
            // Only update password if provided and not null, and ensure encoding
            if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
                existingUser.setPassword(passwordEncoder.encode(userDTO.getPassword())); // <<< Encode password on update!
            }
            existingUser.setEmail(userDTO.getEmail());
            existingUser.setFirstName(userDTO.getFirstName());
            existingUser.setLastName(userDTO.getLastName());
            existingUser.setPhoneNumber(userDTO.getPhoneNumber());

            User updatedUser = userRepository.save(existingUser);
            return Optional.of(convertToDTO(updatedUser));
        }
        return Optional.empty();
    }

    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
