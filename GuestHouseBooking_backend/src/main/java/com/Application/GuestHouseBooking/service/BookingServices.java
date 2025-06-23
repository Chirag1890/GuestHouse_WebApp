package com.Application.GuestHouseBooking.service;

import java.util.List;
import java.util.Optional;

import com.Application.GuestHouseBooking.dtos.BookingDTO;
import com.Application.GuestHouseBooking.entity.Booking.BookingStatus;

public interface BookingServices {
    BookingDTO createBooking(BookingDTO bookingDTO);
    Optional<BookingDTO> getBookingById(Long id);
    List<BookingDTO> getAllBookings();
    List<BookingDTO> getBookingsByUserId(Long userId);
    List<BookingDTO> getBookingsByBedId(Long bedId);
    Optional<BookingDTO> updateBooking(Long id, BookingDTO bookingDTO);
    boolean deleteBooking(Long id);
    List<BookingDTO> getBookingsByStatus(BookingStatus status);
    List<BookingDTO> getBookingsByStatusAndUserId(BookingStatus status, Long userId);
    List<BookingDTO> getActiveBookings();
}
