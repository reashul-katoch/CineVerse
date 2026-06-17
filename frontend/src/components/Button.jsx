import React from 'react';
import './Button.css';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary', 'secondary', 'outline', 'danger'
  disabled = false,
  className = '',
  icon = null,
  ...props
}) => {
  return (
    <button
      type={type}
      className={`cv-btn cv-btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="cv-btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
