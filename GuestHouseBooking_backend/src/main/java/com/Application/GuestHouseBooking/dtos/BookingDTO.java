package com.Application.GuestHouseBooking.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.Application.GuestHouseBooking.entity.Booking;

import lombok.Data;

@Data
public class BookingDTO {
    private Long id;
    private Long userId;
    private Long bedId;
    private Long roomId;
    private Long guestHouseId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Booking.BookingStatus status;
    private BigDecimal totalPrice;
    private String purpose;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String lastModifiedBy;
    
    // Additional fields for frontend display
    private String userName;
    private String bedNumber;
    private String roomNumber;
    private String guestHouseName;
    
    // Guest Information fields
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String gender;
    private String address;
    
    // Status change reason fields
    private String rejectionReason;
    private String cancellationReason;
}
