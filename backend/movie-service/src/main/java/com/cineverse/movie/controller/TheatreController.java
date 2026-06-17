package com.cineverse.movie.controller;

import com.cineverse.movie.dto.ApiResponse;
import com.cineverse.movie.entity.Screen;
import com.cineverse.movie.entity.Theatre;
import com.cineverse.movie.service.TheatreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping({"/api/theatres", "/api/movies/theatres"})
@CrossOrigin(origins = "*")
public class TheatreController {

    @Autowired
    private TheatreService theatreService;

    @GetMapping
    public ResponseEntity<?> getAllTheatres() {
        List<Theatre> theatres = theatreService.getAllTheatres();
        return ResponseEntity.ok(ApiResponse.success("Theatres retrieved successfully", theatres));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTheatreById(@PathVariable String id) {
        Optional<Theatre> theatre = theatreService.getTheatreById(id);
        return theatre
                .<ResponseEntity<?>>map(value -> ResponseEntity.ok(ApiResponse.success("Theatre retrieved successfully", value)))
                .orElseGet(() -> ResponseEntity.status(404).body(ApiResponse.error("Theatre not found")));
    }

    @GetMapping("/{id}/screens")
    public ResponseEntity<?> getScreensByTheatreId(@PathVariable String id) {
        List<Screen> screens = theatreService.getScreensByTheatreId(id);
        return ResponseEntity.ok(ApiResponse.success("Screens retrieved successfully", screens));
    }

    @PostMapping
    public ResponseEntity<?> createTheatre(@RequestBody Theatre theatre) {
        try {
            if (theatre.getScreenIds() == null) {
                theatre.setScreenIds(new ArrayList<>());
            }
            Theatre saved = theatreService.saveTheatre(theatre);
            return ResponseEntity.ok(ApiResponse.success("Theatre created successfully", saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to create theatre: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/screens")
    public ResponseEntity<?> addScreenToTheatre(@PathVariable String id, @RequestBody Screen screen) {
        try {
            Optional<Theatre> theatreOpt = theatreService.getTheatreById(id);
            if (theatreOpt.isEmpty()) {
                return ResponseEntity.status(404).body(ApiResponse.error("Theatre not found"));
            }
            Theatre theatre = theatreOpt.get();
            screen.setTheatreId(id);
            Screen savedScreen = theatreService.saveScreen(screen);
            
            List<String> screenIds = new ArrayList<>(theatre.getScreenIds());
            if (!screenIds.contains(savedScreen.getId())) {
                screenIds.add(savedScreen.getId());
                theatre.setScreenIds(screenIds);
                theatreService.saveTheatre(theatre);
            }
            return ResponseEntity.ok(ApiResponse.success("Screen added successfully", savedScreen));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to add screen: " + e.getMessage()));
        }
    }
}
