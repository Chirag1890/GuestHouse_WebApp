# Revenue Calculation Update for Admin Dashboard

## Overview
This update implements the functionality to fetch and display the total revenue from all approved bookings (CONFIRMED and COMPLETED status) in the admin dashboard.

## Changes Made

### Backend Changes

#### 1. BookingRepository.java
- Added `calculateTotalRevenueFromApprovedBookings()` method to calculate revenue from CONFIRMED and COMPLETED bookings
- Added `calculateTotalRevenueFromApprovedBookings(startDate, endDate)` method for period-specific calculations

#### 2. DashboardServiceImplementation.java
- Updated `getOverallStatistics()` method to use approved bookings revenue
- Updated `getPeriodReport()` method to use approved bookings revenue for period reports
- Added debug logging to track revenue calculations

#### 3. DashboardController.java
- Added `/approved-revenue` endpoint for detailed approved revenue breakdown
- Updated `/debug` endpoint to show both completed and approved revenue
- Enhanced revenue breakdown information

### Frontend Changes

#### 1. api.ts
- Added `getApprovedRevenueBreakdown()` API call for detailed revenue information

## How It Works

### Revenue Calculation Logic
1. **Approved Bookings**: Includes bookings with status `CONFIRMED` and `COMPLETED`
2. **Total Revenue**: Sum of `totalPrice` from all approved bookings
3. **Period Revenue**: Sum of `totalPrice` from approved bookings within a date range

### API Endpoints

#### GET `/api/dashboard/stats`
- Returns overall statistics including total revenue from approved bookings
- Used by the main admin dashboard

#### GET `/api/dashboard/approved-revenue`
- Returns detailed breakdown of approved revenue by status
- Shows CONFIRMED vs COMPLETED revenue separately

#### GET `/api/dashboard/report?startDate=X&endDate=Y`
- Returns period-specific statistics including approved revenue for the date range

#### GET `/api/dashboard/debug`
- Returns debug information including both completed and approved revenue totals

## Database Queries

### Main Revenue Query
```sql
SELECT COALESCE(SUM(b.totalPrice), 0) 
FROM Booking b 
WHERE b.status IN ('CONFIRMED', 'COMPLETED')
```

### Period-Specific Revenue Query
```sql
SELECT COALESCE(SUM(b.totalPrice), 0) 
FROM Booking b 
WHERE b.status IN ('CONFIRMED', 'COMPLETED') 
AND b.checkOutDate >= :startDate 
AND b.checkOutDate <= :endDate
```

## Usage

### Admin Dashboard
The admin dashboard will now display the total revenue from all approved bookings (CONFIRMED + COMPLETED) instead of just completed bookings.

### Revenue Breakdown
Admins can access detailed revenue breakdown by calling the `/approved-revenue` endpoint to see:
- Total approved revenue
- Revenue from confirmed bookings
- Revenue from completed bookings
- Booking counts by status

## Benefits
1. **More Accurate Revenue Tracking**: Includes both confirmed and completed bookings
2. **Better Financial Visibility**: Shows potential revenue from confirmed bookings
3. **Period Analysis**: Supports date-range revenue analysis
4. **Debug Information**: Provides detailed breakdown for troubleshooting

## Testing
To test the implementation:
1. Start the backend application
2. Access `/api/dashboard/stats` to see overall statistics
3. Access `/api/dashboard/approved-revenue` to see detailed breakdown
4. Access `/api/dashboard/debug` to see debug information
5. Check the admin dashboard frontend to see the updated revenue display 