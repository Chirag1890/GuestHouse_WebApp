package com.Application.GuestHouseBooking.service;

import com.Application.GuestHouseBooking.dtos.RoomDTO;
import com.Application.GuestHouseBooking.entity.Room;

import java.util.List;
import java.util.Optional;

public interface RoomServices {
    RoomDTO createRoom(RoomDTO roomDTO);
    Optional<RoomDTO> getRoomById(Long id);
    List<RoomDTO> getAllRooms();
    List<RoomDTO> getRoomsByGuestHouseId(Long guestHouseId);
    Optional<RoomDTO> updateRoom(Long id, RoomDTO roomDTO);
    boolean deleteRoom(Long id);
}
