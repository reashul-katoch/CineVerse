package com.cineverse.movie.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "show_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShowSchedule {

    @Id
    private String id;

    private String movieId;
    private String movieTitle;
    private String screenId;
    private String showDate;
    private String showTime;
    private String blockedSeats = ""; // comma-separated seat ids like "A-1,A-2"
}
