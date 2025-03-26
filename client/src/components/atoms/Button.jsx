import React from 'react';

const Button = ({ onClick, className, children, title, sx }) => (
  <button 
    onClick={onClick} 
    className={className} 
    title={title} 
    style={{ ...sx }} // Apply sx as inline styles
  >
    {children}
  </button>
);

export default Button;
