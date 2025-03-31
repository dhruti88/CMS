import React, { useState, useEffect } from "react";
import { Tooltip, IconButton, TextField } from "@mui/material";
import { Edit, Delete, Close, Padding } from "@mui/icons-material";
import "../organisms/SectionReplacementPanel.css"; // Keep consistent styling

const LayoutSelectionPanel = ({ 
  availableLayouts, 
  loadLayoutFromSelected, 
  handleDeleteLayout, 
  setShowLayoutList, 
  isDeleting 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLayouts, setFilteredLayouts] = useState([]);
  const [selectedLayout, setSelectedLayout] = useState(null);

  useEffect(() => {
    if (!availableLayouts) return;

    // Filter layouts based on search term
    const filtered = availableLayouts.filter(layout => 
      layout.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredLayouts(filtered);
  }, [availableLayouts, searchTerm]);

  // Close modal when clicking outside
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("replacement-panel-overlay")) {
      setShowLayoutList(false);
    }
  };

  return (
    <div className="replacement-panel-overlay" onClick={handleOverlayClick}>
      <div className="replacement-panel">
        {/* Header */}
        <div className="panel-header">
          <h3 className="panel-title">Search Layouts</h3>
        </div>

        {/* Search Input */}
        <div className="search-container">
          <TextField
            label="Search Layouts..."
            variant="outlined"
            fullWidth
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="section-search-input"
          />
        </div>

        {/* Layout List */}
        <div className="section-list">
          {filteredLayouts.length > 0 ? (
            filteredLayouts.map(layout => (
              <div
                key={layout._id} 
                className={`section-item ${selectedLayout === layout._id ? "selected" : ""}`}
                onClick={() => setSelectedLayout(layout._id)}
                onDoubleClick={() => loadLayoutFromSelected(layout)} // Double-click to edit layout
                role="button"
                tabIndex={0}
              >
                {/* Section Main Details */}
                <div className="section-item-main">
                  <span className="section-title">{layout.title || "Untitled Layout" }</span>
                  <span className="section-item-details">{layout.author || "Unknown"}</span>
                </div>

                {/* Section Size Info */}
                {layout.gridSettings?.columns && (
                  <span className="section-item-size">
                    {`${layout.gridSettings?.columns}×${layout.gridSettings?.rows}`}
                  </span>
                )}

                {/* Action Buttons */}
                <div className="section-item-actions">
                  <Tooltip title="Delete Layout">
                    <IconButton 
                      onClick={() => handleDeleteLayout(layout)} 
                      disabled={isDeleting === layout._id}
                      className={isDeleting === layout._id ? "icon-disabled" : "icon-accent"}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            ))
          ) : (
            <p className="no-sections">No matching layouts found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LayoutSelectionPanel;
