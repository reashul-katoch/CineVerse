package com.cineverse.movie.repository;

import com.cineverse.movie.entity.Theatre;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TheatreRepository extends MongoRepository<Theatre, String> {
}
