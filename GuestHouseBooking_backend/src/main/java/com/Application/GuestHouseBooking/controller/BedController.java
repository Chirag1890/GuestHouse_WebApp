package com.Application.GuestHouseBooking.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

import com.Application.GuestHouseBooking.dtos.BedDTO;
import com.Application.GuestHouseBooking.service.implementations.BedServicesImplementations;

@RestController
@RequestMapping("/api/beds")
@CrossOrigin(origins = "*")
public class BedController {

    @Autowired
    private BedServicesImplementations bedService;

    @PostMapping
    public ResponseEntity<BedDTO> createBed(@RequestBody BedDTO bedDTO) {
        try {
            System.out.println("=== Creating Bed Debug ===");
            System.out.println("Received BedDTO: " + bedDTO);
            System.out.println("Room ID: " + bedDTO.getRoomId());
            System.out.println("Bed Number: " + bedDTO.getBedNumber());
            System.out.println("Price: " + bedDTO.getPricePerNight());
            System.out.println("Is Available: " + bedDTO.getIsAvailable());
            System.out.println("Is Available For Booking: " + bedDTO.getIsAvailableForBooking());
            System.out.println("==========================");
            
            BedDTO createdBed = bedService.createBed(bedDTO);
            return new ResponseEntity<>(createdBed, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            System.err.println("Error creating bed: " + e.getMessage());
            e.printStackTrace(); // Print full stack trace
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(null); // Could return error message here if needed
        } catch (Exception e) {
            System.err.println("Unexpected error creating bed: " + e.getMessage());
            e.printStackTrace(); // Print full stack trace
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(null); // Could return error message here if needed
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<BedDTO> getBedById(@PathVariable Long id) {
        Optional<BedDTO> bedDTO = bedService.getBedById(id);
        return bedDTO.map(dto -> new ResponseEntity<>(dto, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<BedDTO>> getAllBeds() {
        List<BedDTO> beds = bedService.getAllBeds();
        return new ResponseEntity<>(beds, HttpStatus.OK);
    }

    @GetMapping("/by-room/{roomId}")
    public ResponseEntity<List<BedDTO>> getBedsByRoomId(@PathVariable Long roomId) {
        try {
            List<BedDTO> beds = bedService.getBedsByRoomId(roomId);
            // Return empty list instead of 404 when no beds found
            return new ResponseEntity<>(beds, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error fetching beds: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<BedDTO> updateBed(@PathVariable Long id, @RequestBody BedDTO bedDTO) {
        try {
            Optional<BedDTO> updatedBedDTO = bedService.updateBed(id, bedDTO);
            return updatedBedDTO.map(dto -> new ResponseEntity<>(dto, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (RuntimeException e) {
            System.err.println("Error updating bed: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBed(@PathVariable Long id) {
        if (bedService.deleteBed(id)) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/available")
    public ResponseEntity<List<BedDTO>> getAvailableBeds(
            @RequestParam Long roomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {
        try {
            List<BedDTO> availableBeds = bedService.getAvailableBeds(roomId, checkIn, checkOut);
            return new ResponseEntity<>(availableBeds, HttpStatus.OK);
        } catch (RuntimeException e) {
            System.err.println("Error getting available beds: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    @PostMapping("/update-availability")
    public ResponseEntity<String> updateBedAvailability() {
        try {
            bedService.updateBedAvailabilityForCompletedBookings();
            return new ResponseEntity<>("Bed availability updated successfully", HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error updating bed availability: " + e.getMessage());
            return new ResponseEntity<>("Failed to update bed availability: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
