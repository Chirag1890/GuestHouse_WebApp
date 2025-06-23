package com.Application.GuestHouseBooking.dtos;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class RoomDTO {
    private Long id;
    private Long guestHouseId;
    private String roomNumber;
    private String description;
    private String amenities;
    private String imageUrl;
    private List<BedDTO> beds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String lastModifiedBy;
    
    // Additional fields for frontend display
    private String guestHouseName;
    private Integer totalBeds;
    private Integer availableBeds;
}