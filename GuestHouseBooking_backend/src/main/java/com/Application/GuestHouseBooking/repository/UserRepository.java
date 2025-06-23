package com.Application.GuestHouseBooking.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Application.GuestHouseBooking.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByResetTokenAndResetTokenExpiryAfter(String resetToken, LocalDateTime now);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
