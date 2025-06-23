package com.Application.GuestHouseBooking.service.implementations;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Application.GuestHouseBooking.dtos.BedDTO;
import com.Application.GuestHouseBooking.dtos.RoomDTO;
import com.Application.GuestHouseBooking.entity.Bed;
import com.Application.GuestHouseBooking.entity.GuestHouse;
import com.Application.GuestHouseBooking.entity.Room;
import com.Application.GuestHouseBooking.repository.GuestHouseRepository;
import com.Application.GuestHouseBooking.repository.RoomRepository;
import com.Application.GuestHouseBooking.service.RoomServices;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
@Transactional
public class RoomServiceImplementations implements RoomServices {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private GuestHouseRepository guestHouseRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private ObjectMapper objectMapper;

    private RoomDTO convertToDTO(Room room) {
        // Ensure the entity is attached to the persistence context
        if (!entityManager.contains(room)) {
            room = entityManager.merge(room);
        }

        RoomDTO dto = new RoomDTO();
        dto.setId(room.getId());
        dto.setRoomNumber(room.getRoomNumber());
        dto.setDescription(room.getDescription());
        dto.setAmenities(room.getAmenities());
        dto.setCreatedAt(room.getCreatedAt());
        dto.setUpdatedAt(room.getUpdatedAt());
        dto.setCreatedBy(room.getCreatedBy());
        dto.setLastModifiedBy(room.getLastModifiedBy());
        dto.setGuestHouseId(room.getGuestHouse().getId());

        try {
            // Initialize beds collection within transaction
            Hibernate.initialize(room.getBeds());
            List<BedDTO> bedDTOs = room.getBeds().stream()
                    .map(this::convertBedToDTO)
                    .collect(Collectors.toList());
            dto.setBeds(bedDTOs);
        } catch (Exception e) {
            System.err.println("Error loading beds for room: " + e.getMessage());
            dto.setBeds(new ArrayList<>());
        }

        return dto;
    }

    private BedDTO convertBedToDTO(Bed bed) {
        BedDTO dto = new BedDTO();
        dto.setId(bed.getId());
        dto.setBedNumber(bed.getBedNumber());
        dto.setIsAvailable(bed.getIsAvailable());
        dto.setIsAvailableForBooking(bed.getIsAvailableForBooking());
        dto.setPricePerNight(bed.getPricePerNight());
        dto.setCreatedAt(bed.getCreatedAt());
        dto.setUpdatedAt(bed.getUpdatedAt());
        dto.setCreatedBy(bed.getCreatedBy());
        dto.setLastModifiedBy(bed.getLastModifiedBy());
        return dto;
    }

    private Room convertToEntity(RoomDTO roomDTO) {
        Room room = new Room();
        room.setId(roomDTO.getId());

        // Fetch the associated GuestHouse
        GuestHouse guestHouse = guestHouseRepository.findById(roomDTO.getGuestHouseId())
                .orElseThrow(() -> new RuntimeException("GuestHouse not found with ID: " + roomDTO.getGuestHouseId()));
        room.setGuestHouse(guestHouse);

        room.setRoomNumber(roomDTO.getRoomNumber());
        room.setDescription(roomDTO.getDescription());
        room.setAmenities(roomDTO.getAmenities());
        return room;
    }

    @Override
    public RoomDTO createRoom(RoomDTO roomDTO) {
        Room room = convertToEntity(roomDTO);
        Room savedRoom = roomRepository.save(room);
        return convertToDTO(savedRoom);
    }

    @Override
    public Optional<RoomDTO> getRoomById(Long id) {
        return roomRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Override
    public List<RoomDTO> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomDTO> getRoomsByGuestHouseId(Long guestHouseId) {
        try {
            List<Room> rooms = roomRepository.findByGuestHouseId(guestHouseId);
            return rooms.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error retrieving rooms by guest house ID: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to retrieve rooms", e);
        }
    }

    @Override
    public Optional<RoomDTO> updateRoom(Long id, RoomDTO roomDTO) {
        Optional<Room> existingRoomOptional = roomRepository.findById(id);
        if (existingRoomOptional.isPresent()) {
            Room existingRoom = existingRoomOptional.get();

            // Update fields from DTO to existing entity
            GuestHouse guestHouse = guestHouseRepository.findById(roomDTO.getGuestHouseId())
                    .orElseThrow(() -> new RuntimeException("GuestHouse not found with ID: " + roomDTO.getGuestHouseId()));
            existingRoom.setGuestHouse(guestHouse);
            existingRoom.setRoomNumber(roomDTO.getRoomNumber());
            existingRoom.setDescription(roomDTO.getDescription());
            existingRoom.setAmenities(roomDTO.getAmenities());

            Room updatedRoom = roomRepository.save(existingRoom);
            return Optional.of(convertToDTO(updatedRoom));
        }
        return Optional.empty();
    }

    @Override
    public boolean deleteRoom(Long id) {
        if (roomRepository.existsById(id)) {
            roomRepository.deleteById(id);
            return true;
        }
        return false;
    }
}


