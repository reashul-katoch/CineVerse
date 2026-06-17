import React, { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import Input from '../components/Input';
import Card from '../components/Card';
import Button from '../components/Button';
import './Pages.css';
import { authService } from '../services/api';

const Dashboard = ({
  movies = [],
  searchQuery,
  setSearchQuery,
  onMovieClick,
  onQuickBook,
  userRole = 'User', // 'User', 'Theatre Owner', 'Admin'
  onAddNewMovie,
  bookingsCount = 1
}) => {
  // Add Movie Form State
  const [newTitle, setNewTitle] = useState('');
  const [newGenre, setNewGenre] = useState('Sci-Fi');
  const [newYear, setNewYear] = useState('2024');
  const [newRating, setNewRating] = useState('8.5');
  const [newImage, setNewImage] = useState('');
  const [newOverview, setNewOverview] = useState('');

  // Admin user list management
  const [userList, setUserList] = useState([]);

  const fetchUsers = async () => {
    try {
      const data = await authService.getUsers();
      // Map username to name for consistency with UI
      const mapped = data.map(u => ({
        id: u.id,
        name: u.username,
        role: u.role,
        status: u.status
      }));
      setUserList(mapped);
    } catch (e) {
      console.error('Failed to load users:', e);
    }
  };

  useEffect(() => {
    if (userRole === 'Admin') {
      fetchUsers();
    }
  }, [userRole]);

  const toggleUserStatus = async (userId) => {
    try {
      await authService.toggleUserStatus(userId);
      await fetchUsers();
    } catch (e) {
      console.error('Failed to toggle status:', e);
    }
  };


  const handleCreateMovie = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const dummyImage = newImage.trim() || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80';

    onAddNewMovie({
      id: Date.now(),
      title: newTitle,
      genre: newGenre,
      year: parseInt(newYear) || 2024,
      rating: parseFloat(newRating) || 8.0,
      image: dummyImage,
      overview: newOverview,
      reviews: []
    });

    // Reset fields
    setNewTitle('');
    setNewImage('');
    setNewOverview('');
  };

  return (
    <div className="cv-page cv-dashboard-page">
      {/* Featured Banner */}
      <Card className="cv-featured-banner" hoverEffect={false}>
        <div className="cv-featured-content">
          <span className="cv-featured-tag">🔥 Trending Now</span>
          <h2 className="cv-featured-title">The Godfather</h2>
          <p className="cv-featured-desc">
            The multi-award winning classic crime drama centering on the Corleone family. A timeless cinematic experience.
          </p>
          {userRole === 'User' && (
            <Button variant="primary" onClick={() => onQuickBook("100000000000000000000006")}>
              Book Tickets Now
            </Button>
          )}
        </div>
      </Card>

      {/* Role-Based Manager Panels */}
      {(userRole === 'Theatre Owner' || userRole === 'Admin') && (
        <div className="cv-manager-panels-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          
          {/* Add Movie Panel */}
          <Card className="cv-booking-form-card" hoverEffect={false}>
            <h3 className="cv-booking-form-title" style={{ fontSize: '1.25rem' }}>Add New Movie</h3>
            <form onSubmit={handleCreateMovie} className="cv-auth-form">
              <Input
                label="Movie Title"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Inception"
                required
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="cv-auth-label">Genre</label>
                  <select
                    className="cv-auth-select"
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                  >
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Action">Action</option>
                    <option value="Drama">Drama</option>
                    <option value="Thriller">Thriller</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <Input
                    label="Year"
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Input
                label="Initial Rating"
                type="number"
                step="0.1"
                min="1"
                max="10"
                value={newRating}
                onChange={(e) => setNewRating(e.target.value)}
                required
              />
              <Input
                label="Poster Image URL"
                type="text"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                placeholder="https://..."
              />
              <div className="cv-auth-form-group">
                <label className="cv-auth-label">Synopsis</label>
                <textarea
                  className="review-textarea"
                  value={newOverview}
                  onChange={(e) => setNewOverview(e.target.value)}
                  placeholder="Enter synopsis..."
                ></textarea>
              </div>
              <Button type="submit" variant="primary">Publish Movie Details</Button>
            </form>
          </Card>

          {/* View Reports Box Office Panel */}
          <Card className="cv-bookings-list-card" hoverEffect={false}>
            <h3 className="cv-bookings-list-title" style={{ fontSize: '1.25rem' }}>Box Office Report</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL REVENUE</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '850', color: 'var(--primary)' }}>₹24,850.50</div>
                </div>
                <span style={{ fontSize: '2rem' }}>💰</span>
              </div>

              <div className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SEATS BOOKED TODAY</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '850' }}>148 / 400</div>
                </div>
                <span style={{ fontSize: '2rem' }}>🎟️</span>
              </div>

              <div className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>POPULAR GENRE</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>Sci-Fi (45%)</div>
                </div>
                <span style={{ fontSize: '2rem' }}>🛸</span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                &bull; Live reports are aggregated across the gateway movie service database logs.
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Admin-only Manage Users Panel */}
      {userRole === 'Admin' && (
        <Card className="cv-bookings-list-card" hoverEffect={false} style={{ marginBottom: '3rem' }}>
          <h3 className="cv-bookings-list-title" style={{ fontSize: '1.25rem' }}>User Accounts Moderation</h3>
          <div className="cv-bookings-list" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem' }}>User ID</th>
                  <th style={{ padding: '0.75rem' }}>Name</th>
                  <th style={{ padding: '0.75rem' }}>Platform Role</th>
                  <th style={{ padding: '0.75rem' }}>Account Status</th>
                  <th style={{ padding: '0.75rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((usr) => (
                  <tr key={usr.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.75rem' }}>#{usr.id}</td>
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>{usr.name}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`cv-history-ticket-badge`} style={{ color: usr.role === 'Admin' ? 'var(--primary)' : usr.role === 'Theatre Owner' ? '#00bcff' : '#aaa', background: 'rgba(255,255,255,0.04)' }}>
                        {usr.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ color: usr.status === 'Active' ? '#4caf50' : '#e50914', fontWeight: '700' }}>
                        {usr.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <Button
                        variant={usr.status === 'Active' ? 'outline' : 'primary'}
                        onClick={() => toggleUserStatus(usr.id)}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        {usr.status === 'Active' ? 'Suspend' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Main Grid Section */}
      <div className="cv-dashboard-header">
        <h3 className="cv-section-title">Explore Catalog</h3>
        <div className="cv-dashboard-search">
          <Input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon="🔍"
          />
        </div>
      </div>

      <div className="cv-movies-grid-container">
        <div className="cv-dashboard-grid">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={() => onMovieClick(movie)}
            />
          ))}
        </div>
        {movies.length === 0 && (
          <div className="cv-no-results">
            <span style={{ fontSize: '2rem' }}>⚠️</span>
            <p>No movies match your current search or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
