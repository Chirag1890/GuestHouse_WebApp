package com.Application.GuestHouseBooking.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BedDTO {
    private Long id;
    
    @NotNull(message = "Room ID is required")
    private Long roomId;
    
    @NotBlank(message = "Bed number is required")
    private String bedNumber;
    
    @NotNull(message = "Availability status is required")
    private Boolean isAvailable;
    
    @NotNull(message = "Availability for booking status is required")
    private Boolean isAvailableForBooking;
    
    @NotNull(message = "Price per night is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal pricePerNight;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String lastModifiedBy;
}
