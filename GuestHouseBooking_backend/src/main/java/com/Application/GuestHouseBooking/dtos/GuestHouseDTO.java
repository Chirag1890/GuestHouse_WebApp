package com.Application.GuestHouseBooking.dtos;

import java.time.LocalDateTime;

import lombok.Data;

@Data

public class GuestHouseDTO {
    private Long id;
    private String name;
    private String address;
    private String city;
    private String state;
    private String country;
    private String description;
    private String amenities;
    private String contactNumber;
    private String email;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String lastModifiedBy;
    
    // Additional fields for frontend display
    private Integer totalRooms;
    private Integer totalBeds;
    private Integer availableBeds;
}
