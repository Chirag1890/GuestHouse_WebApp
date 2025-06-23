package com.Application.GuestHouseBooking.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.web.bind.annotation.RestController;

import com.Application.GuestHouseBooking.dtos.RoomDTO;
import com.Application.GuestHouseBooking.service.implementations.RoomServiceImplementations;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*")
public class RoomController {
    @Autowired
    private RoomServiceImplementations roomService;

    @PostMapping
    public ResponseEntity<RoomDTO> createRoom(@RequestBody RoomDTO roomDTO) {
        try {
            RoomDTO createdRoom = roomService.createRoom(roomDTO);
            return new ResponseEntity<>(createdRoom, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            System.err.println("Error creating room: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomDTO> getRoomById(@PathVariable Long id) {
        Optional<RoomDTO> roomDTO = roomService.getRoomById(id);
        return roomDTO.map(dto -> new ResponseEntity<>(dto, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<RoomDTO>> getAllRooms() {
        List<RoomDTO> rooms = roomService.getAllRooms();
        return new ResponseEntity<>(rooms, HttpStatus.OK);
    }

    @GetMapping("/by-guesthouse/{guestHouseId}")
    public ResponseEntity<List<RoomDTO>> getRoomsByGuestHouseId(@PathVariable Long guestHouseId) {
        try {
            List<RoomDTO> rooms = roomService.getRoomsByGuestHouseId(guestHouseId);
            return new ResponseEntity<>(rooms, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error fetching rooms: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomDTO> updateRoom(@PathVariable Long id, @RequestBody RoomDTO roomDTO) {
        try {
            Optional<RoomDTO> updatedRoomDTO = roomService.updateRoom(id, roomDTO);
            return updatedRoomDTO.map(dto -> new ResponseEntity<>(dto, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (RuntimeException e) {
            System.err.println("Error updating room: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        if (roomService.deleteRoom(id)) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
