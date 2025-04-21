import React, { useState, useEffect } from "react";
import { Tooltip, IconButton, TextField } from "@mui/material";
import { Delete } from "@mui/icons-material";
import "../../styles/LoadLayoutAndSection.css"; // Keep consistent styling
import { useNavigate } from "react-router-dom";
const LoadLayoutAndSection = ({
  availableLayouts,
  targetSection,
  onReplaceSection,
  loadLayoutFromSelected,
  handleDeleteLayout,
  setShowLayoutList,
  isDeleting,
  layouttype,
  // workbenchProps,
  // setlayoutid,
  mode = "layout" // "layout" or "section"
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {

    if (!availableLayouts) return;

    if (mode === "section") {
      // Extract selected section's size
      const { rows: selectedRows, cols: selectedCols } = targetSection?.sizeInfo || {};

      // Flatten sections from layouts where layouttype is "Section"
      const allSections = availableLayouts
        .filter(layout => layout.layouttype === "Section") // Filter layouts with layouttype "Section"
        .flatMap(layout =>
          (layout.sections || []).map(section => ({
            ...section,
            layoutName: layout.title || "Unnamed Layout",
          }))
        );

      // Filter sections based on search term and matching size
      const filtered = allSections.filter(sec => {
        const { rows, cols } = sec.sizeInfo || {};
        const matchesSize = selectedRows && selectedCols ? rows === selectedRows && cols === selectedCols : true;
        return (
          matchesSize &&
          ((sec.title || sec.name || sec.id) + " " + sec.layoutName)
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      });

      setFilteredItems(filtered);
    } else {
      // Filter layouts based only on search term
      const filtered = availableLayouts
        .filter(layout => layout.title.toLowerCase().includes(searchTerm.toLowerCase()));

      setFilteredItems(filtered);
    }
  }, [availableLayouts, searchTerm, mode, targetSection]);


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

  const loadLayout=(item)=>
  {
    // setTimeout(()=> navigate(`/page/${item._id}`),10);
    setShowLayoutList(false);
    
    setTimeout(()=> window.open(`/page/${item._id}`, '_blank'),10);
    // workbenchProps.setlayoutid(item._id);

    // loadLayoutFromSelected(item);
  };

  return (
    <div className="replacement-panel-overlay" onClick={handleOverlayClick}>
      <div className="replacement-panel">
        <div className="panel-header">
          <h3 className="panel-title">{mode === "section" ? "Search Sections" : "Search Layouts"}</h3>
        </div>

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

        <div className="section-list">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <div
                key={item._id || item.id}
                className={`section-item ${selectedItem === item ? "selected" : ""}`}
                onClick={() => setSelectedItem(item)}
                onDoubleClick={() => (mode === "section" ? onReplaceSection(item) : loadLayout(item))}
                role="button"
                tabIndex={0}
              >
                <div className="section-item-main">
                  <span className="section-title">
                    {mode === "section" ? item.title || item.name || item.id : item.title || "Untitled Layout"}
                  </span>
                  <span className="section-item-details">
                    {mode === "section" ? item.layoutName : item.author || "Unknown"}
                  </span>
                </div>

                {item.gridSettings?.columns || item.sizeInfo?.cols ? (
                  <span className="section-item-size">
                    {mode === "section"
                      ? `${item.sizeInfo?.cols}×${item.sizeInfo?.rows}`
                      : `${item.gridSettings?.columns}×${item.gridSettings?.rows}`}
                  </span>
                ) : null}

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