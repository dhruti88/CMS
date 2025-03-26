// workbenchaction.jsx:
import React from 'react';
import Button from '../atoms/Button';
import { downloadStageAsPDF } from '../../utils/pdfUtils';

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
  stageRef, // Add stageRef to props
  setHideGrid,        // New state function to hide grid
  setHideBackground,  // New state function to hide background
  setSelectedId
}) => {

  const handleExport = () => {
    setHideGrid(true);        // Hide grid before capture
    setHideBackground(true);  // Hide background before capture
    setSelectedId(null);      // Remove selection box (transformation)
    setTimeout(() => {
      exportToCMYKPDF();       // Capture stage as PDF
      setHideGrid(false);      // Restore grid after capture
      setHideBackground(false); // Restore background after capture
    }, 1000); // Small delay ensures UI updates before capturing
  };

  return (
    <div className="workbench-header">
      <h1>{layoutTitle}</h1>
      <div className="workbench-actions">
        <Button onClick={uploadCanvasImage} className="action-button">
          Upload Canvas
        </Button>
        <Button onClick={saveLayout} className="action-button">
          Save Layout
        </Button>
        <Button onClick={fetchAvailableLayouts} className="action-button">
          Search Layout
        </Button>

        {showLayoutList && (
          <div className="layout-list-modal">
            <h2>Select a Layout to Edit</h2>
            {availableLayouts.length > 0 ? (
              <ul>
                {availableLayouts.map((layout) => (
                  <li key={layout._id}>
                    <strong>{layout.title}</strong>
                    <Button onClick={() => loadLayoutFromSelected(layout)} className="small-button">
                      Edit
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No saved layouts found.</p>
            )}
            <Button onClick={() => setShowLayoutList(false)} className="small-button">
              Close
            </Button>
          </div>
        )}

        <Button
          onClick={() => setToolMode(toolMode === 'pointer' ? 'hand' : 'pointer')}
          className="action-button"
        >
          {toolMode === 'pointer' ? 'Switch to Hand Tool' : 'Switch to Pointer Tool'}
        </Button>
        <Button onClick={() => zoomBy(1.1)} className="action-button">
          Zoom In
        </Button>
        <Button onClick={() => zoomBy(1 / 1.1)} className="action-button">
          Zoom Out
        </Button>
        <Button onClick={() => handleExport()} className="action-button">
          Download as PDF
        </Button>
        <Button onClick={() => fitStageToScreen()} className="action-button">
          Reset View
        </Button>
      </div>
    </div>
  );
};

export default WorkbenchActions;