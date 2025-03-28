import React, { useState, useEffect } from "react";
import { Tooltip, IconButton, TextField } from "@mui/material";
import { Edit, Delete, Close } from "@mui/icons-material";
import "./SectionReplacementPanel.css"; // Keep consistent styling

const SectionReplacementPanel = ({ 
  availableLayouts, 
  targetSection, 
  onReplaceSection, 
  onClose 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSections, setFilteredSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);

  useEffect(() => {
    if (!availableLayouts) return;

    // Flatten sections from all layouts and filter based on search term
    const allSections = availableLayouts.flatMap(layout =>
      (layout.sections || []).map(section => ({
        ...section,
        layoutName: layout.title || "Unnamed Layout",
      }))
    );

    const filtered = allSections.filter(sec =>
      ((sec.title || sec.name || sec.id) + " " + sec.layoutName)
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    setFilteredSections(filtered);
  }, [availableLayouts, searchTerm]);

  // Close modal when clicking outside
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("replacement-panel-overlay")) {
      onClose();
    }
  };

  // Handle section replacement
  const handleReplace = () => {
    if (!selectedSection || !targetSection) return;
    onReplaceSection(selectedSection);
    onClose();
  };

  return (
    <div className="replacement-panel-overlay" onClick={handleOverlayClick}>
      <div className="replacement-panel">
        {/* Header */}
        <div className="panel-header">
          <h3 className="panel-title">Search Sections</h3>
        </div>

        {/* Search Input */}
        <div className="search-container">
          <TextField
            label="Search Sections..."
            variant="outlined"
            fullWidth
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="section-search-input"
          />
        </div>

        {/* Section List */}
        <div className="section-list">
          {filteredSections.length > 0 ? (
            filteredSections.map(sec => (
              <div
                key={sec._id || sec.id}
                className={`section-item ${selectedSection === sec ? "selected" : ""}`}
                onClick={() => setSelectedSection(sec)}
                onDoubleClick={() => onReplaceSection(sec)} // Double-click to replace section
                role="button"
                tabIndex={0}
              >
                {/* Section Main Details */}
                <div className="section-item-main">
                  <span className="section-title">{sec.title || sec.name || sec.id}</span>
                  <span className="section-item-details">{sec.layoutName}</span>
                </div>

                {/* Section Size Info */}
                {sec.sizeInfo?.cols && (
                  <span className="section-item-size">
                    {`${sec.sizeInfo.cols}×${sec.sizeInfo.rows}`}
                  </span>
                )}

                {/* Action Buttons */}
                <div className="section-item-actions">
                  <Tooltip title="Delete Section">
                    <IconButton 
                      onClick={() => console.log("Delete section:", sec)} 
                      className="icon-accent"
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            ))
          ) : (
            <p className="no-sections">No matching sections found.</p>
          )}
        </div>
        </div>
    </div>
  );
};

export default SectionReplacementPanel;
