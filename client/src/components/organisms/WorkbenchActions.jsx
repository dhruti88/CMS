import React from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { 
  Upload, Save, Search, PanTool, Mouse, ZoomIn, 
  ZoomOut, PictureAsPdf, Refresh, Delete, Edit, Close 
} from '@mui/icons-material';
import LoadLayoutAndSection from './LoadLayoutAndSection';
import '../../styles/WorkBench.css';

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
      {/* Title with better UI */}
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
        {/* Toolbar Buttons */}
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
          <IconButton onClick={() => {setShowLayoutList(true),fetchAvailableLayouts()}} className="icon-primary">
            <Search />
          </IconButton>
        </Tooltip>

        {/* Layout Selection Panel */}
        {showLayoutList && (
  <LoadLayoutAndSection 
    availableLayouts={availableLayouts}
    loadLayoutFromSelected={loadLayoutFromSelected}
    handleDeleteLayout={handleDeleteLayout}
    setShowLayoutList={setShowLayoutList}
    isDeleting={isDeleting}
    mode="layout" // Handles layout selection
  />
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
