package com.cineverse.movie.service;

import com.cineverse.movie.entity.ShowSchedule;
import com.cineverse.movie.repository.ShowScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import java.util.List;

@Service
public class ShowScheduleService {

    @Autowired
    private ShowScheduleRepository showScheduleRepository;

    @Cacheable(value = "schedules_all")
    public List<ShowSchedule> getAllSchedules() {
        return showScheduleRepository.findAll();
    }

    @Cacheable(value = "schedules_by_movie", key = "#movieId")
    public List<ShowSchedule> getSchedulesByMovie(String movieId) {
        return showScheduleRepository.findByMovieId(movieId);
    }

    @CacheEvict(value = {"schedules_all", "schedules_by_movie"}, allEntries = true)
    public ShowSchedule saveSchedule(ShowSchedule schedule) {
        if (schedule.getScreenId() == null || schedule.getScreenId().trim().isEmpty()) {
            throw new IllegalArgumentException("Screen ID is required");
        }
        if (schedule.getShowDate() == null || schedule.getShowDate().trim().isEmpty()) {
            throw new IllegalArgumentException("Show date is required");
        }
        if (schedule.getShowTime() == null || schedule.getShowTime().trim().isEmpty()) {
            throw new IllegalArgumentException("Show time is required");
        }

        // Validate time overlap (buffer of 120 minutes)
        int newTimeMin = parseTimeToMinutes(schedule.getShowTime());
        List<ShowSchedule> existingShows = showScheduleRepository.findByScreenIdAndShowDate(schedule.getScreenId(), schedule.getShowDate());

        for (ShowSchedule existing : existingShows) {
            if (schedule.getId() != null && schedule.getId().equals(existing.getId())) {
                continue;
            }
            int existingTimeMin = parseTimeToMinutes(existing.getShowTime());
            if (Math.abs(newTimeMin - existingTimeMin) < 120) {
                throw new IllegalArgumentException("Show overlaps with existing show: \"" + existing.getMovieTitle() + "\" at " + existing.getShowTime() + " on the same Screen");
            }
        }

        return showScheduleRepository.save(schedule);
    }

    private int parseTimeToMinutes(String time) {
        try {
            String cleanTime = time.trim().toUpperCase();
            boolean pm = cleanTime.endsWith("PM");
            boolean am = cleanTime.endsWith("AM");
            if (pm || am) {
                cleanTime = cleanTime.substring(0, cleanTime.length() - 2).trim();
            }
            String[] parts = cleanTime.split(":");
            int hours = Integer.parseInt(parts[0].trim());
            int minutes = Integer.parseInt(parts[1].trim());
            if (pm && hours < 12) {
                hours += 12;
            } else if (am && hours == 12) {
                hours = 0;
            }
            return hours * 60 + minutes;
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid time format: " + time + ". Use HH:MM format.");
        }
    }
}
