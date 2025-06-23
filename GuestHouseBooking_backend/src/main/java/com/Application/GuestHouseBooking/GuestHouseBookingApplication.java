package com.Application.GuestHouseBooking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GuestHouseBookingApplication {
	public static void main(String[] args) {
		SpringApplication.run(GuestHouseBookingApplication.class, args);
	}
}
