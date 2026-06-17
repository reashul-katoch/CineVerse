package com.cineverse.movie.repository;

import com.cineverse.movie.entity.ShowSchedule;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShowScheduleRepository extends MongoRepository<ShowSchedule, String> {
    List<ShowSchedule> findByMovieId(String movieId);
    List<ShowSchedule> findByScreenIdAndShowDate(String screenId, String showDate);
}
