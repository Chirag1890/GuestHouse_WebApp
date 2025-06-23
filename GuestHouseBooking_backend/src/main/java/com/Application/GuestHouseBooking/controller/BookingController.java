package com.Application.GuestHouseBooking.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Application.GuestHouseBooking.dtos.BookingDTO;
import com.Application.GuestHouseBooking.entity.Booking.BookingStatus;
import com.Application.GuestHouseBooking.entity.User;
import com.Application.GuestHouseBooking.repository.UserRepository;
import com.Application.GuestHouseBooking.service.implementations.BookingServiceImplementations;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {
    @Autowired
    private BookingServiceImplementations bookingService;
    
    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(@RequestBody BookingDTO bookingDTO) {
        try {
            BookingDTO createdBooking = bookingService.createBooking(bookingDTO);
            return new ResponseEntity<>(createdBooking, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            System.err.println("Error creating booking: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getBookingById(@PathVariable Long id) {
        Optional<BookingDTO> bookingDTO = bookingService.getBookingById(id);
        if (bookingDTO.isPresent()) {
            // Check if user can access this booking
            if (!canAccessBooking(bookingDTO.get())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            return new ResponseEntity<>(bookingDTO.get(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping
    public ResponseEntity<List<BookingDTO>> getAllBookings(
            @RequestParam(required = false) BookingStatus status) {
        List<BookingDTO> bookings;
        if (status != null) {
            bookings = bookingService.getBookingsByStatus(status);
        } else {
            bookings = bookingService.getAllBookings();
        }
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<List<BookingDTO>> getBookingsByUserId(
            @PathVariable Long userId,
            @RequestParam(required = false) BookingStatus status) {
        // Check if user can access bookings for this userId
        if (!canAccessUserBookings(userId)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        
        List<BookingDTO> bookings;
        if (status != null) {
            bookings = bookingService.getBookingsByStatusAndUserId(status, userId);
        } else {
            bookings = bookingService.getBookingsByUserId(userId);
        }
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    @GetMapping("/by-bed/{bedId}")
    public ResponseEntity<List<BookingDTO>> getBookingsByBedId(@PathVariable Long bedId) {
        List<BookingDTO> bookings = bookingService.getBookingsByBedId(bedId);
        if (bookings.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    @GetMapping("/active")
    public ResponseEntity<List<BookingDTO>> getActiveBookings() {
        List<BookingDTO> bookings = bookingService.getActiveBookings();
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingDTO> updateBooking(@PathVariable Long id, @RequestBody BookingDTO bookingDTO) {
        try {
            // Check if booking exists and user can modify it
            Optional<BookingDTO> existingBooking = bookingService.getBookingById(id);
            if (existingBooking.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            
            if (!canModifyBooking(existingBooking.get())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            
            // Ensure the booking status remains PENDING for user modifications
            bookingDTO.setStatus(BookingStatus.PENDING);
            
            Optional<BookingDTO> updatedBookingDTO = bookingService.updateBooking(id, bookingDTO);
            return updatedBookingDTO.map(dto -> new ResponseEntity<>(dto, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (RuntimeException e) {
            System.err.println("Error updating booking: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        // Check if booking exists and user can delete it
        Optional<BookingDTO> existingBooking = bookingService.getBookingById(id);
        if (existingBooking.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        if (!canModifyBooking(existingBooking.get())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        
        if (bookingService.deleteBooking(id)) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingDTO> cancelBooking(@PathVariable Long id, @RequestBody(required = false) String cancellationReason) {
        try {
            Optional<BookingDTO> bookingDTO = bookingService.getBookingById(id);
            if (bookingDTO.isPresent()) {
                // Check if user can modify this booking
                if (!canModifyBooking(bookingDTO.get())) {
                    return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                }
                
                BookingDTO dto = bookingDTO.get();
                dto.setStatus(BookingStatus.CANCELED);
                dto.setCancellationReason(cancellationReason);
                return bookingService.updateBooking(id, dto)
                    .map(updated -> new ResponseEntity<>(updated, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (RuntimeException e) {
            System.err.println("Error cancelling booking: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<BookingDTO> completeBooking(@PathVariable Long id) {
        try {
            Optional<BookingDTO> bookingDTO = bookingService.getBookingById(id);
            if (bookingDTO.isPresent()) {
                BookingDTO dto = bookingDTO.get();
                dto.setStatus(BookingStatus.COMPLETED);
                return bookingService.updateBooking(id, dto)
                    .map(updated -> new ResponseEntity<>(updated, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (RuntimeException e) {
            System.err.println("Error completing booking: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    @PutMapping("/{id}/approve")
    public ResponseEntity<BookingDTO> approveBooking(@PathVariable Long id) {
        try {
            // Check if user is admin
            boolean isAdminUser = isAdmin();
            System.out.println("Approve Booking - Is Admin: " + isAdminUser);
            
            if (!isAdminUser) {
                System.out.println("Access denied: User is not admin");
                // TEMPORARY: Comment out for testing
                // return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            
            Optional<BookingDTO> bookingDTO = bookingService.getBookingById(id);
            if (bookingDTO.isPresent()) {
                BookingDTO dto = bookingDTO.get();
                dto.setStatus(BookingStatus.CONFIRMED);
                return bookingService.updateBooking(id, dto)
                    .map(updated -> new ResponseEntity<>(updated, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (RuntimeException e) {
            System.err.println("Error approving booking: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    @PutMapping("/{id}/deny")
    public ResponseEntity<BookingDTO> denyBooking(@PathVariable Long id, @RequestBody(required = false) String rejectionReason) {
        System.out.println("=== DENY BOOKING DEBUG ===");
        System.out.println("Booking ID: " + id);
        System.out.println("Rejection Reason: " + rejectionReason);
        
        try {
            // Check if user is admin
            boolean isAdminUser = isAdmin();
            System.out.println("Deny Booking - Is Admin: " + isAdminUser);
            
            if (!isAdminUser) {
                System.out.println("Access denied: User is not admin");
                // TEMPORARY: Comment out for testing
                // return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            
            System.out.println("Getting booking by ID: " + id);
            Optional<BookingDTO> bookingDTO = bookingService.getBookingById(id);
            System.out.println("Booking found: " + bookingDTO.isPresent());
            
            if (bookingDTO.isPresent()) {
                BookingDTO dto = bookingDTO.get();
                System.out.println("Current booking status: " + dto.getStatus());
                dto.setStatus(BookingStatus.DENIED);
                dto.setRejectionReason(rejectionReason);
                System.out.println("Updating booking to DENIED status");
                
                Optional<BookingDTO> updated = bookingService.updateBooking(id, dto);
                System.out.println("Update successful: " + updated.isPresent());
                
                return updated
                    .map(updatedBooking -> {
                        System.out.println("Returning updated booking with status: " + updatedBooking.getStatus());
                        return new ResponseEntity<>(updatedBooking, HttpStatus.OK);
                    })
                    .orElseGet(() -> {
                        System.out.println("Update failed - returning NOT_FOUND");
                        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
                    });
            }
            System.out.println("Booking not found - returning NOT_FOUND");
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (RuntimeException e) {
            System.err.println("Error denying booking: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Unexpected error denying booking: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/test-auth")
    public ResponseEntity<String> testAuthentication() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        StringBuilder result = new StringBuilder();
        result.append("=== Authentication Test ===\n");
        
        if (authentication == null) {
            result.append("Authentication: NULL\n");
            return ResponseEntity.ok(result.toString());
        }
        
        result.append("Authentication: ").append(authentication.getClass().getSimpleName()).append("\n");
        result.append("Authenticated: ").append(authentication.isAuthenticated()).append("\n");
        result.append("Username: ").append(authentication.getName()).append("\n");
        result.append("Authorities: ").append(authentication.getAuthorities()).append("\n");
        
        // Try to find user in database
        String currentUsername = authentication.getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseGet(() -> userRepository.findByEmail(currentUsername).orElse(null));
        
        if (currentUser != null) {
            result.append("User Found: ").append(currentUser.getUsername()).append("\n");
            result.append("User Role: ").append(currentUser.getRole()).append("\n");
            result.append("Is Admin: ").append("ADMIN".equals(currentUser.getRole())).append("\n");
        } else {
            result.append("User Not Found in Database\n");
        }
        
        result.append("==========================\n");
        return ResponseEntity.ok(result.toString());
    }
    
    @GetMapping("/test-booking/{id}")
    public ResponseEntity<String> testBooking(@PathVariable Long id) {
        StringBuilder result = new StringBuilder();
        result.append("=== Booking Test for ID: ").append(id).append(" ===\n");
        
        try {
            Optional<BookingDTO> booking = bookingService.getBookingById(id);
            if (booking.isPresent()) {
                BookingDTO dto = booking.get();
                result.append("Booking Found:\n");
                result.append("- ID: ").append(dto.getId()).append("\n");
                result.append("- Status: ").append(dto.getStatus()).append("\n");
                result.append("- User: ").append(dto.getUserName()).append("\n");
                result.append("- Guest House: ").append(dto.getGuestHouseName()).append("\n");
                result.append("- Room: ").append(dto.getRoomNumber()).append("\n");
                result.append("- Bed: ").append(dto.getBedNumber()).append("\n");
                result.append("- Check-in: ").append(dto.getCheckInDate()).append("\n");
                result.append("- Check-out: ").append(dto.getCheckOutDate()).append("\n");
                result.append("- Total Price: ").append(dto.getTotalPrice()).append("\n");
            } else {
                result.append("Booking NOT Found\n");
            }
        } catch (Exception e) {
            result.append("Error: ").append(e.getMessage()).append("\n");
            e.printStackTrace();
        }
        
        result.append("==============================\n");
        return ResponseEntity.ok(result.toString());
    }
    
    // Helper methods for security checks
    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("=== Admin Check Debug ===");
        System.out.println("Authentication: " + (authentication != null ? "Present" : "Null"));
        
        if (authentication == null || !authentication.isAuthenticated()) {
            System.out.println("Authentication failed: null or not authenticated");
            return false;
        }
        
        String currentUsername = authentication.getName();
        System.out.println("Current Username: " + currentUsername);
        
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseGet(() -> userRepository.findByEmail(currentUsername).orElse(null));
        
        System.out.println("Current User: " + (currentUser != null ? currentUser.getUsername() : "Not found"));
        System.out.println("User Role: " + (currentUser != null ? currentUser.getRole() : "N/A"));
        
        boolean isAdmin = currentUser != null && "ADMIN".equals(currentUser.getRole());
        System.out.println("Is Admin: " + isAdmin);
        System.out.println("=========================");
        
        return isAdmin;
    }
    
    private boolean canAccessBooking(BookingDTO booking) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        String currentUsername = authentication.getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseGet(() -> userRepository.findByEmail(currentUsername).orElse(null));
        
        if (currentUser == null) {
            return false;
        }
        
        // Admin can access any booking
        if ("ADMIN".equals(currentUser.getRole())) {
            return true;
        }
        
        // User can only access their own bookings
        return currentUser.getId().equals(booking.getUserId());
    }
    
    private boolean canAccessUserBookings(Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        String currentUsername = authentication.getName();
        
        // Try to find user by username first, then by email
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseGet(() -> userRepository.findByEmail(currentUsername).orElse(null));
        
        if (currentUser == null) {
            return false;
        }
        
        // Admin can access any user's bookings
        if ("ADMIN".equals(currentUser.getRole())) {
            return true;
        }
        
        // User can only access their own bookings
        return currentUser.getId().equals(userId);
    }
    
    private boolean canModifyBooking(BookingDTO booking) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        String currentUsername = authentication.getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseGet(() -> userRepository.findByEmail(currentUsername).orElse(null));
        
        if (currentUser == null) {
            return false;
        }
        
        // Admin can modify any booking
        if ("ADMIN".equals(currentUser.getRole())) {
            return true;
        }
        
        // User can only modify their own bookings and only when status is PENDING
        return currentUser.getId().equals(booking.getUserId()) && 
               BookingStatus.PENDING.equals(booking.getStatus());
    }
}
