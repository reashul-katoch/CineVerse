package com.cineverse.movie.service;

import com.cineverse.movie.entity.Movie;
import com.cineverse.movie.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private WebClient webClient;

    @Value("${review.service.url}")
    private String reviewServiceUrl;

    public List<Movie> getAllMovies() {
        List<Movie> movies = movieRepository.findAll();
        for (Movie movie : movies) {
            movie.setReviews(fetchReviewsForMovie(movie.getId()));
        }
        return movies;
    }

    public Page<Movie> getMoviesPaginated(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc") 
                ? Sort.by(sortBy).descending() 
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Movie> moviePage = movieRepository.findAll(pageable);
        moviePage.forEach(movie -> movie.setReviews(fetchReviewsForMovie(movie.getId())));
        return moviePage;
    }

    public Optional<Movie> getMovieById(String id) {
        Optional<Movie> movieOpt = movieRepository.findById(id);
        movieOpt.ifPresent(movie -> movie.setReviews(fetchReviewsForMovie(movie.getId())));
        return movieOpt;
    }

    public Movie addMovie(Movie movie) {
        return movieRepository.save(movie);
    }

    public Movie updateMovie(String id, Movie updatedMovie) {
        return movieRepository.findById(id).map(movie -> {
            movie.setTitle(updatedMovie.getTitle());
            movie.setGenre(updatedMovie.getGenre());
            movie.setYear(updatedMovie.getYear());
            movie.setRating(updatedMovie.getRating());
            movie.setImage(updatedMovie.getImage());
            movie.setOverview(updatedMovie.getOverview());
            return movieRepository.save(movie);
        }).orElseThrow(() -> new RuntimeException("Movie not found with id: " + id));
    }

    public void deleteMovie(String id) {
        movieRepository.deleteById(id);
    }

    public List<Movie> searchByTitle(String title) {
        List<Movie> movies = movieRepository.findByTitleContainingIgnoreCase(title);
        for (Movie movie : movies) {
            movie.setReviews(fetchReviewsForMovie(movie.getId()));
        }
        return movies;
    }

    public List<Movie> searchByGenre(String genre) {
        List<Movie> movies = movieRepository.findByGenreContainingIgnoreCase(genre);
        for (Movie movie : movies) {
            movie.setReviews(fetchReviewsForMovie(movie.getId()));
        }
        return movies;
    }

    public List<Movie> searchByRating(Double rating) {
        List<Movie> movies = movieRepository.findByRatingGreaterThanEqual(rating);
        for (Movie movie : movies) {
            movie.setReviews(fetchReviewsForMovie(movie.getId()));
        }
        return movies;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchReviewsForMovie(String movieId) {
        try {
            String url = reviewServiceUrl + "/api/reviews?movieId=" + movieId;
            List<?> response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(List.class)
                    .block();
            if (response != null) {
                return (List<Map<String, Object>>) response;
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch reviews for movie " + movieId + " using WebClient: " + e.getMessage());
        }
        return new ArrayList<>();
    }

    public void initDefaultMovies() {
        if (movieRepository.count() == 0) {
            movieRepository.save(new Movie("100000000000000000000001", "Interstellar", "Sci-Fi", 2014, 8.7, 
                "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
                "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival. Faced with dwindling resources on Earth, a group of scientists and pilots embark on the most important mission in human history.",
                new ArrayList<>()));

            movieRepository.save(new Movie("100000000000000000000002", "The Dark Knight", "Action", 2008, 9.0, 
                "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80",
                "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
                new ArrayList<>()));

            movieRepository.save(new Movie("100000000000000000000003", "Inception", "Sci-Fi", 2010, 8.8, 
                "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
                "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project.",
                new ArrayList<>()));

            movieRepository.save(new Movie("100000000000000000000004", "Pulp Fiction", "Thriller", 1994, 8.9, 
                "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80",
                "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption in Los Angeles.",
                new ArrayList<>()));

            movieRepository.save(new Movie("100000000000000000000005", "Gladiator", "Action", 2000, 8.5, 
                "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&auto=format&fit=crop&q=80",
                "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
                new ArrayList<>()));

            movieRepository.save(new Movie("100000000000000000000006", "The Godfather", "Drama", 1972, 9.2, 
                "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80",
                "The aging patriarch of an organized crime dynasty in postwar New York City transfers control of his clandestine empire to his reluctant youngest son.",
                new ArrayList<>()));
        }
    }
}
