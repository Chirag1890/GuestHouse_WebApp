package com.Application.GuestHouseBooking.MailServices;

import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.Application.GuestHouseBooking.entity.Booking;

@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Value("${app.mail.admin-email}")
    private String adminEmail;

    @Value("${app.mail.app-base-url}")
    private String appBaseUrl;

    @Value("${app.mail.admin-pending-bookings-path}")
    private String adminPendingBookingsPath;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public void sendBookingNotificationToAdmin(Booking booking) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(adminEmail);
        message.setSubject("New Booking Request - ID: " + booking.getId());

        String adminBookingLink = appBaseUrl + adminPendingBookingsPath;

        String emailContent = String.format(
                "Dear Admin,\n\n" +
                "A new booking request has been received:\n\n" +
                "Booking Details:\n" +
                "---------------\n" +
                "Booking ID: %d\n" +
                "Guest Name: %s %s\n" +
                "Guest Email: %s\n" +
                "Guest Phone: %s\n" +
                "Guest Gender: %s\n" +
                "Guest Address: %s\n\n" +
                "Accommodation Details:\n" +
                "--------------------\n" +
                "Guest House: %s\n" +
                "Room Number: %s\n" +
                "Bed Number: %s\n" +
                "Check-in Date: %s\n" +
                "Check-out Date: %s\n" +
                "Total Price: %.2f\n" +
                "Purpose of Stay: %s\n\n" +
                "Please review this booking request at:\n%s\n\n" +
                "Best regards,\n" +
                "Guest House Booking System",
                booking.getId(),
                booking.getFirstName(), booking.getLastName(),
                booking.getEmail(),
                booking.getPhoneNumber(),
                booking.getGender(),
                booking.getAddress(),
                booking.getBed().getRoom().getGuestHouse().getName(),
                booking.getBed().getRoom().getRoomNumber(),
                booking.getBed().getBedNumber(),
                booking.getCheckInDate().format(DATE_FORMATTER),
                booking.getCheckOutDate().format(DATE_FORMATTER),
                booking.getTotalPrice(),
                booking.getPurpose(),
                adminBookingLink
        );

        message.setText(emailContent);
        sendEmail(message, "admin notification", booking.getId());
    }

    public void sendBookingConfirmationToGuest(Booking booking) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(booking.getEmail());
        message.setSubject("Booking Confirmed - ID: " + booking.getId());

        String emailContent = String.format(
                "Dear %s,\n\n" +
                "Your booking has been confirmed!\n\n" +
                "Booking Details:\n" +
                "---------------\n" +
                "Booking ID: %d\n" +
                "Check-in Date: %s\n" +
                "Check-out Date: %s\n\n" +
                "Accommodation Details:\n" +
                "--------------------\n" +
                "Guest House: %s\n" +
                "Address: %s\n" +
                "Room Number: %s\n" +
                "Bed Number: %s\n" +
                "Total Price: %.2f\n\n" +
                "Important Information:\n" +
                "--------------------\n" +
                "- Check-in time: 2:00 PM\n" +
                "- Check-out time: 12:00 PM\n" +
                "- Please bring a valid ID for check-in\n" +
                "- Payment should be made at check-in\n\n" +
                "Contact Information:\n" +
                "-------------------\n" +
                "Guest House Phone: %s\n" +
                "Guest House Email: %s\n\n" +
                "We look forward to hosting you!\n\n" +
                "Best regards,\n" +
                "Guest House Booking Team",
                booking.getFirstName(),
                booking.getId(),
                booking.getCheckInDate().format(DATE_FORMATTER),
                booking.getCheckOutDate().format(DATE_FORMATTER),
                booking.getBed().getRoom().getGuestHouse().getName(),
                booking.getBed().getRoom().getGuestHouse().getAddress(),
                booking.getBed().getRoom().getRoomNumber(),
                booking.getBed().getBedNumber(),
                booking.getTotalPrice(),
                booking.getBed().getRoom().getGuestHouse().getContactNumber(),
                booking.getBed().getRoom().getGuestHouse().getEmail()
        );

        message.setText(emailContent);
        sendEmail(message, "booking confirmation", booking.getId());
    }

    public void sendBookingRejectionToGuest(Booking booking, String reason) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(booking.getEmail());
        message.setSubject("Booking Request Denied - ID: " + booking.getId());

        String emailContent = String.format(
                "Dear %s,\n\n" +
                "We regret to inform you that your booking request has been denied.\n\n" +
                "Booking Details:\n" +
                "---------------\n" +
                "Booking ID: %d\n" +
                "Guest House: %s\n" +
                "Check-in Date: %s\n" +
                "Check-out Date: %s\n\n" +
                "Reason for Denial: %s\n\n" +
                "You can try booking another available accommodation or contact us for assistance.\n\n" +
                "Best regards,\n" +
                "Guest House Booking Team",
                booking.getFirstName(),
                booking.getId(),
                booking.getBed().getRoom().getGuestHouse().getName(),
                booking.getCheckInDate().format(DATE_FORMATTER),
                booking.getCheckOutDate().format(DATE_FORMATTER),
                reason != null ? reason : "No specific reason provided"
        );

        message.setText(emailContent);
        sendEmail(message, "booking rejection", booking.getId());
    }

    public void sendBookingCancellationToGuest(Booking booking, String reason) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(booking.getEmail());
        message.setSubject("Booking Cancelled - ID: " + booking.getId());

        String emailContent = String.format(
                "Dear %s,\n\n" +
                "Your booking has been cancelled.\n\n" +
                "Booking Details:\n" +
                "---------------\n" +
                "Booking ID: %d\n" +
                "Guest House: %s\n" +
                "Check-in Date: %s\n" +
                "Check-out Date: %s\n\n" +
                "Reason for Cancellation: %s\n\n" +
                "If you did not request this cancellation, please contact us immediately.\n\n" +
                "Best regards,\n" +
                "Guest House Booking Team",
                booking.getFirstName(),
                booking.getId(),
                booking.getBed().getRoom().getGuestHouse().getName(),
                booking.getCheckInDate().format(DATE_FORMATTER),
                booking.getCheckOutDate().format(DATE_FORMATTER),
                reason != null ? reason : "No specific reason provided"
        );

        message.setText(emailContent);
        sendEmail(message, "booking cancellation", booking.getId());
    }

    public void sendBookingCompletionToGuest(Booking booking) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(booking.getEmail());
        message.setSubject("Thank You for Your Stay - Booking ID: " + booking.getId());

        String emailContent = String.format(
                "Dear %s,\n\n" +
                "Thank you for choosing our Guest House! We hope you enjoyed your stay.\n\n" +
                "Stay Details:\n" +
                "-------------\n" +
                "Booking ID: %d\n" +
                "Guest House: %s\n" +
                "Check-in Date: %s\n" +
                "Check-out Date: %s\n\n" +
                "We would love to hear about your experience. Please take a moment to rate your stay.\n\n" +
                "We look forward to hosting you again!\n\n" +
                "Best regards,\n" +
                "Guest House Booking Team",
                booking.getFirstName(),
                booking.getId(),
                booking.getBed().getRoom().getGuestHouse().getName(),
                booking.getCheckInDate().format(DATE_FORMATTER),
                booking.getCheckOutDate().format(DATE_FORMATTER)
        );

        message.setText(emailContent);
        sendEmail(message, "stay completion", booking.getId());
    }

    public void sendPasswordResetEmail(String to, String resetToken) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(to);
        message.setSubject("Password Reset Request - Guest House Booking System");

        String resetLink = "http://localhost:3000/reset-password?token=" + resetToken;

        String emailContent = String.format(
                "Dear User,\n\n" +
                "We received a request to reset your password.\n\n" +
                "To reset your password, click the link below:\n" +
                "%s\n\n" +
                "This link will expire in 24 hours.\n\n" +
                "If you did not request a password reset, please ignore this email.\n\n" +
                "Best regards,\n" +
                "Guest House Booking Team",
                resetLink
        );

        message.setText(emailContent);
        try {
            mailSender.send(message);
            System.out.println("Successfully sent password reset email to: " + to);
        } catch (MailException e) {
            System.err.println("Failed to send password reset email to " + to + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void sendEmail(SimpleMailMessage message, String type, Long bookingId) {
        try {
            mailSender.send(message);
            System.out.println("Successfully sent " + type + " email for Booking ID: " + bookingId);
        } catch (MailException e) {
            System.err.println("Failed to send " + type + " email for Booking ID " + bookingId + ": " + e.getMessage());
            e.printStackTrace(); // For debugging
        }
    }
}
