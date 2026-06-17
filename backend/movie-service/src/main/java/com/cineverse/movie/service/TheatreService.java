package com.cineverse.movie.service;

import com.cineverse.movie.entity.Screen;
import com.cineverse.movie.entity.Theatre;
import com.cineverse.movie.repository.ScreenRepository;
import com.cineverse.movie.repository.TheatreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TheatreService {

    @Autowired
    private TheatreRepository theatreRepository;

    @Autowired
    private ScreenRepository screenRepository;

    @Cacheable(value = "theatres_all")
    public List<Theatre> getAllTheatres() {
        return theatreRepository.findAll();
    }

    @Cacheable(value = "theatres", key = "#id")
    public Optional<Theatre> getTheatreById(String id) {
        return theatreRepository.findById(id);
    }

    @Cacheable(value = "screens_by_theatre", key = "#theatreId")
    public List<Screen> getScreensByTheatreId(String theatreId) {
        return screenRepository.findByTheatreId(theatreId);
    }

    @Cacheable(value = "screens", key = "#id")
    public Optional<Screen> getScreenById(String id) {
        return screenRepository.findById(id);
    }

    @CacheEvict(value = {"theatres_all", "theatres"}, allEntries = true)
    public Theatre saveTheatre(Theatre theatre) {
        return theatreRepository.save(theatre);
    }

    @CacheEvict(value = {"screens_by_theatre", "screens"}, allEntries = true)
    public Screen saveScreen(Screen screen) {
        return screenRepository.save(screen);
    }

    public void initDefaultTheatres() {
        if (theatreRepository.count() == 0) {
            // Seed Theatre 1: PVR Cinemas
            Theatre pvr = new Theatre("T1", "PVR Cinemas", "Delhi", new ArrayList<>());
            theatreRepository.save(pvr);

            Screen audi1 = new Screen("S1", "Audi 1", 40, "T1", 5, 8); // Rows A-E, Cols 1-8
            Screen audi2 = new Screen("S2", "Audi 2", 30, "T1", 5, 6);
            screenRepository.save(audi1);
            screenRepository.save(audi2);

            pvr.setScreenIds(List.of("S1", "S2"));
            theatreRepository.save(pvr);

            // Seed Theatre 2: IMAX Cineplex
            Theatre imax = new Theatre("T2", "IMAX Cineplex", "Mumbai", new ArrayList<>());
            theatreRepository.save(imax);

            Screen screen1 = new Screen("S3", "Screen 1", 48, "T2", 6, 8);
            Screen screen2 = new Screen("S4", "Screen 2", 24, "T2", 4, 6);
            screenRepository.save(screen1);
            screenRepository.save(screen2);

            imax.setScreenIds(List.of("S3", "S4"));
            theatreRepository.save(imax);
        }
    }
}
