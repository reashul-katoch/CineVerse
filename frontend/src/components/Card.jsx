import React from 'react';
import './Card.css';

const Card = ({
  children,
  className = '',
  hoverEffect = true,
  onClick = null,
  ...props
}) => {
  return (
    <div
      className={`cv-card ${hoverEffect ? 'cv-card-hover' : ''} ${onClick ? 'cv-card-clickable' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
