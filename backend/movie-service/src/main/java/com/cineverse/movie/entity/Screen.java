package com.cineverse.movie.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "screens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Screen {

    @Id
    private String id;
    private String name;
    private Integer capacity;
    private String theatreId;
    private Integer rowsCount;
    private Integer colsCount;
}
