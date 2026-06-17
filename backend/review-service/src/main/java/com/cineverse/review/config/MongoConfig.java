package com.cineverse.review.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MongoConfig {

    @Bean
    public MongoClient mongoClient() {
        String uri = System.getenv("SPRING_DATA_MONGODB_URI");
        if (uri == null || uri.trim().isEmpty()) {
            uri = System.getenv("SPRING_DATA_MONGODB_URL");
        }
        if (uri == null || uri.trim().isEmpty()) {
            uri = System.getenv("MONGODB_URI");
        }
        if (uri == null || uri.trim().isEmpty()) {
            uri = System.getenv("MONGO_URI");
        }
        if (uri == null || uri.trim().isEmpty()) {
            uri = "mongodb://localhost:27017/reviewdb";
        }
        
        // Securely mask password for logging
        String maskedUri = uri;
        if (uri.contains("@") && uri.contains("://")) {
            String prefix = uri.substring(0, uri.indexOf("://") + 3);
            String rest = uri.substring(uri.indexOf("://") + 3);
            if (rest.contains("@") && rest.contains(":")) {
                String credentials = rest.substring(0, rest.indexOf("@"));
                if (credentials.contains(":")) {
                    String username = credentials.substring(0, credentials.indexOf(":"));
                    String suffix = rest.substring(rest.indexOf("@"));
                    maskedUri = prefix + username + ":*****" + suffix;
                }
            }
        }
        System.out.println("=== MANUALLY INITIALIZING MONGO CLIENT WITH URI: " + maskedUri + " ===");
        return MongoClients.create(uri);
    }
}
