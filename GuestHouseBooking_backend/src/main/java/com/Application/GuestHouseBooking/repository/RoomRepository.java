package com.Application.GuestHouseBooking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.Application.GuestHouseBooking.entity.Room;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByGuestHouseId(Long guestHouseId);

    // Custom query to find a specific room by its number within a guest house
    Optional<Room> findByGuestHouseIdAndRoomNumber(Long guestHouseId, String roomNumber);

    @Query("SELECT r FROM Room r LEFT JOIN FETCH r.beds b WHERE r.guestHouse.id = :guestHouseId AND b.isAvailableForBooking = true")
    List<Room> findAvailableRoomsByGuestHouseId(@Param("guestHouseId") Long guestHouseId);

    @Query("SELECT r FROM Room r LEFT JOIN FETCH r.beds WHERE r.guestHouse.id = :guestHouseId")
    List<Room> findRoomsWithBedsByGuestHouseId(@Param("guestHouseId") Long guestHouseId);

    @Query("SELECT COUNT(b) FROM Room r JOIN r.beds b WHERE r.id = :roomId AND b.isAvailableForBooking = true")
    Long countAvailableBedsByRoomId(@Param("roomId") Long roomId);
}
