package com.Application.GuestHouseBooking.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.Application.GuestHouseBooking.dtos.BedDTO;

public interface BedServices {
    BedDTO createBed(BedDTO bedDTO);
    Optional<BedDTO> getBedById(Long id);
    List<BedDTO> getAllBeds();
    List<BedDTO> getBedsByRoomId(Long roomId);
    Optional<BedDTO> updateBed(Long id, BedDTO bedDTO);
    boolean deleteBed(Long id);
    List<BedDTO> getAvailableBeds(Long roomId, LocalDate checkIn, LocalDate checkOut);
    void updateBedAvailabilityForCompletedBookings();
}
