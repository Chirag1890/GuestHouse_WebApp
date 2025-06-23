package com.Application.GuestHouseBooking.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Entity
@Table(name = "booking")
@Data
@EntityListeners(AuditingEntityListener.class)
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true) // Made nullable for admin bookings
    private User user; // The user who made the booking (optional for admin bookings)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bed_id", nullable = false)
    private Bed bed; // The specific bed that is booked

    // Guest Information (Required for all bookings)
    @NotBlank(message = "First name is required")
    @Column(nullable = false)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Column(nullable = false)
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Column(nullable = false)
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be 10 digits")
    @Column(nullable = false)
    private String phoneNumber;

    @NotBlank(message = "Gender is required")
    @Column(nullable = false)
    private String gender;

    @NotBlank(message = "Address is required")
    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private LocalDate checkInDate;

    @Column(nullable = false)
    private LocalDate checkOutDate;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(columnDefinition = "TEXT")
    private String purpose; // Changed from specialRequests to purpose

    @Column(columnDefinition = "TEXT")
    private String rejectionReason; // Reason for denying the booking

    @Column(columnDefinition = "TEXT")
    private String cancellationReason; // Reason for cancelling the booking

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // --- Auditing fields (Added for Spring Data JPA Auditing) ---
    @CreatedBy // Automatically filled by AuditorAware
    @Column(nullable = false, updatable = false)
    private String createdBy;

    @LastModifiedBy // Automatically filled by AuditorAware on update
    @Column(nullable = false)
    private String lastModifiedBy;
    // --- End of Auditing fields ---

    public enum BookingStatus {
        PENDING, CONFIRMED, CANCELED, COMPLETED, DENIED
    }

    @Override
    public String toString() {
        return "Booking{" +
                "id=" + id +
                ", userId=" + (user != null ? user.getId() : null) +
                ", bedId=" + (bed != null ? bed.getId() : null) +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", status=" + status +
                '}';
    }
}