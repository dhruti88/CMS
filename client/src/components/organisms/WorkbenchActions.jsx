import React from 'react';
import Button from '../atoms/Button';

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
}) => {
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
      </div>
    </div>
  );
};

export default WorkbenchActions;
