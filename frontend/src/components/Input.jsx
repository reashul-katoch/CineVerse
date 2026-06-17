import React from 'react';
import './Input.css';

const Input = ({
  label = '',
  type = 'text',
  value,
  onChange,
  placeholder = '',
  className = '',
  error = '',
  icon = null,
  ...props
}) => {
  return (
    <div className={`cv-input-wrapper ${className}`}>
      {label && <label className="cv-input-label">{label}</label>}
      <div className={`cv-input-container ${error ? 'has-error' : ''}`}>
        {icon && <span className="cv-input-icon">{icon}</span>}
        <input
          type={type}
          className={`cv-input-field ${icon ? 'has-icon' : ''}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...props}
        />
      </div>
      {error && <span className="cv-input-error-msg">{error}</span>}
    </div>
  );
};

export default Input;
