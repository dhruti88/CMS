import React from 'react';
import IconButton  from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Typography, Card } from "@mui/material";

import { 
  Upload, 
  Save, 
  Search, 
  PanTool, 
  Mouse, 
  ZoomIn, 
  ZoomOut, 
  PictureAsPdf, 
  Refresh, 
  Delete, 
  Edit, 
  Close 
} from '@mui/icons-material';
import '../../styles/WorkBench.css'; // Import your CSS file

const WorkbenchActions = ({
  uploadCanvasImage,
  saveLayout,
  fetchAvailableLayouts,
  toolMode,
  setToolMode,
  zoomBy,
  layoutTitle,
  showLayoutList,
  setShowLayoutList,
  availableLayouts,
  loadLayoutFromSelected, 
  exportToCMYKPDF,
  fitStageToScreen,
  setHideGrid,
  setHideBackground,
  setSelectedId,
  handleDeleteLayout,
  isDeleting,
}) => {

  const handleExport = () => {
    setHideGrid(true);
    setHideBackground(true);
    setSelectedId(null);
    setTimeout(() => {
      exportToCMYKPDF();
      setHideGrid(false);
      setHideBackground(false);
    }, 1000);
  };

  return (
    <div className="workbench-header">
    <Typography
      variant="h5"
      sx={{
        fontWeight: "bold",
        color: "var(--primary-color)",
        padding: "10px 0",
        textAlign: "center",
      }}
    >
      {layoutTitle}
    </Typography>



      <div className="workbench-actions">
        <Tooltip title="Upload Canvas">
          <IconButton onClick={uploadCanvasImage} className="icon-primary">
            <Upload />
          </IconButton>
        </Tooltip>

        <Tooltip title="Save Layout">
          <IconButton onClick={saveLayout} className="icon-primary">
            <Save />
          </IconButton>
        </Tooltip>

        <Tooltip title="Search Layout">
          <IconButton onClick={fetchAvailableLayouts} className="icon-primary">
            <Search />
          </IconButton>
        </Tooltip>

        {showLayoutList && (
          <div className="layout-list-modal">
            <h2>Select a Layout to Edit</h2>
            {availableLayouts.length > 0 ? (
              <ul>
                {availableLayouts.map((layout) => (
                  <li key={layout._id}>
                    <strong>{layout.title}</strong>
                    <Tooltip title="Edit Layout">
                      <IconButton onClick={() => loadLayoutFromSelected(layout)} className="icon-primary">
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Layout">
                      <IconButton 
                        onClick={() => handleDeleteLayout(layout)} 
                        disabled={isDeleting === layout._id}
                        className={isDeleting === layout._id ? "icon-disabled" : "icon-accent"}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No saved layouts found.</p>
            )}
            <Tooltip title="Close">
              <IconButton onClick={() => setShowLayoutList(false)} className="icon-text">
                <Close />
              </IconButton>
            </Tooltip>
          </div>
        )}

        <Tooltip title={toolMode === 'pointer' ? "Switch to Hand Tool" : "Switch to Pointer Tool"}>
          <IconButton onClick={() => setToolMode(toolMode === 'pointer' ? 'hand' : 'pointer')} className="icon-primary">
            {toolMode === 'pointer' ? <PanTool /> : <Mouse />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Zoom In">
          <IconButton onClick={() => zoomBy(1.1)} className="icon-primary">
            <ZoomIn />
          </IconButton>
        </Tooltip>

        <Tooltip title="Zoom Out">
          <IconButton onClick={() => zoomBy(1 / 1.1)} className="icon-primary">
            <ZoomOut />
          </IconButton>
        </Tooltip>

        <Tooltip title="Download as PDF">
          <IconButton onClick={handleExport} className="icon-primary">
            <PictureAsPdf />
          </IconButton>
        </Tooltip>

        <Tooltip title="Reset View">
          <IconButton onClick={fitStageToScreen} className="icon-primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

export default WorkbenchActions;
