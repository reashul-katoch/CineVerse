import React from 'react';
import Card from './Card';
import './MovieCard.css';

const MovieCard = ({ movie, onClick }) => {
  return (
    <Card className="cv-movie-card" onClick={onClick} hoverEffect={true}>
      <div className="cv-movie-poster-container">
        <img src={movie.image} alt={movie.title} className="cv-movie-poster" />
        <div className="cv-movie-rating">
          <span>★</span> {movie.rating.toFixed(1)}
        </div>
      </div>
      <div className="cv-movie-info">
        <span className="cv-movie-genre">{movie.genre}</span>
        <h3 className="cv-movie-title">{movie.title}</h3>
        <span className="cv-movie-year">{movie.year}</span>
      </div>
    </Card>
  );
};

export default MovieCard;
