import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import './Pages.css';
import { movieService } from '../services/api';

const SeatManagement = ({ movies = [], onAddShowMessage }) => {
  const [selectedMovieId, setSelectedMovieId] = useState(movies.length > 0 ? movies[0].id : '');
  const [showDate, setShowDate] = useState('2026-06-12');
  const [showTime, setShowTime] = useState('18:00');
  
  // Custom seating configuration grid
  const [blockedSeats, setBlockedSeats] = useState(['B-3', 'B-4', 'D-5', 'D-6', 'A-8']);
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8];

  const toggleBlockSeat = (seatId) => {
    setBlockedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };

  const handleScheduleShow = async (e) => {
    e.preventDefault();
    const movieObj = movies.find((m) => m.id?.toString() === selectedMovieId?.toString());
    if (!movieObj) return;

    try {
      const showObj = {
        movieId: movieObj.id,
        movieTitle: movieObj.title,
        showDate: showDate,
        showTime: showTime,
        blockedSeats: blockedSeats.join(', ')
      };
      await movieService.addShow(showObj);
      onAddShowMessage(`Scheduled "${movieObj.title}" for ${showDate} at ${showTime}. Total blocked manager seats: ${blockedSeats.length}`);
    } catch (err) {
      console.error('Failed to schedule show:', err);
      onAddShowMessage(`Failed to schedule show: ${err.message}`);
    }
  };

  return (
    <div className="cv-page cv-seat-mgmt-page">
      <div className="cv-booking-container">
        
        {/* Schedule Creator */}
        <Card className="cv-booking-form-card" hoverEffect={false}>
          <h2 className="cv-booking-form-title">Schedule New Show</h2>
          
          <form onSubmit={handleScheduleShow}>
            <div className="cv-booking-form-group">
              <label className="cv-booking-label">Choose Movie</label>
              <select
                className="cv-booking-select"
                value={selectedMovieId}
                onChange={(e) => setSelectedMovieId(e.target.value)}
                required
              >
                <option value="">Select Movie...</option>
                {movies.map((movie) => (
                  <option key={movie.id} value={movie.id}>
                    {movie.title}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="Show Date"
                  type="date"
                  value={showDate}
                  onChange={(e) => setShowDate(e.target.value)}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  label="Show Time"
                  type="time"
                  value={showTime}
                  onChange={(e) => setShowTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="primary" style={{ width: '100%' }}>
              Publish Seating Show Schedule
            </Button>
          </form>

          {/* Pricing configurations */}
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Configured Row Ticket Prices</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Row A & B (VIP Lounge):</span>
                <strong style={{ color: 'var(--primary)' }}>₹20.00</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Row C & D (Standard Club):</span>
                <strong>₹12.50</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Row E (Economy Classic):</span>
                <strong>₹8.00</strong>
              </div>
            </div>
          </div>
        </Card>

        {/* Live Theater Seating Allocation Grid */}
        <Card className="cv-bookings-list-card" hoverEffect={false}>
          <h3 className="cv-bookings-list-title">Theater Seat Auditor</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Click on seats to block/reserve them for group reservations or maintenance.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
            {/* Curved Screen */}
            <div className="cv-theater-screen-container" style={{ width: '100%' }}>
              <div className="cv-theater-screen">MANAGER CONSOLE SCREEN</div>
              <div className="cv-theater-screen-glow"></div>
            </div>

            {/* Config Seating grid */}
            <div className="cv-seats-grid" style={{ maxWidth: '100%' }}>
              {rows.map((row) => (
                <div key={row} className="cv-seats-row">
                  <span className="cv-row-label">{row}</span>
                  <div className="cv-row-seats">
                    {cols.map((col) => {
                      const seatId = `${row}-${col}`;
                      const isBlocked = blockedSeats.includes(seatId);
                      return (
                        <button
                          key={col}
                          type="button"
                          className={`cv-seat-btn ${isBlocked ? 'cv-seat-reserved' : 'cv-seat-available'}`}
                          onClick={() => toggleBlockSeat(seatId)}
                          style={{ position: 'relative' }}
                          title={isBlocked ? `Seat ${seatId} is BLOCKED` : `Seat ${seatId} is ACTIVE`}
                        >
                          {col}
                        </button>
                      );
                    })}
                  </div>
                  <span className="cv-row-label">{row}</span>
                </div>
              ))}
            </div>

            {/* Custom Seating Legend */}
            <div className="cv-seat-legend" style={{ gap: '2rem' }}>
              <div className="cv-legend-item">
                <div className="cv-seat-legend-icon cv-seat-available"></div>
                <span>Active & Sellable</span>
              </div>
              <div className="cv-legend-item">
                <div className="cv-seat-legend-icon cv-seat-reserved"></div>
                <span>Blocked / Under Maintenance</span>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default SeatManagement;
