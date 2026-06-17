package com.cineverse.movie.controller;

import com.cineverse.movie.dto.ApiResponse;
import com.cineverse.movie.entity.ShowSchedule;
import com.cineverse.movie.service.ShowScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/movies/shows", "/api/movies/schedules"})
@CrossOrigin(origins = "*")
public class ShowScheduleController {

    @Autowired
    private ShowScheduleService showScheduleService;

    @GetMapping
    public ResponseEntity<?> getShows(@RequestParam(required = false) String movieId) {
        if (movieId != null) {
            List<ShowSchedule> schedules = showScheduleService.getSchedulesByMovie(movieId);
            return ResponseEntity.ok(ApiResponse.success("Schedules fetched for movie " + movieId, schedules));
        }
        List<ShowSchedule> allSchedules = showScheduleService.getAllSchedules();
        return ResponseEntity.ok(ApiResponse.success("All schedules fetched successfully", allSchedules));
    }

    @PostMapping
    public ResponseEntity<?> addShow(@RequestBody ShowSchedule schedule) {
        try {
            ShowSchedule saved = showScheduleService.saveSchedule(schedule);
            return ResponseEntity.ok(ApiResponse.success("Schedule created successfully", saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to create schedule: " + e.getMessage()));
        }
    }
}
