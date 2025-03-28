import React, { useState, useEffect } from "react";
import { Tooltip, IconButton, TextField } from "@mui/material";
import { Edit, Delete, Close } from "@mui/icons-material";
import "./SectionReplacementPanel.css"; // Keep consistent styling

const LoadLayoutAndSection = ({ 
  availableLayouts, 
  targetSection, 
  onReplaceSection, 
  loadLayoutFromSelected, 
  handleDeleteLayout, 
  setShowLayoutList, 
  isDeleting, 
  mode = "layout" // "layout" or "section"
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!availableLayouts) return;

    if (mode === "section") {
      // Flatten sections from layouts
      const allSections = availableLayouts.flatMap(layout =>
        (layout.sections || []).map(section => ({
          ...section,
          layoutName: layout.title || "Unnamed Layout",
        }))
      );

      // Filter based on search term
      const filtered = allSections.filter(sec =>
        ((sec.title || sec.name || sec.id) + " " + sec.layoutName)
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );

      setFilteredItems(filtered);
    } else {
      // Filter layouts based on search term
      const filtered = availableLayouts.filter(layout => 
        layout.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setFilteredItems(filtered);
    }
  }, [availableLayouts, searchTerm, mode]);

  // Close modal when clicking outside
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("replacement-panel-overlay")) {
      setShowLayoutList(false);
    }
  };

  // Handle section replacement
  const handleReplace = () => {
    if (!selectedItem || !targetSection) return;
    onReplaceSection(selectedItem);
    setShowLayoutList(false);
  };

  return (
    <div className="replacement-panel-overlay" onClick={handleOverlayClick}>
      <div className="replacement-panel">
        {/* Header */}
        <div className="panel-header">
          <h3 className="panel-title">
            {mode === "section" ? "Search Sections" : "Search Layouts"}
          </h3>
        </div>

        {/* Search Input */}
        <div className="search-container">
          <TextField
            label={mode === "section" ? "Search Sections..." : "Search Layouts..."}
            variant="outlined"
            fullWidth
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="section-search-input"
          />
        </div>

        {/* List */}
        <div className="section-list">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <div
                key={item._id || item.id}
                className={`section-item ${selectedItem === item ? "selected" : ""}`}
                onClick={() => setSelectedItem(item)}
                onDoubleClick={() => (mode === "section" ? onReplaceSection(item) : loadLayoutFromSelected(item))}
                role="button"
                tabIndex={0}
              >
                {/* Item Main Details */}
                <div className="section-item-main">
                  <span className="section-title">
                    {mode === "section" ? item.title || item.name || item.id : item.title || "Untitled Layout"}
                  </span>
                  <span className="section-item-details">
                    {mode === "section" ? item.layoutName : item.author || "Unknown"}
                  </span>
                </div>

                {/* Size Info */}
                {item.gridSettings?.columns || item.sizeInfo?.cols ? (
                  <span className="section-item-size">
                    {mode === "section"
                      ? `${item.sizeInfo?.cols}×${item.sizeInfo?.rows}`
                      : `${item.gridSettings?.columns}×${item.gridSettings?.rows}`}
                  </span>
                ) : null}

                {/* Action Buttons */}
                {mode === "layout" && (
                  <div className="section-item-actions">
                    <Tooltip title="Delete Layout">
                      <IconButton 
                        onClick={() => handleDeleteLayout(item)} 
                        disabled={isDeleting === item._id}
                        className={isDeleting === item._id ? "icon-disabled" : "icon-accent"}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </div>
                )}

                {/* Action Buttons */}
                {mode === "section" && (
                <div className="section-item-actions">
                  <Tooltip title="Delete Section">
                    <IconButton 
                      onClick={() => console.log("Delete section:", item.id)} 
                      className="icon-accent"
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </div>
                )}

              </div>
            ))
          ) : (
            <p className="no-sections">
              No matching {mode === "section" ? "sections" : "layouts"} found.
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default LoadLayoutAndSection;
