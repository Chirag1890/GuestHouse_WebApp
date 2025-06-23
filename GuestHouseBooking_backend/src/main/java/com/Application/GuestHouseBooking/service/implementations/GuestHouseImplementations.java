package com.Application.GuestHouseBooking.service.implementations;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Application.GuestHouseBooking.dtos.GuestHouseDTO;
import com.Application.GuestHouseBooking.entity.GuestHouse;
import com.Application.GuestHouseBooking.entity.Room;
import com.Application.GuestHouseBooking.entity.Bed;
import com.Application.GuestHouseBooking.entity.Booking;
import com.Application.GuestHouseBooking.repository.GuestHouseRepository;
import com.Application.GuestHouseBooking.repository.BookingRepository;
import com.Application.GuestHouseBooking.service.GuestHouseServices;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDate;

@Service
@Transactional
public class GuestHouseImplementations implements GuestHouseServices {

    @Autowired
    private GuestHouseRepository guestHouseRepository;

    @Autowired
    private AuditLogServices auditLogService; // Inject the AuditLogService

    @Autowired
    private ObjectMapper objectMapper; // Inject ObjectMapper for JSON conversion

    @Autowired
    private BookingRepository bookingRepository;

    @PersistenceContext
    private EntityManager entityManager;

    private GuestHouseDTO convertToDTO(GuestHouse guestHouse) {
        // Ensure the entity is attached to the persistence context
        if (!entityManager.contains(guestHouse)) {
            guestHouse = entityManager.merge(guestHouse);
        }

        GuestHouseDTO dto = new GuestHouseDTO();
        dto.setId(guestHouse.getId());
        dto.setName(guestHouse.getName());
        dto.setAddress(guestHouse.getAddress());
        dto.setCity(guestHouse.getCity());
        dto.setState(guestHouse.getState());
        dto.setCountry(guestHouse.getCountry());
        dto.setDescription(guestHouse.getDescription());
        dto.setAmenities(guestHouse.getAmenities());
        dto.setContactNumber(guestHouse.getContactNumber());
        dto.setEmail(guestHouse.getEmail());
        dto.setImageUrl(guestHouse.getImageUrl());
        
        // Debug logging for image URL
        System.out.println("=== Guest House Image Debug ===");
        System.out.println("Guest House: " + guestHouse.getName());
        System.out.println("Image URL from entity: " + guestHouse.getImageUrl());
        System.out.println("Image URL set in DTO: " + dto.getImageUrl());
        System.out.println("=================================");
        
        dto.setCreatedAt(guestHouse.getCreatedAt());
        dto.setUpdatedAt(guestHouse.getUpdatedAt());
        dto.setCreatedBy(guestHouse.getCreatedBy());
        dto.setLastModifiedBy(guestHouse.getLastModifiedBy());

        try {
            // Initialize collections within transaction
            Hibernate.initialize(guestHouse.getRooms());
            dto.setTotalRooms(guestHouse.getRooms().size());

            int totalBeds = 0;
            int availableBeds = 0;

            System.out.println("=== Calculating beds for Guest House: " + guestHouse.getName() + " ===");

            for (Room room : guestHouse.getRooms()) {
                Hibernate.initialize(room.getBeds());
                totalBeds += room.getBeds().size();
                
                System.out.println("Room " + room.getRoomNumber() + " has " + room.getBeds().size() + " beds");
                
                for (Bed bed : room.getBeds()) {
                    // Check if bed is available for booking
                    if (bed.getIsAvailableForBooking()) {
                        // Check if bed has any active bookings (PENDING, CONFIRMED, COMPLETED with future checkout)
                        boolean hasActiveBookings = bookingRepository.findByBedId(bed.getId()).stream()
                            .anyMatch(booking -> 
                                (booking.getStatus() == Booking.BookingStatus.PENDING ||
                                 booking.getStatus() == Booking.BookingStatus.CONFIRMED ||
                                 booking.getStatus() == Booking.BookingStatus.COMPLETED) &&
                                booking.getCheckOutDate().isAfter(LocalDate.now())
                            );
                        
                        // Bed is available if it has no active bookings
                        if (!hasActiveBookings) {
                            availableBeds++;
                            System.out.println("  - Bed " + bed.getBedNumber() + " is AVAILABLE (no active bookings)");
                        } else {
                            System.out.println("  - Bed " + bed.getBedNumber() + " is NOT AVAILABLE (has active bookings)");
                        }
                    } else {
                        System.out.println("  - Bed " + bed.getBedNumber() + " is NOT AVAILABLE (flag is false)");
                    }
                }
            }

            System.out.println("Total Beds: " + totalBeds + ", Available Beds: " + availableBeds);
            System.out.println("================================================");

            dto.setTotalBeds(totalBeds);
            dto.setAvailableBeds(availableBeds);
        } catch (Exception e) {
            // Log error but don't fail the entire operation
            System.err.println("Error calculating room/bed counts: " + e.getMessage());
            dto.setTotalRooms(0);
            dto.setTotalBeds(0);
            dto.setAvailableBeds(0);
        }

        return dto;
    }

    private GuestHouse convertToEntity(GuestHouseDTO guestHouseDTO) {
        GuestHouse guestHouse = new GuestHouse();
        guestHouse.setId(guestHouseDTO.getId()); // Set ID only for updates
        guestHouse.setName(guestHouseDTO.getName());
        guestHouse.setAddress(guestHouseDTO.getAddress());
        guestHouse.setCity(guestHouseDTO.getCity());
        guestHouse.setState(guestHouseDTO.getState());
        guestHouse.setCountry(guestHouseDTO.getCountry());
        guestHouse.setDescription(guestHouseDTO.getDescription());
        guestHouse.setAmenities(guestHouseDTO.getAmenities());
        guestHouse.setContactNumber(guestHouseDTO.getContactNumber());
        guestHouse.setEmail(guestHouseDTO.getEmail());
        guestHouse.setImageUrl(guestHouseDTO.getImageUrl());
        return guestHouse;
    }

    public GuestHouseDTO createGuestHouse(GuestHouseDTO guestHouseDTO) {
        GuestHouse guestHouse = convertToEntity(guestHouseDTO);
        GuestHouse savedGuestHouse = guestHouseRepository.save(guestHouse);

        // --- Audit Log: CREATE ---
        try {
            auditLogService.logAudit(
                    "GuestHouse",
                    savedGuestHouse.getId(),
                    "CREATE",
                    savedGuestHouse.getCreatedBy(), // Will be filled by Spring Data JPA Auditing
                    null, // No old value for create
                    objectMapper.writeValueAsString(savedGuestHouse), // New value as JSON
                    "New GuestHouse created"
            );
        } catch (Exception e) {
            System.err.println("Failed to log audit for GuestHouse creation: " + e.getMessage());
        }
        // --- End Audit Log ---

        return convertToDTO(savedGuestHouse);
    }

    public Optional<GuestHouseDTO> getGuestHouseById(Long id) {
        Optional<GuestHouse> guestHouseOptional = guestHouseRepository.findById(id);
        return guestHouseOptional.map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GuestHouseDTO> getAllGuestHouses() {
        try {
            List<GuestHouse> guestHouses = guestHouseRepository.findAll();
            return guestHouses.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error retrieving guest houses from database: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to retrieve guest houses", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<GuestHouseDTO> getAllGuestHousesWithRooms() {
        try {
            List<GuestHouse> guestHouses = guestHouseRepository.findAllWithRooms();
            return guestHouses.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error retrieving guest houses with rooms from database: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to retrieve guest houses with rooms", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<GuestHouseDTO> getAllGuestHousesWithAvailableBeds() {
        try {
            List<GuestHouse> guestHouses = guestHouseRepository.findAllWithAvailableBeds();
            return guestHouses.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error retrieving guest houses with available beds from database: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to retrieve guest houses with available beds", e);
        }
    }

    public Optional<GuestHouseDTO> updateGuestHouse(Long id, GuestHouseDTO guestHouseDTO) {
        Optional<GuestHouse> existingGuestHouseOptional = guestHouseRepository.findById(id);
        if (existingGuestHouseOptional.isPresent()) {
            GuestHouse existingGuestHouse = existingGuestHouseOptional.get();

            String oldValue = null; // Prepare for audit logging
            try {
                oldValue = objectMapper.writeValueAsString(existingGuestHouse);
            } catch (Exception e) {
                System.err.println("Failed to convert old GuestHouse to JSON: " + e.getMessage());
            }

            // Update fields from DTO to existing entity
            existingGuestHouse.setName(guestHouseDTO.getName());
            existingGuestHouse.setAddress(guestHouseDTO.getAddress());
            existingGuestHouse.setCity(guestHouseDTO.getCity());
            // ... set other fields ...

            GuestHouse updatedGuestHouse = guestHouseRepository.save(existingGuestHouse);

            // --- Audit Log: UPDATE ---
            try {
                auditLogService.logAudit(
                        "GuestHouse",
                        updatedGuestHouse.getId(),
                        "UPDATE",
                        updatedGuestHouse.getLastModifiedBy(), // Will be filled by Spring Data JPA Auditing
                        oldValue,
                        objectMapper.writeValueAsString(updatedGuestHouse), // New value as JSON
                        "GuestHouse updated"
                );
            } catch (Exception e) {
                System.err.println("Failed to log audit for GuestHouse update: " + e.getMessage());
            }
            // --- End Audit Log ---

            return Optional.of(convertToDTO(updatedGuestHouse));
        }
        return Optional.empty();
    }

    public boolean deleteGuestHouse(Long id) {
        Optional<GuestHouse> guestHouseToDeleteOptional = guestHouseRepository.findById(id);
        if (guestHouseToDeleteOptional.isPresent()) {
            GuestHouse guestHouseToDelete = guestHouseToDeleteOptional.get();

            String oldValue = null; // Prepare for audit logging
            try {
                oldValue = objectMapper.writeValueAsString(guestHouseToDelete);
            } catch (Exception e) {
                System.err.println("Failed to convert old GuestHouse to JSON for delete: " + e.getMessage());
            }

            guestHouseRepository.deleteById(id);

            // --- Audit Log: DELETE ---
            auditLogService.logAudit(
                    "GuestHouse",
                    id,
                    "DELETE",
                    "system_user", 
                    oldValue,
                    null, // No new value for delete
                    "GuestHouse deleted"
            );
            // --- End Audit Log ---
            return true;
        }
        return false;
    }
}