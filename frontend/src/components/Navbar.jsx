import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import './Navbar.css';

const Navbar = () => {
  const { userName, userRole, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="cv-navbar glass">
      <Link to="/dashboard" className="cv-navbar-logo" style={{ textDecoration: 'none' }}>
        <span className="cv-logo-emoji">🍿</span>
        <span className="cv-logo-text gradient-text">Cineverse</span>
      </Link>

      <nav className="cv-navbar-links">
        <Link
          to="/dashboard"
          className={`cv-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          Dashboard
        </Link>
        {userRole === 'User' ? (
          <Link
            to="/booking"
            className={`cv-nav-item ${location.pathname === '/booking' ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            Book Tickets
          </Link>
        ) : (
          <Link
            to="/seat-mgmt"
            className={`cv-nav-item ${location.pathname === '/seat-mgmt' ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            Seat Config
          </Link>
        )}
      </nav>

      <div className="cv-navbar-user">
        <div className="cv-user-avatar">
          {userName ? userName.charAt(0).toUpperCase() : 'U'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span className="cv-user-name">{userName || 'User'}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>{userRole}</span>
        </div>
        <Button
          variant="outline"
          onClick={handleLogoutClick}
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', marginLeft: '0.5rem' }}
        >
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
