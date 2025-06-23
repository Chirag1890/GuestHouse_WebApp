package com.Application.GuestHouseBooking.service;

import java.time.LocalDate;

import com.Application.GuestHouseBooking.dtos.DashboardStatsDTO;

public interface DashboardService {
    DashboardStatsDTO getOverallStatistics();
    DashboardStatsDTO getPeriodReport(LocalDate startDate, LocalDate endDate);
} 