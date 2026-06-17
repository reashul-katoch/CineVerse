package com.cineverse.movie.controller;

import com.cineverse.movie.dto.ApiResponse;
import com.cineverse.movie.entity.Movie;
import com.cineverse.movie.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "*")
public class MovieController {

    @Autowired
    private MovieService movieService;

    @Value("${upload.dir:./uploads/posters}")
    private String uploadDir;

    @GetMapping
    public ResponseEntity<?> getMovies(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(defaultValue = "rating") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        if (page != null && size != null) {
            Page<Movie> paginated = movieService.getMoviesPaginated(page, size, sortBy, direction);
            return ResponseEntity.ok(ApiResponse.success("Movies fetched successfully (paginated)", paginated));
        }
        List<Movie> all = movieService.getAllMovies();
        return ResponseEntity.ok(ApiResponse.success("Movies fetched successfully", all));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMovieById(@PathVariable String id) {
        return movieService.getMovieById(id)
                .<ResponseEntity<?>>map(movie -> ResponseEntity.ok(ApiResponse.success("Movie fetched successfully", movie)))
                .orElseGet(() -> ResponseEntity.status(404).body(ApiResponse.error("Movie not found")));
    }

    @PostMapping
    public ResponseEntity<?> addMovie(@RequestBody Movie movie) {
        try {
            Movie saved = movieService.addMovie(movie);
            return ResponseEntity.ok(ApiResponse.success("Movie created successfully", saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to create movie: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMovie(@PathVariable String id, @RequestBody Movie movie) {
        try {
            Movie updated = movieService.updateMovie(id, movie);
            return ResponseEntity.ok(ApiResponse.success("Movie updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ApiResponse.error("Failed to update movie: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMovie(@PathVariable String id) {
        try {
            movieService.deleteMovie(id);
            return ResponseEntity.ok(ApiResponse.success("Movie deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ApiResponse.error("Failed to delete movie: " + e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchMovies(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) Double minRating) {
        
        if (title != null && !title.trim().isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success("Search results for title: " + title, movieService.searchByTitle(title)));
        } else if (genre != null && !genre.trim().isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success("Search results for genre: " + genre, movieService.searchByGenre(genre)));
        } else if (minRating != null) {
            return ResponseEntity.ok(ApiResponse.success("Search results for min rating: " + minRating, movieService.searchByRating(minRating)));
        }
        return ResponseEntity.ok(ApiResponse.success("All movies", movieService.getAllMovies()));
    }

    @PostMapping("/{id}/poster")
    public ResponseEntity<?> uploadPoster(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("File is empty"));
            }
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }
            String originalFileName = file.getOriginalFilename();
            String fileExtension = originalFileName != null && originalFileName.contains(".") 
                    ? originalFileName.substring(originalFileName.lastIndexOf(".")) 
                    : ".jpg";
            String fileName = id + "_" + System.currentTimeMillis() + fileExtension;
            File destFile = new File(directory, fileName);
            file.transferTo(destFile);

            String posterUrl = "/api/movies/posters/" + fileName;
            
            Optional<Movie> movieOpt = movieService.getMovieById(id);
            if (movieOpt.isEmpty()) {
                return ResponseEntity.status(404).body(ApiResponse.error("Movie not found"));
            }
            Movie movie = movieOpt.get();
            movie.setImage(posterUrl);
            Movie saved = movieService.addMovie(movie);
            
            return ResponseEntity.ok(ApiResponse.success("Poster uploaded successfully", saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File upload failed: " + e.getMessage()));
        }
    }

    @GetMapping("/posters/{fileName:.+}")
    public ResponseEntity<Resource> getPoster(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                String contentType = "image/jpeg";
                if (fileName.toLowerCase().endsWith(".png")) {
                    contentType = "image/png";
                } else if (fileName.toLowerCase().endsWith(".gif")) {
                    contentType = "image/gif";
                }
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
