package com.cineverse.review.controller;

import com.cineverse.review.dto.ApiResponse;
import com.cineverse.review.entity.Review;
import com.cineverse.review.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping
    public ResponseEntity<?> getReviews(@RequestParam(required = false) String movieId) {
        if (movieId != null) {
            List<Review> movieReviews = reviewService.getReviewsByMovieId(movieId);
            return ResponseEntity.ok(ApiResponse.success("Reviews fetched for movie " + movieId, movieReviews));
        }
        List<Review> allReviews = reviewService.getAllReviews();
        return ResponseEntity.ok(ApiResponse.success("All reviews fetched successfully", allReviews));
    }

    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody Review review) {
        try {
            Review saved = reviewService.addReview(review);
            return ResponseEntity.ok(ApiResponse.success("Review added successfully", saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to add review: " + e.getMessage()));
        }
    }
}
