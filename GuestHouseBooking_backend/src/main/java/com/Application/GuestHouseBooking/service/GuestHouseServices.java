package com.Application.GuestHouseBooking.service;

import java.util.List;
import java.util.Optional;

import com.Application.GuestHouseBooking.dtos.GuestHouseDTO;

public interface GuestHouseServices {
    GuestHouseDTO createGuestHouse(GuestHouseDTO guestHouseDTO);
    Optional<GuestHouseDTO> getGuestHouseById(Long id);
    List<GuestHouseDTO> getAllGuestHouses();
    Optional<GuestHouseDTO> updateGuestHouse(Long id, GuestHouseDTO guestHouseDTO);
    boolean deleteGuestHouse(Long id);
    List<GuestHouseDTO> getAllGuestHousesWithRooms();
    List<GuestHouseDTO> getAllGuestHousesWithAvailableBeds();
}
