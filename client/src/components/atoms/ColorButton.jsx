import React from 'react';

const ColorButton = ({ color, onClick, title }) => (
  <button
    className="color-button"
    style={{ backgroundColor: color }}
    onClick={() => onClick(color)}
    title={title}
  />
);

export default ColorButton;
