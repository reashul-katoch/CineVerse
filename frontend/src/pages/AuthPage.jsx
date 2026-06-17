import React, { useState } from 'react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import './AuthPage.css';
import { useAuth } from '../context/AuthContext';

const AuthPage = ({ onLoginSuccess, onCancel }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('Naitik Pathak');
  const [email, setEmail] = useState('naitik@cineverse.com');
  const [password, setPassword] = useState('123456');
  const [role, setRole] = useState('User'); // 'User', 'Theatre Owner', 'Admin'
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 5) {
      setError('Password must be at least 5 characters.');
      return;
    }

    if (!isLogin && name.trim().length < 3) {
      setError('Name must be at least 3 characters.');
      return;
    }

    try {
      if (isLogin) {
        const data = await login(email, password, role);
        onLoginSuccess(data.name, data.role, data.token, data.email);
      } else {
        const data = await register(email, name, password, role);
        onLoginSuccess(data.name, data.role, data.token, data.email);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="cv-auth-container">
      <Card className="cv-auth-card" hoverEffect={false}>
        {/* Back Link */}
        <button type="button" className="cv-auth-back" onClick={onCancel}>
          &larr; Back to Landing Page
        </button>

        <div className="cv-auth-header">
          <span className="cv-auth-logo-icon">🍿</span>
          <h2 className="cv-auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="cv-auth-subtitle">
            {isLogin ? 'Sign in to access your cinematic dashboard' : 'Join Cineverse to explore and book tickets'}
          </p>
        </div>

        {error && <div className="cv-auth-error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="cv-auth-form">
          {/* Full Name input for registration */}
          {!isLogin && (
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              icon="👤"
            />
          )}

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            icon="✉️"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            icon="🔒"
          />

          {/* Role selector - Crucial for RBAC assessment */}
          <div className="cv-auth-form-group">
            <label className="cv-auth-label">Select Account Role</label>
            <select
              className="cv-auth-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="User">Moviegoer (User)</option>
              <option value="Theatre Owner">Theatre Owner</option>
              <option value="Admin">System Administrator (Admin)</option>
            </select>
          </div>

          <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '1rem' }}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        <div className="cv-auth-toggle">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button type="button" className="cv-toggle-btn" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

        {/* Info Box detailing student credentials for SWC Assessment */}
        <div className="cv-auth-info-box glass-card">
          <p><strong>SWC Assessment Quick Testing Creds:</strong></p>
          <ul>
            <li><strong>Admin</strong>: <em>naitik@cineverse.com</em> / <em>123456</em></li>
            <li><strong>User</strong>: <em>alice@cineverse.com</em> / <em>123456</em></li>
            <li><strong>Theatre Owner</strong>: <em>manager@cineverse.com</em> / <em>123456</em></li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default AuthPage;
