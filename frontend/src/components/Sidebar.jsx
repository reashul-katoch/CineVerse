import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({
  activeCategory,
  onCategoryChange,
  categories = ["All", "Action", "Sci-Fi", "Drama", "Thriller"],
  stats = { totalMovies: 6, bookingsCount: 0 }
}) => {
  const { userRole } = useAuth();

  return (
    <aside className="cv-sidebar glass-card">
      <div className="cv-sidebar-section">
        <h4 className="cv-sidebar-title">Categories</h4>
        <div className="cv-sidebar-menu">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`cv-sidebar-link ${activeCategory === category ? 'active' : ''}`}
              onClick={() => onCategoryChange(category)}
            >
              <span className="cv-sidebar-icon">🎬</span>
              <span className="cv-sidebar-text">{category}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="cv-sidebar-section cv-sidebar-stats">
        <h4 className="cv-sidebar-title">Stats Overview</h4>
        <div className="cv-stat-item">
          <span className="cv-stat-label">Movies Available:</span>
          <span className="cv-stat-val">{stats.totalMovies}</span>
        </div>
        <div className="cv-stat-item">
          <span className="cv-stat-label">
            {userRole === 'User' ? 'Your Bookings:' : 'Total Bookings:'}
          </span>
          <span className="cv-stat-val gradient-text" style={{fontWeight: 700}}>
            {userRole === 'User' ? stats.bookingsCount : stats.bookingsCount + 148}
          </span>
        </div>
      </div>

      <div className="cv-sidebar-section">
        <h4 className="cv-sidebar-title">Student Profile</h4>
        <div className="cv-sidebar-profile">
          <div className="cv-profile-detail">
            <strong>Naitik Pathak</strong>
          </div>
          <div className="cv-profile-detail" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Role: <strong>{userRole}</strong>
          </div>
          <div className="cv-profile-detail" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            UID: 23BCB10041
          </div>
          <div className="cv-profile-detail" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Group: G16
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
