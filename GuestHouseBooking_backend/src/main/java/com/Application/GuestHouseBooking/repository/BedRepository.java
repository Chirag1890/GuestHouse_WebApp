package com.Application.GuestHouseBooking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.Application.GuestHouseBooking.entity.Bed;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {
    List<Bed> findByRoomId(Long roomId);
    
    Optional<Bed> findByBedNumber(String bedNumber);
    
    @Query("SELECT COUNT(b) FROM Bed b WHERE b.isAvailableForBooking = false")
    Long countOccupiedBeds();
    
    @Query("SELECT COUNT(b) FROM Bed b WHERE b.isAvailableForBooking = true")
    Long countAvailableBeds();
    
    // More accurate count of truly available beds (not just flag-based)
    @Query("SELECT COUNT(b) FROM Bed b WHERE b.isAvailableForBooking = true AND b.isAvailable = true")
    Long countTrulyAvailableBeds();
    
    // Count beds that are currently booked (have active bookings)
    @Query("SELECT COUNT(DISTINCT b.id) FROM Bed b JOIN Booking bk ON b.id = bk.bed.id " +
           "WHERE bk.status IN ('PENDING', 'CONFIRMED', 'COMPLETED') " +
           "AND bk.checkOutDate >= CURRENT_DATE")
    Long countBedsWithActiveBookings();
    
    // Most accurate count: available beds minus those with active bookings
    @Query("SELECT COUNT(b) FROM Bed b WHERE b.isAvailableForBooking = true AND b.isAvailable = true " +
           "AND b.id NOT IN (SELECT DISTINCT bk.bed.id FROM Booking bk " +
           "WHERE bk.status IN ('PENDING', 'CONFIRMED', 'COMPLETED') " +
           "AND bk.checkOutDate >= CURRENT_DATE)")
    Long countActuallyAvailableBeds();
}