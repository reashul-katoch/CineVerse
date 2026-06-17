package com.cineverse.movie.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Document(collection = "movies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Movie {

    @Id
    private String id;

    private String title;
    private String genre;
    private Integer year;
    private Double rating;
    private String image;
    private String overview;

    @Transient
    private List<Map<String, Object>> reviews = new ArrayList<>();
}
