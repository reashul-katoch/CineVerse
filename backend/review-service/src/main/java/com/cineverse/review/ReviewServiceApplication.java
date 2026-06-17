package com.cineverse.review;

import com.cineverse.review.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ReviewServiceApplication implements CommandLineRunner {

	@Autowired
	private ReviewService reviewService;

	public static void main(String[] args) {
		System.out.println("=== STARTING REVIEW-SERVICE ===");
		System.out.println("All available Env Var Keys: " + System.getenv().keySet());
		System.out.println("SPRING_DATA_MONGODB_URI env: " + System.getenv("SPRING_DATA_MONGODB_URI"));
		System.out.println("=================================");
		SpringApplication.run(ReviewServiceApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		reviewService.initDefaultReviews();
	}
}
