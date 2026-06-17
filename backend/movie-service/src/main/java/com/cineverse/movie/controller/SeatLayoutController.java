package com.cineverse.movie.controller;

import com.cineverse.movie.dto.ApiResponse;
import com.cineverse.movie.entity.Booking;
import com.cineverse.movie.entity.Screen;
import com.cineverse.movie.entity.ShowSchedule;
import com.cineverse.movie.service.BookingService;
import com.cineverse.movie.service.ShowScheduleService;
import com.cineverse.movie.service.TheatreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/movies/seats")
@CrossOrigin(origins = "*")
public class SeatLayoutController {

    @Autowired
    private ShowScheduleService showScheduleService;

    @Autowired
    private TheatreService theatreService;

    @Autowired
    private BookingService bookingService;

    @GetMapping("/{showId}")
    public ResponseEntity<?> getSeatLayout(@PathVariable String showId) {
        // 1. Fetch Show Schedule
        Optional<ShowSchedule> scheduleOpt = showScheduleService.getAllSchedules().stream()
                .filter(s -> showId.equals(s.getId()))
                .findFirst();

        if (scheduleOpt.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.error("Show schedule not found: " + showId));
        }
        ShowSchedule schedule = scheduleOpt.get();

        // 2. Fetch Screen layout details
        int rows = 5;
        int cols = 8;
        if (schedule.getScreenId() != null) {
            Optional<Screen> screenOpt = theatreService.getScreenById(schedule.getScreenId());
            if (screenOpt.isPresent()) {
                rows = screenOpt.get().getRowsCount() != null ? screenOpt.get().getRowsCount() : 5;
                cols = screenOpt.get().getColsCount() != null ? screenOpt.get().getColsCount() : 8;
            }
        }

        // 3. Fetch current active confirmed bookings from DB and temporary locks from Redis
        List<Booking> confirmedBookings = bookingService.getConfirmedBookingsForShow(showId);
        Set<String> confirmedSeats = new HashSet<>();
        for (Booking booking : confirmedBookings) {
            List<String> seats = Arrays.stream(booking.getSeats().split(","))
                    .map(String::trim)
                    .map(String::toUpperCase)
                    .collect(Collectors.toList());
            confirmedSeats.addAll(seats);
        }

        Set<String> lockedSeats = bookingService.getLockedSeatsFromRedis(showId);

        // Parse static blocked seats by manager
        if (schedule.getBlockedSeats() != null && !schedule.getBlockedSeats().trim().isEmpty()) {
            List<String> staticBlocked = Arrays.stream(schedule.getBlockedSeats().split(","))
                    .map(String::trim)
                    .map(String::toUpperCase)
                    .collect(Collectors.toList());
            confirmedSeats.addAll(staticBlocked);
        }

        // 4. Generate dynamic seating grid
        List<SeatState> layout = new ArrayList<>();
        char rowLetter = 'A';
        for (int r = 0; r < rows; r++) {
            char currentRow = (char) (rowLetter + r);
            for (int c = 1; c <= cols; c++) {
                String seatId = currentRow + "-" + c;
                
                // VIP Pricing tier for Row A and B
                String type = (currentRow == 'A' || currentRow == 'B') ? "VIP" : "REGULAR";
                double price = "VIP".equals(type) ? 20.0 : 12.5;

                String status = "AVAILABLE";
                if (confirmedSeats.contains(seatId)) {
                    status = "BOOKED";
                } else if (lockedSeats.contains(seatId)) {
                    status = "LOCKED";
                }

                layout.add(new SeatState(seatId, type, price, status));
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Seat layout fetched successfully", layout));
    }

    public static class SeatState {
        private String seatId;
        private String type;
        private Double price;
        private String status;

        public SeatState() {}

        public SeatState(String seatId, String type, Double price, String status) {
            this.seatId = seatId;
            this.type = type;
            this.price = price;
            this.status = status;
        }

        public String getSeatId() { return seatId; }
        public void setSeatId(String seatId) { this.seatId = seatId; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
