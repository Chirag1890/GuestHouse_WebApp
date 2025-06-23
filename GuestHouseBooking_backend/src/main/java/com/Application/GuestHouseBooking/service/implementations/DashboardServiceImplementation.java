package com.Application.GuestHouseBooking.service.implementations;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Application.GuestHouseBooking.dtos.DashboardStatsDTO;
import com.Application.GuestHouseBooking.repository.BookingRepository;
import com.Application.GuestHouseBooking.repository.GuestHouseRepository;
import com.Application.GuestHouseBooking.repository.RoomRepository;
import com.Application.GuestHouseBooking.repository.BedRepository;
import com.Application.GuestHouseBooking.repository.UserRepository;
import com.Application.GuestHouseBooking.service.DashboardService;
import com.Application.GuestHouseBooking.entity.Booking.BookingStatus;
import com.Application.GuestHouseBooking.entity.Booking;

@Service
public class DashboardServiceImplementation implements DashboardService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private GuestHouseRepository guestHouseRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BedRepository bedRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public DashboardStatsDTO getOverallStatistics() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        // Update bed availability for completed bookings first
        try {
            // This will update beds that have completed bookings with past checkout dates
            bedRepository.findAll().forEach(bed -> {
                // Check if bed has any completed bookings with past checkout dates
                List<Booking> completedBookings = bookingRepository.findByBedId(bed.getId()).stream()
                    .filter(booking -> 
                        booking.getStatus() == Booking.BookingStatus.COMPLETED &&
                        booking.getCheckOutDate().isBefore(java.time.LocalDate.now())
                    )
                    .collect(Collectors.toList());
                
                if (!completedBookings.isEmpty()) {
                    // Check if bed has any active bookings (future dates)
                    boolean hasActiveBookings = bookingRepository.findByBedId(bed.getId()).stream()
                        .anyMatch(booking -> 
                            (booking.getStatus() == Booking.BookingStatus.PENDING ||
                             booking.getStatus() == Booking.BookingStatus.CONFIRMED ||
                             booking.getStatus() == Booking.BookingStatus.COMPLETED) &&
                            booking.getCheckOutDate().isAfter(java.time.LocalDate.now())
                        );
                    
                    if (!hasActiveBookings) {
                        bed.markAsAvailable();
                        bedRepository.save(bed);
                        System.out.println("Dashboard: Bed ID " + bed.getId() + " marked as available (completed bookings)");
                    }
                }
            });
        } catch (Exception e) {
            System.err.println("Error updating bed availability: " + e.getMessage());
        }

        // Get counts from repositories using JPQL queries
        Long totalGuestHouses = guestHouseRepository.count();
        Long totalRooms = roomRepository.count();
        Long totalBeds = bedRepository.count();
        Long occupiedBeds = bedRepository.countOccupiedBeds();
        Long availableBeds = bedRepository.countAvailableBeds();
        Long trulyAvailableBeds = bedRepository.countTrulyAvailableBeds();
        Long bedsWithActiveBookings = bedRepository.countBedsWithActiveBookings();
        Long actuallyAvailableBeds = bedRepository.countActuallyAvailableBeds();
        Long totalUsers = userRepository.count();
        Long totalBookings = bookingRepository.count();
        Long pendingBookings = bookingRepository.countByStatus(BookingStatus.PENDING);
        Long confirmedBookings = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        Long completedBookings = bookingRepository.countByStatus(BookingStatus.COMPLETED);
        Long canceledBookings = bookingRepository.countByStatus(BookingStatus.CANCELED);
        Long deniedBookings = bookingRepository.countByStatus(BookingStatus.DENIED);
        BigDecimal totalRevenue = bookingRepository.calculateTotalRevenue();

        // Debug logging
        System.out.println("=== Dashboard Statistics Debug ===");
        System.out.println("Total Guest Houses: " + totalGuestHouses);
        System.out.println("Total Rooms: " + totalRooms);
        System.out.println("Total Beds: " + totalBeds);
        System.out.println("Occupied Beds (flag-based): " + occupiedBeds);
        System.out.println("Available Beds (flag-based): " + availableBeds);
        System.out.println("Truly Available Beds: " + trulyAvailableBeds);
        System.out.println("Beds with Active Bookings: " + bedsWithActiveBookings);
        System.out.println("Actually Available Beds (most accurate): " + actuallyAvailableBeds);
        System.out.println("Total Users: " + totalUsers);
        System.out.println("Total Bookings: " + totalBookings);
        System.out.println("Pending Bookings: " + pendingBookings);
        System.out.println("Confirmed Bookings: " + confirmedBookings);
        System.out.println("Completed Bookings: " + completedBookings);
        System.out.println("Canceled Bookings: " + canceledBookings);
        System.out.println("Denied Bookings: " + deniedBookings);
        System.out.println("Total Revenue: " + totalRevenue);
        System.out.println("==================================");

        // Set the values
        stats.setTotalGuestHouses(totalGuestHouses);
        stats.setTotalRooms(totalRooms);
        stats.setTotalBeds(totalBeds);
        stats.setOccupiedBeds(occupiedBeds);
        stats.setAvailableBeds(actuallyAvailableBeds);
        stats.setTotalUsers(totalUsers);
        stats.setTotalBookings(totalBookings);
        stats.setPendingBookings(pendingBookings);
        stats.setConfirmedBookings(confirmedBookings);
        stats.setCompletedBookings(completedBookings);
        stats.setCanceledBookings(canceledBookings);
        stats.setDeniedBookings(deniedBookings);
        
        // Active bookings are confirmed bookings that haven't been completed yet
        stats.setActiveBookings(confirmedBookings);

        // Calculate total revenue from all completed bookings
        stats.setTotalRevenue(bookingRepository.calculateTotalRevenue());
        
        // For testing: Also calculate revenue from all bookings
        BigDecimal totalRevenueFromAllBookings = bookingRepository.calculateTotalRevenueFromAllBookings();
        System.out.println("Revenue from completed bookings: " + stats.getTotalRevenue());
        System.out.println("Revenue from all bookings: " + totalRevenueFromAllBookings);
        
        // For testing purposes, use revenue from all bookings if completed revenue is 0
        if (stats.getTotalRevenue().equals(BigDecimal.ZERO) && totalRevenueFromAllBookings.compareTo(BigDecimal.ZERO) > 0) {
            stats.setTotalRevenue(totalRevenueFromAllBookings);
            System.out.println("Using revenue from all bookings for testing");
        }

        // Calculate total revenue from approved bookings (CONFIRMED and COMPLETED)
        BigDecimal totalRevenueFromApprovedBookings = bookingRepository.calculateTotalRevenueFromApprovedBookings();
        stats.setTotalRevenue(totalRevenueFromApprovedBookings);
        System.out.println("Revenue from approved bookings (CONFIRMED + COMPLETED): " + totalRevenueFromApprovedBookings);

        return stats;
    }

    @Override
    public DashboardStatsDTO getPeriodReport(LocalDate startDate, LocalDate endDate) {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        // Get period-specific statistics using repository methods
        stats.setTotalRevenue(bookingRepository.calculateTotalRevenue(startDate, endDate));
        stats.setTotalGuestVisits(bookingRepository.countGuestVisits(startDate, endDate));
        stats.setTotalCheckIns(bookingRepository.countCheckIns(startDate, endDate));
        stats.setTotalNightsCompleted(bookingRepository.calculateTotalNights(startDate, endDate));
        
        // Calculate averages
        Long totalBookings = bookingRepository.countBookingsInPeriod(startDate, endDate);
        if (totalBookings > 0) {
            BigDecimal totalRev = bookingRepository.calculateTotalRevenue(startDate, endDate);
            stats.setAverageBookingValue(totalRev.divide(BigDecimal.valueOf(totalBookings), 2, java.math.RoundingMode.HALF_UP));
            
            Long totalNights = bookingRepository.calculateTotalNights(startDate, endDate);
            stats.setAverageStayDuration(totalNights / totalBookings);
        }

        // Use approved bookings revenue for period report
        BigDecimal approvedRevenue = bookingRepository.calculateTotalRevenueFromApprovedBookings(startDate, endDate);
        stats.setTotalRevenue(approvedRevenue);
        System.out.println("Period Revenue from approved bookings: " + approvedRevenue);

        return stats;
    }
} 