import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import './LandingPage.css';

const LandingPage = ({ onGetStarted, trendingMovies = [] }) => {
  return (
    <div className="cv-landing-container">
      {/* Hero Header */}
      <header className="cv-landing-header glass">
        <div className="cv-landing-logo">
          <span className="cv-logo-emoji">🍿</span>
          <span className="cv-logo-text gradient-text">Cineverse</span>
        </div>
        <Button variant="outline" onClick={onGetStarted}>Sign In</Button>
      </header>

      {/* Main Hero Banner */}
      <section className="cv-landing-hero">
        <div className="cv-landing-hero-content">
          <h1 className="cv-landing-title">
            The Ultimate Cinematic <span className="gradient-text">Universe</span>
          </h1>
          <p className="cv-landing-subtitle">
            Book tickets instantly, design customized seating arrangements, audit ratings, and share audience feedback in one cohesive platform.
          </p>
          <div className="cv-landing-ctas">
            <Button variant="primary" size="large" onClick={onGetStarted} style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}>
              Get Started Free
            </Button>
            <a href="#features" className="cv-landing-secondary-link">Learn More &rarr;</a>
          </div>
        </div>
        <div className="cv-landing-hero-glow"></div>
      </section>

      {/* Trending Section */}
      <section className="cv-landing-trending">
        <h2 className="cv-landing-section-title">Trending in Cineverse</h2>
        <div className="cv-landing-trending-grid">
          {trendingMovies.slice(0, 3).map((movie) => (
            <div key={movie.id} className="cv-trending-card glass-card">
              <div className="cv-trending-img-wrap">
                <img src={movie.image} alt={movie.title} />
              </div>
              <div className="cv-trending-info">
                <h4>{movie.title}</h4>
                <p>⭐ {movie.rating.toFixed(1)} &bull; {movie.genre}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Role-Based Features Grid */}
      <section id="features" className="cv-landing-features">
        <h2 className="cv-landing-section-title">One Platform, Many Roles</h2>
        <p className="cv-landing-section-subtitle">Customized experiences crafted for audience members, cinema managers, and administrators.</p>
        
        <div className="cv-features-grid">
          <Card className="cv-feature-card">
            <span className="cv-feature-icon">🎟️</span>
            <h3>For Moviegoers</h3>
            <p>Explore hot titles, reserve seats in real time with our live screen simulator, and post movie critiques.</p>
          </Card>
          <Card className="cv-feature-card">
            <span className="cv-feature-icon">🎭</span>
            <h3>For Theater Owners</h3>
            <p>Publish movie shows, define custom ticket pricing by seating class, manage layouts, and track local box office sales.</p>
          </Card>
          <Card className="cv-feature-card">
            <span className="cv-feature-icon">🛡️</span>
            <h3>For Platform Admins</h3>
            <p>Full system command: oversee registered user accounts, manage shows globally, view dashboard stats, and moderate comments.</p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="cv-landing-footer">
        <div className="cv-landing-footer-badge glass-card">
          <span className="student-info-item">👨‍💻 Candidate: <strong>Naitik Pathak</strong></span>
          <span className="student-info-item">🆔 Student UID: <strong>23BCB10041</strong></span>
          <span className="student-info-item">👥 Assessment Group: <strong>G16</strong></span>
        </div>
        <p className="cv-landing-footer-text">&copy; 2026 Cineverse. Created for SWC assessment submission.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
