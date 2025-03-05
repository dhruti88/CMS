import React from 'react';

const Button = ({ onClick, className, children, title }) => (
  <button onClick={onClick} className={className} title={title}>
    {children}
  </button>
);

export default Button;
