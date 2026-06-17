package com.cineverse.movie;

import com.cineverse.movie.service.BookingService;
import com.cineverse.movie.service.MovieService;
import com.cineverse.movie.service.TheatreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class MovieServiceApplication implements CommandLineRunner {

	@Autowired
	private MovieService movieService;

	@Autowired
	private BookingService bookingService;

	@Autowired
	private TheatreService theatreService;

	public static void main(String[] args) {
		SpringApplication.run(MovieServiceApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		movieService.initDefaultMovies();
		bookingService.initDefaultBookings();
		theatreService.initDefaultTheatres();
	}
}

