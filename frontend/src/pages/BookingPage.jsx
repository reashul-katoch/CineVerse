import React, { useState, useEffect } from 'react';
import SeatLayout from '../components/SeatLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import './Pages.css';
import { movieService } from '../services/api';

const BookingPage = ({
  movies = [],
  bookings = [],
  onAddBooking,
  initialSelectedMovieId = null
}) => {
  const [selectedMovieId, setSelectedMovieId] = useState(
    initialSelectedMovieId || (movies.length > 0 ? movies[0].id : '')
  );
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [reservedSeats, setReservedSeats] = useState(['B-3', 'B-4', 'D-5', 'D-6', 'A-8']);

  const seatPrice = 12.5; // Price per seat in USD

  const selectedMovie = movies.find(m => m.id?.toString() === selectedMovieId?.toString());

  useEffect(() => {
    const fetchReservedSeats = async () => {
      if (!selectedMovieId) return;
      try {
        const shows = await movieService.getShows();
        const movieShows = shows.filter(s => s.movieId?.toString() === selectedMovieId?.toString());
        const allBlocked = ['B-3', 'B-4', 'D-5', 'D-6', 'A-8'];
        movieShows.forEach(s => {
          if (s.blockedSeats) {
            s.blockedSeats.split(',').forEach(seat => {
              const trimmed = seat.trim();
              if (trimmed && !allBlocked.includes(trimmed)) {
                allBlocked.push(trimmed);
              }
            });
          }
        });
        setReservedSeats(allBlocked);
      } catch (e) {
        console.error('Failed to fetch reserved seats:', e);
      }
    };
    fetchReservedSeats();
  }, [selectedMovieId]);

  const handleSeatClick = (seatId) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };

  const handleMovieChange = (e) => {
    setSelectedMovieId(e.target.value);
    setSelectedSeats([]); // Clear seats on movie change
    setBookingSuccess(null);
  };


  const handleBookTickets = (e) => {
    e.preventDefault();
    if (!selectedMovieId || selectedSeats.length === 0) return;

    const totalPrice = selectedSeats.length * seatPrice;
    
    // Call the parent function to update states/stats
    onAddBooking(selectedMovie.title, selectedSeats, totalPrice);
    
    // Record success detail locally
    setBookingSuccess({
      movie: selectedMovie.title,
      seats: selectedSeats.join(', '),
      price: totalPrice
    });

    // Clear seat selection
    setSelectedSeats([]);
  };

  return (
    <div className="cv-page cv-booking-page">
      <div className="cv-booking-container">
        
        {/* Booking Form Card */}
        <Card className="cv-booking-form-card" hoverEffect={false}>
          <h2 className="cv-booking-form-title">Select Movie & Seats</h2>
          
          <form onSubmit={handleBookTickets}>
            {/* Movie Selector */}
            <div className="cv-booking-form-group">
              <label className="cv-booking-label">Choose Movie</label>
              <select
                className="cv-booking-select"
                value={selectedMovieId}
                onChange={handleMovieChange}
                required
              >
                <option value="">Select a movie...</option>
                {movies.map(movie => (
                  <option key={movie.id} value={movie.id}>
                    {movie.title} ({movie.genre})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Movie Info Card */}
            {selectedMovie && (
              <div className="cv-booking-movie-meta glass-card">
                <img src={selectedMovie.image} alt={selectedMovie.title} className="cv-booking-meta-img" />
                <div className="cv-booking-meta-details">
                  <h4>{selectedMovie.title}</h4>
                  <p>⭐ {selectedMovie.rating.toFixed(1)}/10 &bull; {selectedMovie.genre} &bull; {selectedMovie.year}</p>
                </div>
              </div>
            )}

            {/* Seat Layout Selection */}
            {selectedMovie && (
              <div className="cv-booking-seats-section">
                <label className="cv-booking-label">Choose Seats</label>
                <SeatLayout
                  selectedSeats={selectedSeats}
                  onSeatClick={handleSeatClick}
                  reservedSeats={reservedSeats}
                />
              </div>
            )}

            {/* Price Calculations & Submission */}
            {selectedSeats.length > 0 && (
              <div className="cv-booking-checkout-section">
                <div className="cv-booking-summary">
                  <div>Selected Seats: <strong>{selectedSeats.join(', ')}</strong></div>
                  <div>Total Tickets: <strong>{selectedSeats.length}</strong></div>
                  <div className="cv-booking-total-price">
                    Total Amount: <span className="gradient-text">₹{(selectedSeats.length * seatPrice).toFixed(2)}</span>
                  </div>
                </div>
                <Button type="submit" variant="primary" style={{ width: '100%' }}>
                  Confirm & Book Tickets
                </Button>
              </div>
            )}
          </form>
        </Card>

        {/* Right Side: Active Tickets & Booking History */}
        <div className="cv-booking-history-panel">
          
          {/* Success Banner */}
          {bookingSuccess && (
            <Card className="cv-success-ticket-card" hoverEffect={false}>
              <span className="cv-success-icon">🎉</span>
              <h3 className="cv-success-title">Booking Successful!</h3>
              <div className="cv-ticket-details">
                <div className="cv-ticket-row"><span>Movie:</span><strong>{bookingSuccess.movie}</strong></div>
                <div className="cv-ticket-row"><span>Seats:</span><strong>{bookingSuccess.seats}</strong></div>
                <div className="cv-ticket-row"><span>Amount:</span><strong>₹{bookingSuccess.price.toFixed(2)}</strong></div>
                <div className="cv-ticket-row"><span>Status:</span><span className="cv-badge-confirmed">CONFIRMED</span></div>
              </div>
              <div className="cv-ticket-qr">
                {/* Simulated QR Code */}
                <div className="cv-qr-box">CINEVERSE-TICKET-OK</div>
                <span className="cv-qr-caption">Scan at the counter</span>
              </div>
            </Card>
          )}

          {/* Bookings List */}
          <Card className="cv-bookings-list-card" hoverEffect={false}>
            <h3 className="cv-bookings-list-title">Your Active Tickets ({bookings.length})</h3>
            <div className="cv-bookings-list">
              {bookings.map((booking) => (
                <div key={booking.id} className="cv-history-ticket-item glass-card">
                  <div className="cv-history-ticket-body">
                    <h4>{booking.movie}</h4>
                    <p>Seats: <strong>{booking.seats}</strong></p>
                    <p className="cv-history-ticket-price">₹{booking.price.toFixed(2)}</p>
                  </div>
                  <div className="cv-history-ticket-badge">CONFIRMED</div>
                </div>
              ))}
              {bookings.length === 0 && !bookingSuccess && (
                <div className="cv-bookings-empty-state">
                  <span style={{ fontSize: '2.5rem' }}>🎫</span>
                  <p>You have no active bookings at the moment.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default BookingPage;
