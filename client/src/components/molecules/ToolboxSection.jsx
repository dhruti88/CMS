import React from 'react';

const ToolboxSection = ({ title, children }) => (
  <div className="toolbox-section">
    <h3>{title}</h3>
    {children}
  </div>
);

export default ToolboxSection;
