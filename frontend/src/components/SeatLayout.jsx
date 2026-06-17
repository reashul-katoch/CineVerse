import React from 'react';
import './SeatLayout.css';

const SeatLayout = ({
  selectedSeats = [],
  onSeatClick,
  reservedSeats = ['B-3', 'B-4', 'D-5', 'D-6', 'A-8']
}) => {
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8];

  const getSeatId = (row, col) => `${row}-${col}`;

  const getSeatStatus = (seatId) => {
    if (reservedSeats.includes(seatId)) return 'reserved';
    if (selectedSeats.includes(seatId)) return 'selected';
    return 'available';
  };

  return (
    <div className="cv-seat-layout-container">
      {/* Screen Indicator */}
      <div className="cv-theater-screen-container">
        <div className="cv-theater-screen">SCREEN</div>
        <div className="cv-theater-screen-glow"></div>
      </div>

      {/* Seats Grid */}
      <div className="cv-seats-grid">
        {rows.map((row) => (
          <div key={row} className="cv-seats-row">
            <span className="cv-row-label">{row}</span>
            <div className="cv-row-seats">
              {cols.map((col) => {
                const seatId = getSeatId(row, col);
                const status = getSeatStatus(seatId);
                return (
                  <button
                    key={col}
                    type="button"
                    className={`cv-seat-btn cv-seat-${status}`}
                    onClick={() => status !== 'reserved' && onSeatClick(seatId)}
                    disabled={status === 'reserved'}
                    title={`Seat ${row}-${col}`}
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

      {/* Seat Legend */}
      <div className="cv-seat-legend">
        <div className="cv-legend-item">
          <div className="cv-seat-legend-icon cv-seat-available"></div>
          <span>Available</span>
        </div>
        <div className="cv-legend-item">
          <div className="cv-seat-legend-icon cv-seat-selected"></div>
          <span>Selected</span>
        </div>
        <div className="cv-legend-item">
          <div className="cv-seat-legend-icon cv-seat-reserved"></div>
          <span>Reserved</span>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;
