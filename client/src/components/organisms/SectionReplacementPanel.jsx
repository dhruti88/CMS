import React, { useState, useEffect } from 'react';
import Button from '../atoms/Button';
import './SectionReplacementPanel.css';

const SectionReplacementPanel = ({ 
  availableLayouts,       // layouts from backend (each with a sections array)
  targetSection,          // the section from the current layout to be replaced
  onReplaceSection,       // callback function to handle section replacement
  onClose 
}) => {
  // Local state for the selected section (from available layouts)
  const [selectedSection, setSelectedSection] = useState(null);
  // We'll use searchTerm and filteredSections to let the user filter by section title or id.
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSections, setFilteredSections] = useState([]);

  // When availableLayouts or searchTerm changes, flatten the sections from all layouts and filter them.
  useEffect(() => {
    if (!availableLayouts) return;
    
    // Flatten sections from each layout with layout information
    const allSections = availableLayouts.flatMap(layout => 
      (layout.sections || []).map(section => ({
        ...section,
        layoutName: layout.title || 'Unnamed Layout'
      }))
    );

    const filtered = allSections.filter(sec => 
      ((sec.title || sec.name || sec.id) + ' ' + sec.layoutName)
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    setFilteredSections(filtered);
  }, [availableLayouts, searchTerm]);

  // Handle keyboard events for accessibility on each section item.
  const handleKeyDown = (event, sec) => {
    if (event.key === 'Enter' || event.key === ' ') {
      setSelectedSection(sec);
    }
  };

  // Handle section replacement
  const handleReplace = () => {
    if (!selectedSection || !targetSection) return;
    
    // Call the passed replacement function
    onReplaceSection(selectedSection);
    onClose();
  };

  return (
    <div 
      className="replacement-panel-overlay" 
      role="dialog" 
      aria-labelledby="replacement-panel-title"
    >
      <div className="replacement-panel">
        <h3 id="replacement-panel-title">Select Section to Replace</h3>
        
        {/* Search Input */}
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search sections..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="section-search-input"
          />
        </div>
        
        {/* List of filtered sections */}
        <div className="section-list">
          {filteredSections && filteredSections.length > 0 ? (
            filteredSections.map(sec => (
              <div
                key={sec._id || sec.id}
                className={`section-item ${
                  selectedSection && 
                  (selectedSection._id || selectedSection.id) === (sec._id || sec.id) 
                    ? 'selected' 
                    : ''
                }`}
                onClick={() => setSelectedSection(sec)}
                onKeyDown={(e) => handleKeyDown(e, sec)}
                tabIndex={0}
                role="button"
                aria-selected={
                  selectedSection && 
                  (selectedSection._id || selectedSection.id) === (sec._id || sec.id)
                }
              >
                <div className="section-item-main">
                  <span>{sec.title || sec.name || sec.id}</span>
                  <span className="section-item-details">
                    {`${sec.layoutName}`}
                  </span>
                </div>
                {sec.sizeInfo?.cols && (
                  <span className="section-item-size">
                    {`${sec.sizeInfo.cols}×${sec.sizeInfo.rows}`}
                  </span>
                )}
              </div>
            ))
          ) : (
            <p className="no-sections">
              {availableLayouts?.length > 0 
                ? "No sections match your search" 
                : "No sections available"
              }
            </p>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="panel-actions">
          <Button 
            onClick={handleReplace} 
            disabled={!selectedSection}
            aria-label="Replace selected section"
          >
            Replace Section
          </Button>
          <Button 
            onClick={onClose}
            aria-label="Cancel section replacement"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SectionReplacementPanel;