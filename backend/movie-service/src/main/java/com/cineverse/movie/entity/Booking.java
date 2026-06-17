package com.cineverse.movie.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    private String id;

    private String username;
    private String movieId;
    private String movieTitle;
    private String showId; // References ShowSchedule ID
    private String seats; // comma-separated like "C-2, C-3"
    private Double price;
    private String status; // INITIATED, LOCKED, CONFIRMED, CANCELLED, EXPIRED
    private Long lockedUntil; // Timestamp until which the seat lock remains valid
}
