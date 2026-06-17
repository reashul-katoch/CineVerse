package com.cineverse.movie.repository;

import com.cineverse.movie.entity.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUsername(String username);
    List<Booking> findByShowIdAndStatusIn(String showId, List<String> statuses);
}
