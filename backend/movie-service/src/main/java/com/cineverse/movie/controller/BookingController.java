package com.cineverse.movie.controller;

import com.cineverse.movie.dto.ApiResponse;
import com.cineverse.movie.entity.Booking;
import com.cineverse.movie.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/movies/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @GetMapping
    public ResponseEntity<?> getBookings(@RequestParam(required = false) String username) {
        if (username != null && !username.trim().isEmpty()) {
            List<Booking> userBookings = bookingService.getBookingsByUsername(username);
            return ResponseEntity.ok(ApiResponse.success("Bookings fetched for user " + username, userBookings));
        }
        List<Booking> allBookings = bookingService.getAllBookings();
        return ResponseEntity.ok(ApiResponse.success("All bookings fetched successfully", allBookings));
    }

    @PostMapping
    public ResponseEntity<?> addBooking(@RequestBody Booking booking) {
        try {
            List<String> seatList = Arrays.stream(booking.getSeats().split(","))
                    .map(String::trim)
                    .collect(Collectors.toList());

            String showId = booking.getShowId() != null ? booking.getShowId() : "show_init_id";
            String movieId = booking.getMovieId() != null ? booking.getMovieId() : "movie_init_id";
            String movieTitle = booking.getMovieTitle() != null ? booking.getMovieTitle() : "Movie Title";

            // 1. Thread-safe lock seats
            Booking locked = bookingService.initiateBooking(
                    booking.getUsername(),
                    showId,
                    movieId,
                    movieTitle,
                    seatList,
                    booking.getPrice()
            );

            // 2. Auto-confirm (simulate successful payment checkout)
            Booking confirmed = bookingService.confirmBooking(locked.getId());

            return ResponseEntity.ok(ApiResponse.success("Booking completed successfully", confirmed));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to complete booking: " + e.getMessage()));
        }
    }

    @PostMapping("/lock")
    public ResponseEntity<?> lockBooking(@RequestBody Booking booking) {
        try {
            List<String> seatList = Arrays.stream(booking.getSeats().split(","))
                    .map(String::trim)
                    .collect(Collectors.toList());

            String showId = booking.getShowId() != null ? booking.getShowId() : "show_init_id";
            String movieId = booking.getMovieId() != null ? booking.getMovieId() : "movie_init_id";
            String movieTitle = booking.getMovieTitle() != null ? booking.getMovieTitle() : "Movie Title";

            Booking locked = bookingService.initiateBooking(
                    booking.getUsername(),
                    showId,
                    movieId,
                    movieTitle,
                    seatList,
                    booking.getPrice()
            );
            return ResponseEntity.ok(ApiResponse.success("Seats locked successfully (5 minutes timer initiated)", locked));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to lock seats: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<?> confirmBooking(@PathVariable String id) {
        try {
            Booking confirmed = bookingService.confirmBooking(id);
            return ResponseEntity.ok(ApiResponse.success("Booking confirmed successfully", confirmed));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to confirm booking: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable String id) {
        try {
            Booking cancelled = bookingService.cancelBooking(id);
            return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", cancelled));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to cancel booking: " + e.getMessage()));
        }
    }
}
