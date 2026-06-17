import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import BookingPage from './pages/BookingPage';
import SeatManagement from './pages/SeatManagement';
import Card from './components/Card';
import Button from './components/Button';
import './App.css';
import { movieService, reviewService } from './services/api';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

function AppContent() {
  const { isLoggedIn, userName, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [seatingInfoMsg, setSeatingInfoMsg] = useState(null);

  // Review submission states
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Quick book trigger
  const [quickBookMovieId, setQuickBookMovieId] = useState(null);

  const fetchMovies = async () => {
    try {
      const data = await movieService.getMovies();
      setMovies(data);
    } catch (err) {
      console.error('Failed to load movies:', err);
    }
  };

  const fetchBookings = async (username, role) => {
    try {
      const nameFilter = role === 'User' ? username : null;
      const data = await movieService.getBookings(nameFilter);
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    }
  };

  // On Mount
  useEffect(() => {
    fetchMovies();
  }, []);

  // Sync Bookings & Reviews Author
  useEffect(() => {
    if (isLoggedIn && userName) {
      fetchBookings(userName, userRole);
      setReviewAuthor(userName);
    }
  }, [isLoggedIn, userName, userRole]);

  // Filter movies for dashboard grid
  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          movie.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || movie.genre === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleQuickBook = (movieId) => {
    setQuickBookMovieId(movieId);
    navigate('/booking');
  };

  const handleAddBooking = async (movieTitle, seats, price) => {
    try {
      const newBooking = {
        username: userName,
        movieTitle: movieTitle,
        seats: seats.join(', '),
        price: price
      };
      await movieService.addBooking(newBooking);
      await fetchBookings(userName, userRole);
    } catch (err) {
      console.error('Booking failed:', err);
    }
  };

  const handleAddNewMovie = async (newMovieObj) => {
    try {
      await movieService.addMovie(newMovieObj);
      await fetchMovies();
    } catch (err) {
      console.error('Failed to add movie:', err);
    }
  };

  const handleShowMessage = (msg) => {
    setSeatingInfoMsg(msg);
    setTimeout(() => {
      setSeatingInfoMsg(null);
    }, 6000);
  };

  const handleOpenMovie = (movie) => {
    setSelectedMovie(movie);
    setReviewRating(5);
    setReviewComment('');
  };

  const handleCloseMovie = () => {
    setSelectedMovie(null);
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) return;

    try {
      const newReview = {
        movieId: selectedMovie.id,
        author: reviewAuthor,
        rating: reviewRating,
        comment: reviewComment
      };
      await reviewService.addReview(newReview);
      
      const data = await movieService.getMovies();
      setMovies(data);

      const updatedMovie = data.find(m => m.id === selectedMovie.id);
      if (updatedMovie) {
        setSelectedMovie(updatedMovie);
      }
      
      setReviewComment('');
    } catch (err) {
      console.error('Failed to add review:', err);
    }
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-main)' }}>
        Initializing Cineverse...
      </div>
    );
  }

  // App layout wrapper for protected views
  const renderLayout = (component) => {
    return (
      <div className="cv-app-container">
        <Navbar />
        <div className="cv-app-layout-wrapper">
          {seatingInfoMsg && (
            <div className="glass-card" style={{ maxWidth: '1400px', margin: '0 auto 1.5rem auto', borderColor: 'var(--primary)', color: 'var(--primary)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📢 <strong>System Notice:</strong> {seatingInfoMsg}</span>
              <button onClick={() => setSeatingInfoMsg(null)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
            </div>
          )}

          <div className="cv-app-layout-inner">
            <Sidebar 
              activeCategory={selectedCategory} 
              onCategoryChange={handleCategoryChange}
              stats={{
                totalMovies: movies.length,
                bookingsCount: bookings.length
              }}
            />
            <main className="cv-app-main-content">
              {component}
            </main>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={
            isLoggedIn ? <Navigate to="/dashboard" replace /> : (
              <LandingPage 
                onGetStarted={() => navigate('/login')} 
                trendingMovies={movies} 
              />
            )
          } 
        />
        
        <Route 
          path="/login" 
          element={
            isLoggedIn ? <Navigate to="/dashboard" replace /> : (
              <AuthPage 
                onLoginSuccess={() => navigate('/dashboard')} 
                onCancel={() => navigate('/')} 
              />
            )
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              {renderLayout(
                <Dashboard 
                  movies={filteredMovies}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onMovieClick={handleOpenMovie}
                  onQuickBook={handleQuickBook}
                  userRole={userRole}
                  onAddNewMovie={handleAddNewMovie}
                  bookingsCount={bookings.length}
                />
              )}
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/booking" 
          element={
            <ProtectedRoute allowedRoles={['User']}>
              {renderLayout(
                <BookingPage 
                  movies={movies}
                  bookings={bookings}
                  onAddBooking={handleAddBooking}
                  initialSelectedMovieId={quickBookMovieId}
                />
              )}
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/seat-mgmt" 
          element={
            <ProtectedRoute allowedRoles={['Theatre Owner', 'Admin']}>
              {renderLayout(
                <SeatManagement 
                  movies={movies}
                  onAddShowMessage={handleShowMessage}
                />
              )}
            </ProtectedRoute>
          } 
        />

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Movie Detail Modal with Review Section */}
      {selectedMovie && (
        <div className="modal-overlay" onClick={handleCloseMovie}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={handleCloseMovie}>✕</button>
            <div className="modal-body">
              <div className="modal-body-layout">
                <div className="modal-poster-wrap">
                  <img src={selectedMovie.image} alt={selectedMovie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="modal-details">
                  <span className="movie-genre">{selectedMovie.genre}</span>
                  <h2 className="modal-title">{selectedMovie.title}</h2>
                  <div className="modal-meta">
                    <span>📅 {selectedMovie.year}</span>
                    <span>⭐ {selectedMovie.rating.toFixed(1)} / 10</span>
                  </div>
                  <p className="modal-overview">{selectedMovie.overview}</p>
                  
                  {/* Hide book buttons for manager roles */}
                  {userRole === 'User' && (
                    <Button variant="primary" style={{ marginTop: '1rem' }} onClick={() => {
                      handleCloseMovie();
                      handleQuickBook(selectedMovie.id);
                    }}>
                      Book Tickets For This Movie
                    </Button>
                  )}
                </div>
              </div>

              {/* Audience Reviews */}
              <div className="reviews-section">
                <h3 className="reviews-title">User Reviews ({selectedMovie.reviews ? selectedMovie.reviews.length : 0})</h3>
                
                {/* Add Review Form */}
                <form className="review-form" onSubmit={handleAddReview}>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Reviewer Name</label>
                      <input 
                        type="text" 
                        className="search-input" 
                        style={{ padding: '0.5rem 1rem' }} 
                        value={reviewAuthor}
                        onChange={(e) => setReviewAuthor(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Rating</label>
                      <div className="rating-select">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            className={`star-btn ${reviewRating >= star ? 'filled' : ''}`}
                            onClick={() => setReviewRating(star)}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Comments</label>
                    <textarea 
                      className="review-textarea" 
                      placeholder="Write your review here..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="submit-btn">Post Review</button>
                </form>

                {/* Reviews List */}
                <div className="reviews-list">
                  {selectedMovie.reviews && selectedMovie.reviews.map(rev => (
                    <div key={rev.id} className="review-item">
                      <div className="review-header">
                        <span className="review-author">{rev.author}</span>
                        <span className="review-stars">
                          {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                        </span>
                      </div>
                      <p className="review-comment">{rev.comment}</p>
                    </div>
                  ))}
                  {(!selectedMovie.reviews || selectedMovie.reviews.length === 0) && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Be the first to review this movie!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="student-info-badge glass-card">
            <span className="student-info-item">👨‍💻 Candidate: <strong>Naitik Pathak</strong></span>
            <span className="student-info-item">🆔 Student UID: <strong>23BCB10041</strong></span>
            <span className="student-info-item">👥 Assessment Group: <strong>G16</strong></span>
            <span className="student-info-item">📋 Course Code / Assessment: <strong>Assessment SWC</strong></span>
          </div>
          <p className="footer-text">
            &copy; 2026 Cineverse. Created for SWC Assessment Submission.
          </p>
        </div>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
