import React, { useState } from 'react';
import Button from '../atoms/Button';
import './SectionReplacementPanel.css';

const SectionReplacementPanel = ({ availableSections, onReplaceSection, onClose }) => {
  const [selectedSection, setSelectedSection] = useState(null);

  return (
    <div className="replacement-panel-overlay">
      <div className="replacement-panel">
        <h3>Select Section to Replace With</h3>
        <div className="section-list">
          {availableSections && availableSections.length > 0 ? (
            availableSections.map(sec => (
              <div
                key={sec._id || sec.id}
                className={`section-item ${
                  selectedSection && (selectedSection._id || selectedSection.id) === (sec._id || sec.id)
                    ? 'selected'
                    : ''
                }`}
                onClick={() => setSelectedSection(sec)}
              >
                {sec.title || sec.name || sec.id}{' '}
                {sec.sizeInfo?.cols ? `(${sec.sizeInfo.cols}×${sec.sizeInfo.rows})` : ''}
              </div>
            ))
          ) : (
            <p>No sections available.</p>
          )}
        </div>
        <div className="panel-actions">
          <Button onClick={() => onReplaceSection(selectedSection)} disabled={!selectedSection}>
            Replace Section
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default SectionReplacementPanel;
