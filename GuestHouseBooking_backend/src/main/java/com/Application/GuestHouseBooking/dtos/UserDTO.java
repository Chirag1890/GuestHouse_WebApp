package com.Application.GuestHouseBooking.dtos;

import java.time.LocalDateTime;

import com.Application.GuestHouseBooking.entity.User;

import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String password;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private User.UserRole role;
    private Boolean isEnabled;
    private Boolean isAccountNonLocked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String lastModifiedBy;
    
    // Additional fields for frontend display
    private String fullName;
    private Integer totalBookings;
    private Integer activeBookings;
}
