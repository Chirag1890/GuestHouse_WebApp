package com.Application.GuestHouseBooking.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "user")
@Data
@EntityListeners(AuditingEntityListener.class)

public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    private String firstName;

    private String lastName;

    private String phoneNumber;

    @Enumerated(EnumType.STRING) // <<< IMPORTANT: Tells JPA to store enum as its String name
    @Column(nullable = false)
    private UserRole role;

    private String resetToken;
    
    @Column(columnDefinition = "TIMESTAMP")
    private LocalDateTime resetTokenExpiry;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(nullable = false, updatable = false) // user who created will not change
    private String createdBy;

    @LastModifiedBy
    @Column(nullable = false) // user who last modified can change
    private String lastModifiedBy;
    // --- END AUDITING FIELDS ---

    public enum UserRole {
        USER,      // Standard user role
        ADMIN,     // Administrator role
    }
}