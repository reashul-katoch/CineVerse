package com.cineverse.movie.service;

import com.cineverse.movie.entity.Booking;
import com.cineverse.movie.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByUsername(String username) {
        return bookingRepository.findByUsername(username);
    }

    public Booking saveBooking(Booking booking) {
        return bookingRepository.save(booking);
    }

    // --- Redis Locking Helpers ---

    public boolean lockSeat(String showId, String seatNumber) {
        String key = "seat:" + showId + ":" + seatNumber;
        Boolean success = redisTemplate.opsForValue()
                .setIfAbsent(key, "LOCKED", Duration.ofMinutes(5));
        return Boolean.TRUE.equals(success);
    }

    public boolean isSeatAvailable(String showId, String seatNumber) {
        String key = "seat:" + showId + ":" + seatNumber;
        return !Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    public void releaseSeat(String showId, String seatNumber) {
        String key = "seat:" + showId + ":" + seatNumber;
        redisTemplate.delete(key);
    }

    public Set<String> getLockedSeatsFromRedis(String showId) {
        Set<String> locked = new HashSet<>();
        Set<String> keys = redisTemplate.keys("seat:" + showId + ":*");
        if (keys != null) {
            for (String key : keys) {
                String[] parts = key.split(":");
                if (parts.length >= 3) {
                    locked.add(parts[2]);
                }
            }
        }
        return locked;
    }

    public List<Booking> getConfirmedBookingsForShow(String showId) {
        return bookingRepository.findByShowIdAndStatusIn(showId, List.of("CONFIRMED"));
    }

    // --- Transactional Booking Flow ---

    public Booking initiateBooking(String username, String showId, String movieId, String movieTitle, List<String> seats, Double price) {
        List<String> requestedSeatsClean = seats.stream()
                .map(String::trim)
                .map(String::toUpperCase)
                .collect(Collectors.toList());

        // 1. Verify seats are not permanently booked in MongoDB
        List<Booking> confirmedBookings = getConfirmedBookingsForShow(showId);
        Set<String> confirmedSeats = confirmedBookings.stream()
                .flatMap(b -> Arrays.stream(b.getSeats().split(",")))
                .map(String::trim)
                .map(String::toUpperCase)
                .collect(Collectors.toSet());

        for (String seat : requestedSeatsClean) {
            if (confirmedSeats.contains(seat)) {
                throw new IllegalArgumentException("Seat " + seat + " is already booked permanently.");
            }
        }

        // 2. Attempt to lock seats in Redis
        List<String> successfullyLocked = new ArrayList<>();
        boolean allLocked = true;
        for (String seat : requestedSeatsClean) {
            if (lockSeat(showId, seat)) {
                successfullyLocked.add(seat);
            } else {
                allLocked = false;
                break;
            }
        }

        // 3. Rollback locks on failure (prevent race conditions & partial locks)
        if (!allLocked) {
            for (String seatToRelease : successfullyLocked) {
                releaseSeat(showId, seatToRelease);
            }
            throw new IllegalArgumentException("One or more selected seats are currently locked by another customer. Please choose other seats.");
        }

        // 4. Create local database tracking document
        Booking booking = new Booking();
        booking.setUsername(username);
        booking.setShowId(showId);
        booking.setMovieId(movieId);
        booking.setMovieTitle(movieTitle);
        booking.setSeats(String.join(", ", requestedSeatsClean));
        booking.setPrice(price);
        booking.setStatus("LOCKED");
        booking.setLockedUntil(System.currentTimeMillis() + 5 * 60 * 1000); // Back-up metadata timer

        return bookingRepository.save(booking);
    }

    public Booking confirmBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));

        if ("CONFIRMED".equalsIgnoreCase(booking.getStatus())) {
            return booking;
        }

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus()) || "EXPIRED".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalStateException("Booking has already been cancelled or expired.");
        }

        // Release the temporary lock in Redis now that booking is permanently confirmed
        List<String> seatsToRelease = Arrays.stream(booking.getSeats().split(","))
                .map(String::trim)
                .map(String::toUpperCase)
                .collect(Collectors.toList());

        for (String seat : seatsToRelease) {
            releaseSeat(booking.getShowId(), seat);
        }

        booking.setStatus("CONFIRMED");
        booking.setLockedUntil(null);
        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));

        // Release locks in Redis if it was in LOCKED state
        if ("LOCKED".equalsIgnoreCase(booking.getStatus())) {
            List<String> seatsToRelease = Arrays.stream(booking.getSeats().split(","))
                    .map(String::trim)
                    .map(String::toUpperCase)
                    .collect(Collectors.toList());

            for (String seat : seatsToRelease) {
                releaseSeat(booking.getShowId(), seat);
            }
        }

        booking.setStatus("CANCELLED");
        return bookingRepository.save(booking);
    }

    public List<Booking> getActiveBookingsForShow(String showId) {
        long now = System.currentTimeMillis();
        List<Booking> candidates = bookingRepository.findByShowIdAndStatusIn(showId, List.of("CONFIRMED", "LOCKED", "INITIATED"));
        return candidates.stream()
                .filter(b -> "CONFIRMED".equalsIgnoreCase(b.getStatus()) || (b.getLockedUntil() != null && b.getLockedUntil() > now))
                .collect(Collectors.toList());
    }

    public void initDefaultBookings() {
        if (bookingRepository.count() == 0) {
            bookingRepository.save(new Booking(null, "Naitik Pathak", "100000000000000000000003", "Inception", "show_init_id", "C-2, C-3", 25.0, "CONFIRMED", null));
        }
    }
}
