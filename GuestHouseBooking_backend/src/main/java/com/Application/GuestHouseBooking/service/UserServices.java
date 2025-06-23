package com.Application.GuestHouseBooking.service;

import com.Application.GuestHouseBooking.dtos.UserDTO;

import java.util.List;
import java.util.Optional;

public interface UserServices {
    UserDTO createUser(UserDTO userDTO);
    Optional<UserDTO> getUserById(Long id);
    List<UserDTO> getAllUsers();
    Optional<UserDTO> updateUser(Long id, UserDTO userDTO);
    boolean deleteUser(Long id);
}
