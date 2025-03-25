import React, { useState } from 'react';
import Button from '../atoms/Button';
import './NestedSectionsPanel.css';

const NestedSectionsPanel = ({
  availableLayouts,
  targetSectionId,
  onInsertNestedSections,
  onClose,
}) => {
  const [selectedLayout, setSelectedLayout] = useState(null);

  const handleSelectLayout = (layout) => {
    setSelectedLayout(layout);
  };

  const handleInsert = () => {
    if (selectedLayout && selectedLayout.sections) {
      onInsertNestedSections(selectedLayout.sections);
      onClose();
    }
  };

  return (
    <div className="nested-panel-overlay">
      <div className="nested-panel">
        <h3>Insert Nested Sections</h3>
        <div className="layout-list">
          {availableLayouts.map((layout) => (
            <div
              key={layout._id}
              className={`layout-item ${selectedLayout?._id === layout._id ? 'selected' : ''}`}
              onClick={() => handleSelectLayout(layout)}
            >
              {layout.title}
            </div>
          ))}
        </div>
        {selectedLayout && (
          <div className="selected-layout-preview">
            <h4>{selectedLayout.title}</h4>
            <p>{selectedLayout.sections.length} sections found</p>
          </div>
        )}
        <div className="panel-actions">
          <Button onClick={handleInsert}>Insert Sections</Button>
          <Button onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default NestedSectionsPanel;
