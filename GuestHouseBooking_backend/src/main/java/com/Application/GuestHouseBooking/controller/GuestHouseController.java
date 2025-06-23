package com.Application.GuestHouseBooking.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Collections;
import java.util.ArrayList;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Application.GuestHouseBooking.dtos.GuestHouseDTO;
import com.Application.GuestHouseBooking.entity.GuestHouse;
import com.Application.GuestHouseBooking.repository.GuestHouseRepository;
import com.Application.GuestHouseBooking.service.GuestHouseServices;

@RestController
@RequestMapping("/api/guesthouses")
@CrossOrigin(origins = "*")
public class GuestHouseController {

    @Autowired
    private GuestHouseServices guestHouseService;
    
    @Autowired
    private GuestHouseRepository guestHouseRepository;

    @PostMapping
    public ResponseEntity<GuestHouseDTO> createGuestHouse(@RequestBody GuestHouseDTO guestHouseDTO) {
        GuestHouseDTO createdGuestHouse = guestHouseService.createGuestHouse(guestHouseDTO);
        return new ResponseEntity<>(createdGuestHouse, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GuestHouseDTO> getGuestHouseById(@PathVariable Long id) {
        Optional<GuestHouseDTO> guestHouseDTO = guestHouseService.getGuestHouseById(id);
        return guestHouseDTO.map(dto -> new ResponseEntity<>(dto, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<GuestHouseDTO>> getAllGuestHouses() {
        try {
            List<GuestHouseDTO> guestHouses = guestHouseService.getAllGuestHouses();
            System.out.println("Successfully fetched " + guestHouses.size() + " guest houses");
            return new ResponseEntity<>(guestHouses, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error fetching guest houses: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/with-rooms")
    public ResponseEntity<List<GuestHouseDTO>> getAllGuestHousesWithRooms() {
        try {
            List<GuestHouseDTO> guestHouses = guestHouseService.getAllGuestHousesWithRooms();
            return new ResponseEntity<>(guestHouses, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error fetching guest houses with rooms: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/with-available-beds")
    public ResponseEntity<List<GuestHouseDTO>> getAllGuestHousesWithAvailableBeds() {
        try {
            List<GuestHouseDTO> guestHouses = guestHouseService.getAllGuestHousesWithAvailableBeds();
            return new ResponseEntity<>(guestHouses, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error fetching guest houses with available beds: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<GuestHouseDTO> updateGuestHouse(@PathVariable Long id, @RequestBody GuestHouseDTO guestHouseDTO) {
        Optional<GuestHouseDTO> updatedGuestHouseDTO = guestHouseService.updateGuestHouse(id, guestHouseDTO);
        return updatedGuestHouseDTO.map(dto -> new ResponseEntity<>(dto, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGuestHouse(@PathVariable Long id) {
        if (guestHouseService.deleteGuestHouse(id)) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/debug/images")
    public ResponseEntity<List<Map<String, Object>>> debugGuestHouseImages() {
        try {
            List<GuestHouse> guestHouses = guestHouseRepository.findAll();
            List<Map<String, Object>> debugInfo = new ArrayList<>();
            
            for (GuestHouse gh : guestHouses) {
                Map<String, Object> info = new HashMap<>();
                info.put("id", gh.getId());
                info.put("name", gh.getName());
                info.put("imageUrl", gh.getImageUrl());
                info.put("hasImageUrl", gh.getImageUrl() != null && !gh.getImageUrl().trim().isEmpty());
                debugInfo.add(info);
            }
            
            return ResponseEntity.ok(debugInfo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonList(Map.of("error", e.getMessage())));
        }
    }
}
