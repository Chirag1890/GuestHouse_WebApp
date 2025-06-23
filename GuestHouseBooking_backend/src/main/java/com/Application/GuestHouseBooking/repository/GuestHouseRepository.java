package com.Application.GuestHouseBooking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.Application.GuestHouseBooking.entity.GuestHouse;

@Repository
public interface GuestHouseRepository extends JpaRepository<GuestHouse, Long> {
    @Query("SELECT DISTINCT gh FROM GuestHouse gh LEFT JOIN FETCH gh.rooms r LEFT JOIN FETCH r.beds b WHERE gh.id = ?1")
    GuestHouse findByIdWithRooms(Long id);

    @Query("SELECT DISTINCT gh FROM GuestHouse gh LEFT JOIN FETCH gh.rooms r LEFT JOIN FETCH r.beds")
    List<GuestHouse> findAllWithRooms();

    @Query("SELECT DISTINCT gh FROM GuestHouse gh LEFT JOIN FETCH gh.rooms r LEFT JOIN FETCH r.beds")
    List<GuestHouse> findAllWithAvailableBeds();
}
