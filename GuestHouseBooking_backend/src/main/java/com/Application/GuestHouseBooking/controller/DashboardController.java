package com.Application.GuestHouseBooking.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Application.GuestHouseBooking.dtos.DashboardStatsDTO;
import com.Application.GuestHouseBooking.service.DashboardService;
import com.Application.GuestHouseBooking.repository.BookingRepository;
import com.Application.GuestHouseBooking.repository.GuestHouseRepository;
import com.Application.GuestHouseBooking.repository.RoomRepository;
import com.Application.GuestHouseBooking.repository.BedRepository;
import com.Application.GuestHouseBooking.repository.UserRepository;
import com.Application.GuestHouseBooking.entity.Booking.BookingStatus;
import com.Application.GuestHouseBooking.entity.Booking;
import com.Application.GuestHouseBooking.entity.Bed;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

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

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getOverallStatistics() {
        return ResponseEntity.ok(dashboardService.getOverallStatistics());
    }

    @GetMapping("/debug")
    public ResponseEntity<String> getDebugInfo() {
        StringBuilder debug = new StringBuilder();
        debug.append("=== Database Debug Info ===\n");
        debug.append("Total Guest Houses: ").append(guestHouseRepository.count()).append("\n");
        debug.append("Total Rooms: ").append(roomRepository.count()).append("\n");
        debug.append("Total Beds: ").append(bedRepository.count()).append("\n");
        debug.append("Available Beds: ").append(bedRepository.countAvailableBeds()).append("\n");
        debug.append("Occupied Beds: ").append(bedRepository.countOccupiedBeds()).append("\n");
        debug.append("Truly Available Beds: ").append(bedRepository.countTrulyAvailableBeds()).append("\n");
        debug.append("Beds with Active Bookings: ").append(bedRepository.countBedsWithActiveBookings()).append("\n");
        debug.append("Actually Available Beds: ").append(bedRepository.countActuallyAvailableBeds()).append("\n");
        debug.append("Total Users: ").append(userRepository.count()).append("\n");
        debug.append("Total Bookings: ").append(bookingRepository.count()).append("\n");
        debug.append("Pending Bookings: ").append(bookingRepository.countByStatus(BookingStatus.PENDING)).append("\n");
        debug.append("Confirmed Bookings: ").append(bookingRepository.countByStatus(BookingStatus.CONFIRMED)).append("\n");
        debug.append("Completed Bookings: ").append(bookingRepository.countByStatus(BookingStatus.COMPLETED)).append("\n");
        debug.append("Canceled Bookings: ").append(bookingRepository.countByStatus(BookingStatus.CANCELED)).append("\n");
        debug.append("Denied Bookings: ").append(bookingRepository.countByStatus(BookingStatus.DENIED)).append("\n");
        debug.append("Total Revenue (Completed): ").append(bookingRepository.calculateTotalRevenue()).append("\n");
        debug.append("Total Revenue (Approved - CONFIRMED + COMPLETED): ").append(bookingRepository.calculateTotalRevenueFromApprovedBookings()).append("\n");
        debug.append("==========================\n");
        
        return ResponseEntity.ok(debug.toString());
    }

    @GetMapping("/report")
    public ResponseEntity<DashboardStatsDTO> getPeriodReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(dashboardService.getPeriodReport(startDate, endDate));
    }

    @GetMapping("/test-data")
    public ResponseEntity<String> testDatabaseData() {
        StringBuilder result = new StringBuilder();
        result.append("=== Database Data Test ===\n");
        
        // Test if we can connect and get basic counts
        try {
            result.append("Guest Houses: ").append(guestHouseRepository.count()).append("\n");
            result.append("Rooms: ").append(roomRepository.count()).append("\n");
            result.append("Beds: ").append(bedRepository.count()).append("\n");
            result.append("Users: ").append(userRepository.count()).append("\n");
            result.append("Bookings: ").append(bookingRepository.count()).append("\n");
            
            // Test if we can get some actual data
            if (guestHouseRepository.count() > 0) {
                result.append("First Guest House: ").append(guestHouseRepository.findAll().get(0).getName()).append("\n");
            }
            
            if (bedRepository.count() > 0) {
                result.append("First Bed: ").append(bedRepository.findAll().get(0).getBedNumber()).append("\n");
                result.append("First Bed Available: ").append(bedRepository.findAll().get(0).getIsAvailableForBooking()).append("\n");
            }
            
            if (bookingRepository.count() > 0) {
                result.append("First Booking Status: ").append(bookingRepository.findAll().get(0).getStatus()).append("\n");
                result.append("First Booking Total Price: ").append(bookingRepository.findAll().get(0).getTotalPrice()).append("\n");
            }
            
        } catch (Exception e) {
            result.append("Error: ").append(e.getMessage()).append("\n");
            e.printStackTrace();
        }
        
        result.append("========================\n");
        return ResponseEntity.ok(result.toString());
    }

    @GetMapping("/revenue-breakdown")
    public ResponseEntity<String> getRevenueBreakdown() {
        StringBuilder result = new StringBuilder();
        result.append("=== Revenue Breakdown ===\n");
        
        try {
            // Get revenue from different booking statuses
            BigDecimal pendingRevenue = bookingRepository.calculateTotalRevenueByStatus(BookingStatus.PENDING);
            BigDecimal confirmedRevenue = bookingRepository.calculateTotalRevenueByStatus(BookingStatus.CONFIRMED);
            BigDecimal completedRevenue = bookingRepository.calculateTotalRevenueByStatus(BookingStatus.COMPLETED);
            BigDecimal canceledRevenue = bookingRepository.calculateTotalRevenueByStatus(BookingStatus.CANCELED);
            BigDecimal deniedRevenue = bookingRepository.calculateTotalRevenueByStatus(BookingStatus.DENIED);
            
            BigDecimal totalRevenue = bookingRepository.calculateTotalRevenueFromAllBookings();
            
            result.append("Total Revenue (All Bookings): $").append(totalRevenue).append("\n");
            result.append("Pending Revenue: $").append(pendingRevenue).append("\n");
            result.append("Confirmed Revenue: $").append(confirmedRevenue).append("\n");
            result.append("Completed Revenue: $").append(completedRevenue).append("\n");
            result.append("Canceled Revenue: $").append(canceledRevenue).append("\n");
            result.append("Denied Revenue: $").append(deniedRevenue).append("\n");
            
            // Show booking counts by status
            result.append("\n--- Booking Counts by Status ---\n");
            result.append("Pending: ").append(bookingRepository.countByStatus(BookingStatus.PENDING)).append("\n");
            result.append("Confirmed: ").append(bookingRepository.countByStatus(BookingStatus.CONFIRMED)).append("\n");
            result.append("Completed: ").append(bookingRepository.countByStatus(BookingStatus.COMPLETED)).append("\n");
            result.append("Canceled: ").append(bookingRepository.countByStatus(BookingStatus.CANCELED)).append("\n");
            result.append("Denied: ").append(bookingRepository.countByStatus(BookingStatus.DENIED)).append("\n");
            
        } catch (Exception e) {
            result.append("Error: ").append(e.getMessage()).append("\n");
            e.printStackTrace();
        }
        
        result.append("==========================\n");
        return ResponseEntity.ok(result.toString());
    }

    @GetMapping("/approved-revenue")
    public ResponseEntity<String> getApprovedRevenueBreakdown() {
        StringBuilder result = new StringBuilder();
        result.append("=== Approved Bookings Revenue Breakdown ===\n");
        
        try {
            // Get revenue from approved bookings (CONFIRMED and COMPLETED)
            BigDecimal confirmedRevenue = bookingRepository.calculateTotalRevenueByStatus(BookingStatus.CONFIRMED);
            BigDecimal completedRevenue = bookingRepository.calculateTotalRevenueByStatus(BookingStatus.COMPLETED);
            BigDecimal totalApprovedRevenue = bookingRepository.calculateTotalRevenueFromApprovedBookings();
            
            result.append("Total Approved Revenue (CONFIRMED + COMPLETED): $").append(totalApprovedRevenue).append("\n");
            result.append("Confirmed Bookings Revenue: $").append(confirmedRevenue).append("\n");
            result.append("Completed Bookings Revenue: $").append(completedRevenue).append("\n");
            
            // Show booking counts for approved statuses
            result.append("\n--- Approved Booking Counts ---\n");
            result.append("Confirmed Bookings: ").append(bookingRepository.countByStatus(BookingStatus.CONFIRMED)).append("\n");
            result.append("Completed Bookings: ").append(bookingRepository.countByStatus(BookingStatus.COMPLETED)).append("\n");
            result.append("Total Approved Bookings: ").append(bookingRepository.countByStatus(BookingStatus.CONFIRMED) + bookingRepository.countByStatus(BookingStatus.COMPLETED)).append("\n");
            
        } catch (Exception e) {
            result.append("Error: ").append(e.getMessage()).append("\n");
            e.printStackTrace();
        }
        
        result.append("==========================================\n");
        return ResponseEntity.ok(result.toString());
    }

    @GetMapping("/debug-beds")
    public ResponseEntity<String> getBedDebugInfo() {
        StringBuilder result = new StringBuilder();
        result.append("=== Bed Debug Information ===\n");
        
        try {
            List<Bed> allBeds = bedRepository.findAll();
            result.append("Total Beds in Database: ").append(allBeds.size()).append("\n\n");
            
            for (Bed bed : allBeds) {
                result.append("Bed ID: ").append(bed.getId()).append("\n");
                result.append("- Bed Number: ").append(bed.getBedNumber()).append("\n");
                result.append("- Room ID: ").append(bed.getRoom() != null ? bed.getRoom().getId() : "N/A").append("\n");
                result.append("- isAvailable: ").append(bed.getIsAvailable()).append("\n");
                result.append("- isAvailableForBooking: ").append(bed.getIsAvailableForBooking()).append("\n");
                result.append("- Price: ").append(bed.getPricePerNight()).append("\n");
                
                // Check for active bookings
                List<Booking> activeBookings = bookingRepository.findByBedId(bed.getId()).stream()
                    .filter(booking -> 
                        (booking.getStatus() == Booking.BookingStatus.PENDING ||
                         booking.getStatus() == Booking.BookingStatus.CONFIRMED ||
                         booking.getStatus() == Booking.BookingStatus.COMPLETED) &&
                        booking.getCheckOutDate().isAfter(java.time.LocalDate.now())
                    )
                    .collect(Collectors.toList());
                
                result.append("- Active Bookings: ").append(activeBookings.size()).append("\n");
                for (Booking booking : activeBookings) {
                    result.append("  * Booking ID: ").append(booking.getId())
                          .append(", Status: ").append(booking.getStatus())
                          .append(", Check-in: ").append(booking.getCheckInDate())
                          .append(", Check-out: ").append(booking.getCheckOutDate()).append("\n");
                }
                result.append("---\n");
            }
            
        } catch (Exception e) {
            result.append("Error: ").append(e.getMessage()).append("\n");
            e.printStackTrace();
        }
        
        result.append("==============================\n");
        return ResponseEntity.ok(result.toString());
    }

    @GetMapping("/test-bookings")
    public ResponseEntity<String> testBookings() {
        StringBuilder result = new StringBuilder();
        result.append("=== All Bookings with Prices ===\n");
        
        try {
            List<Booking> allBookings = bookingRepository.findAll();
            result.append("Total Bookings: ").append(allBookings.size()).append("\n\n");
            
            for (Booking booking : allBookings) {
                result.append("Booking ID: ").append(booking.getId()).append("\n");
                result.append("- Status: ").append(booking.getStatus()).append("\n");
                result.append("- Total Price: $").append(booking.getTotalPrice()).append("\n");
                result.append("- Check-in: ").append(booking.getCheckInDate()).append("\n");
                result.append("- Check-out: ").append(booking.getCheckOutDate()).append("\n");
                result.append("- User: ").append(booking.getUser() != null ? booking.getUser().getUsername() : "N/A").append("\n");
                result.append("- Bed: ").append(booking.getBed() != null ? booking.getBed().getBedNumber() : "N/A").append("\n");
                result.append("---\n");
            }
            
        } catch (Exception e) {
            result.append("Error: ").append(e.getMessage()).append("\n");
            e.printStackTrace();
        }
        
        result.append("==============================\n");
        return ResponseEntity.ok(result.toString());
    }

    @GetMapping("/test-bed-availability")
    public ResponseEntity<String> testBedAvailability() {
        StringBuilder result = new StringBuilder();
        result.append("=== Bed Availability Test ===\n");
        
        try {
            // Get initial bed availability
            Long initialAvailableBeds = bedRepository.countActuallyAvailableBeds();
            result.append("Initial Available Beds: ").append(initialAvailableBeds).append("\n");
            
            // Find a bed that's available
            List<Bed> availableBeds = bedRepository.findAll().stream()
                .filter(bed -> bed.getIsAvailable() && bed.getIsAvailableForBooking())
                .collect(Collectors.toList());
            
            if (availableBeds.isEmpty()) {
                result.append("No available beds found for testing\n");
                return ResponseEntity.ok(result.toString());
            }
            
            Bed testBed = availableBeds.get(0);
            result.append("Selected Test Bed ID: ").append(testBed.getId()).append("\n");
            result.append("Test Bed Number: ").append(testBed.getBedNumber()).append("\n");
            result.append("Test Bed isAvailable: ").append(testBed.getIsAvailable()).append("\n");
            result.append("Test Bed isAvailableForBooking: ").append(testBed.getIsAvailableForBooking()).append("\n");
            
            // Mark bed as booked
            testBed.markAsBooked();
            bedRepository.save(testBed);
            result.append("Bed marked as booked\n");
            
            // Check availability after marking as booked
            Long afterBookingAvailableBeds = bedRepository.countActuallyAvailableBeds();
            result.append("Available Beds After Booking: ").append(afterBookingAvailableBeds).append("\n");
            
            // Mark bed as available again
            testBed.markAsAvailable();
            bedRepository.save(testBed);
            result.append("Bed marked as available again\n");
            
            // Check final availability
            Long finalAvailableBeds = bedRepository.countActuallyAvailableBeds();
            result.append("Final Available Beds: ").append(finalAvailableBeds).append("\n");
            
        } catch (Exception e) {
            result.append("Error: ").append(e.getMessage()).append("\n");
            e.printStackTrace();
        }
        
        result.append("============================\n");
        return ResponseEntity.ok(result.toString());
    }
} 