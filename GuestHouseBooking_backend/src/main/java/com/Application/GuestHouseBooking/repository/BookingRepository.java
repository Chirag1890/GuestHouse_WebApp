package com.Application.GuestHouseBooking.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.Application.GuestHouseBooking.entity.Booking;
import com.Application.GuestHouseBooking.entity.Booking.BookingStatus;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);

    List<Booking> findByBedId(Long bedId);

    // Find bookings by status
    List<Booking> findByStatus(BookingStatus status);

    // Find bookings by status and user
    List<Booking> findByStatusAndUserId(BookingStatus status, Long userId);

    // Custom query to find existing bookings for a specific BED within a date range
    @Query("SELECT b FROM Booking b WHERE b.bed.id = :bedId " +
           "AND b.status != 'CANCELLED' " +
           "AND b.checkOutDate > :checkInDate " +
           "AND b.checkInDate < :checkOutDate")
    List<Booking> findByBedIdAndCheckOutDateAfterAndCheckInDateBefore(
            @Param("bedId") Long bedId, 
            @Param("checkInDate") LocalDate checkInDate, 
            @Param("checkOutDate") LocalDate checkOutDate);

    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Booking b " +
           "WHERE b.bed.id = :bedId " +
           "AND b.status != 'CANCELLED' " +
           "AND ((b.checkInDate <= :checkOut AND b.checkOutDate >= :checkIn))")
    boolean existsByBedIdAndDateRange(
        @Param("bedId") Long bedId,
        @Param("checkIn") LocalDate checkIn,
        @Param("checkOut") LocalDate checkOut
    );

    // Get all active bookings (not cancelled or denied)
    @Query("SELECT b FROM Booking b WHERE b.status NOT IN ('CANCELLED', 'DENIED')")
    List<Booking> findAllActiveBookings();

    // New query to fetch all bookings with eager loading of related entities
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.bed bed " +
           "LEFT JOIN FETCH bed.room room " +
           "LEFT JOIN FETCH room.guestHouse gh " +
           "LEFT JOIN FETCH b.user")
    List<Booking> findAllWithDetails();

    // Get booking by ID with all details
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.bed bed " +
           "LEFT JOIN FETCH bed.room room " +
           "LEFT JOIN FETCH room.guestHouse gh " +
           "LEFT JOIN FETCH b.user " +
           "WHERE b.id = :id")
    Optional<Booking> findByIdWithDetails(@Param("id") Long id);

    // Get bookings by user ID with all details
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.bed bed " +
           "LEFT JOIN FETCH bed.room room " +
           "LEFT JOIN FETCH room.guestHouse gh " +
           "LEFT JOIN FETCH b.user " +
           "WHERE b.user.id = :userId")
    List<Booking> findByUserIdWithDetails(@Param("userId") Long userId);

    // Get bookings by bed ID with all details
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.bed bed " +
           "LEFT JOIN FETCH bed.room room " +
           "LEFT JOIN FETCH room.guestHouse gh " +
           "LEFT JOIN FETCH b.user " +
           "WHERE b.bed.id = :bedId")
    List<Booking> findByBedIdWithDetails(@Param("bedId") Long bedId);

    // Get bookings by status with all details
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.bed bed " +
           "LEFT JOIN FETCH bed.room room " +
           "LEFT JOIN FETCH room.guestHouse gh " +
           "LEFT JOIN FETCH b.user " +
           "WHERE b.status = :status")
    List<Booking> findByStatusWithDetails(@Param("status") BookingStatus status);

    // Get bookings by status and user ID with all details
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.bed bed " +
           "LEFT JOIN FETCH bed.room room " +
           "LEFT JOIN FETCH room.guestHouse gh " +
           "LEFT JOIN FETCH b.user " +
           "WHERE b.status = :status AND b.user.id = :userId")
    List<Booking> findByStatusAndUserIdWithDetails(@Param("status") BookingStatus status, @Param("userId") Long userId);

    // Get all active bookings with all details
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.bed bed " +
           "LEFT JOIN FETCH bed.room room " +
           "LEFT JOIN FETCH room.guestHouse gh " +
           "LEFT JOIN FETCH b.user " +
           "WHERE b.status NOT IN ('CANCELLED', 'DENIED')")
    List<Booking> findAllActiveBookingsWithDetails();

    Long countByStatus(BookingStatus status);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.checkInDate >= :startDate AND b.checkInDate <= :endDate")
    Long countBookingsInPeriod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b WHERE b.status = 'COMPLETED' AND b.checkOutDate >= :startDate AND b.checkOutDate <= :endDate")
    BigDecimal calculateTotalRevenue(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b WHERE b.status = 'COMPLETED'")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b")
    BigDecimal calculateTotalRevenueFromAllBookings();

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b WHERE b.status = :status")
    BigDecimal calculateTotalRevenueByStatus(@Param("status") BookingStatus status);

    @Query("SELECT COUNT(DISTINCT b.user.id) FROM Booking b WHERE b.status = 'COMPLETED' AND b.checkInDate >= :startDate AND b.checkInDate <= :endDate")
    Long countGuestVisits(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = 'COMPLETED' AND b.checkInDate >= :startDate AND b.checkInDate <= :endDate")
    Long countCheckIns(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(FUNCTION('DATEDIFF', CASE WHEN b.checkOutDate > :endDate THEN :endDate ELSE b.checkOutDate END, CASE WHEN b.checkInDate < :startDate THEN :startDate ELSE b.checkInDate END)), 0) FROM Booking b WHERE b.status = 'COMPLETED' AND ((b.checkInDate BETWEEN :startDate AND :endDate) OR (b.checkOutDate BETWEEN :startDate AND :endDate) OR (b.checkInDate <= :startDate AND b.checkOutDate >= :endDate))")
    Long calculateTotalNights(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b WHERE b.status IN ('CONFIRMED', 'COMPLETED')")
    BigDecimal calculateTotalRevenueFromApprovedBookings();

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b WHERE b.status IN ('CONFIRMED', 'COMPLETED') AND b.checkOutDate >= :startDate AND b.checkOutDate <= :endDate")
    BigDecimal calculateTotalRevenueFromApprovedBookings(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
