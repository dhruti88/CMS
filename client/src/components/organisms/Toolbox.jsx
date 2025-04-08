import React, { useEffect, useContext } from 'react';
import Button from '../atoms/Button';
import ColorButton from '../atoms/ColorButton';
import ToolboxSection from '../molecules/ToolboxSection';
import TextFormattingTools from '../molecules/TextFormattingTools';
import ManualRowColumn from '../molecules/ManualRowColumn';
import { TextField, MenuItem, Select, FormControl, Grid, InputLabel, CircularProgress, Box } from '@mui/material';
import { CheckCircle, PauseCircle } from '@mui/icons-material';
import { WorkbenchContext } from '../../context/WorkbenchContext';

const Toolbox = () => {
  const workbenchProps = useContext(WorkbenchContext);

  // Find selected section
  const selectedSection = workbenchProps.sections.find(
    section => section.id === workbenchProps.selectedId
  );

  useEffect(() => {
    if (workbenchProps.layoutType !== "Page") {
      workbenchProps.addNewSection({
        cols: workbenchProps.columns,
        rows: workbenchProps.rows,
        label: `${workbenchProps.columns}×${workbenchProps.rows}`,
      });
    }
  }, [workbenchProps.layoutType]);

  // Find selected item inside a section
  const selectedItem = workbenchProps.sections
    .flatMap(section => section.items)
    .find(item => item.id === workbenchProps.selectedId);

  const toggleBorder = (border) => {
    workbenchProps.setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === workbenchProps.selectedId
          ? {
              ...section,
              borderStyle: {
                left: section.borderStyle?.left || false,
                right: section.borderStyle?.right || false,
                top: section.borderStyle?.top || false,
                bottom: section.borderStyle?.bottom || false,
                [border]: !section.borderStyle?.[border], // Toggle specific border
              },
            }
          : section
      )
    );
  };

  const changeBorderColor = (color) => {
    workbenchProps.setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === workbenchProps.selectedId
          ? { ...section, borderColor: color }
          : section
      )
    );
  };

  const changeBorderWidth = (newWidth) => {
    workbenchProps.setSections((prev) =>
      prev.map((section) =>
        section.id === workbenchProps.selectedId
          ? { ...section, borderWidth: newWidth }
          : section
      )
    );
  };

  return (
    <div className="toolbox">
      <h2 className="toolbox-header">Tool Box</h2>

      <ToolboxSection>
        {/* Task Status & Layout Type */}
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel sx={{ background: "#f8f9fa", px: 0.5 }}>Task Status</InputLabel>
            <Select
              value={workbenchProps.taskStatus}
              onChange={(e) => workbenchProps.setTaskStatus(e.target.value)}
            >
              <MenuItem value="In Progress">
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={16} color="primary" />
                  In Progress
                </Box>
              </MenuItem>
              <MenuItem value="Pending">
                <Box display="flex" alignItems="center" gap={1}>
                  <PauseCircle color="warning" />
                  Pending
                </Box>
              </MenuItem>
              <MenuItem value="Completed">
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircle color="success" />
                  Completed
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </ToolboxSection>

      {/* Add Sections */}
      {workbenchProps.layoutType === "Page" && (
        <ToolboxSection title="Add Sections">
          <div className="size-section">
            <h4>Sections</h4>
            <div className="size-grid">
              {workbenchProps.itemSizes.map((size) => (
                <Button
                  key={`box-${size.label}`}
                  onClick={() => workbenchProps.addNewSection(size)}
                  className="size-button"
                >
                  {size.label}
                </Button>
              ))}
            </div>
          </div>

          <ManualRowColumn
            title="Manual Section"
            buttonText="Add"
            handleClick={workbenchProps.addNewSection}
          />
        </ToolboxSection>
      )}

      {/* Add Elements */}
      <ToolboxSection title="Add Elements">
        <div className="size-section">
          <h4>Text Boxes</h4>
          <div className="size-grid">
            {workbenchProps.itemSizes.map(size => (
              <Button
                key={`text-${size.label}`}
                onClick={() =>
                  workbenchProps.addItemToSection(
                    workbenchProps.sectionId,
                    size,
                    "text"
                  )
                }
                className="size-button"
              >
                {size.label}
              </Button>
            ))}
          </div>
          <ManualRowColumn
            title="Manual Text Box"
            buttonText="Add"
            sectionId={workbenchProps.sectionId}
            type="text"
            handleClick={workbenchProps.addItemToSection}
          />
        </div>

        <div className="size-section">
          <h4>Images</h4>
          <div className="size-grid">
            {workbenchProps.itemSizes.map(size => (
              <Button
                key={`image-${size.label}`}
                onClick={() =>
                  workbenchProps.addItemToSection(
                    workbenchProps.sectionId,
                    size,
                    "dimage"
                  )
                }
                className="size-button"
              >
                {size.label}
              </Button>
            ))}
          </div>
          <ManualRowColumn
            title="Manual Image"
            buttonText="Add"
            sectionId={workbenchProps.sectionId}
            type="dimage"
            handleClick={workbenchProps.addItemToSection}
          />
        </div>

        <div className="size-section">
          <h4>Upload Image</h4>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              workbenchProps.handleImageUpload(workbenchProps.sectionId, e)
            }
          />
        </div>
      </ToolboxSection>

      {/* Text Formatting Tools (only for text items) */}
      {selectedItem?.type === 'text' && (
        <ToolboxSection title="Text Formatting">
          <TextFormattingTools
            textFormatting={workbenchProps.textFormatting}
            toggleFormat={workbenchProps.toggleFormat}
            changeFontSize={workbenchProps.changeFontSize}
            handleTextChange={workbenchProps.handleTextChange}
            textValue={workbenchProps.textValue}
            setTextFormatting={workbenchProps.setTextFormatting}
            changeFontFamily={workbenchProps.changeFontFamily}
          />
        </ToolboxSection>
      )}

      {/* Item Properties (for sections & items) */}
      <ToolboxSection title="Item Properties">
        {workbenchProps.selectedId ? (
          <>
            <div className="property-group">
              <label>ID:</label>
              <span>{workbenchProps.selectedId}</span>
            </div>

            <div className="property-group">
              <label>Type:</label>
              <span>
                {selectedItem?.type || (selectedSection ? 'Section' : 'Unknown')}
              </span>
            </div>

            <div className="property-group">
              <label>Position:</label>
              <span>
                {selectedSection
                  ? `Col: ${selectedSection.gridX}, Row: ${selectedSection.gridY}`
                  : `Col: ${Math.round(
                      selectedItem?.x /
                        (workbenchProps.cellWidth + workbenchProps.gutterWidth)
                    ) || 0}, 
                     Row: ${Math.round(selectedItem?.y / workbenchProps.cellHeight) || 0}`}
              </span>
            </div>

            <div className="property-group">
              <label>Size:</label>
              <span>
                {selectedSection
                  ? `${selectedSection.sizeInfo.cols} × ${selectedSection.sizeInfo.rows}`
                  : `${selectedItem?.sizeInfo?.cols || 1} × ${selectedItem?.sizeInfo?.rows || 1}`}
              </span>
            </div>

            {/* Text Formatting for Selected Text Items */}
            {selectedItem?.type === 'text' && (
              <div className="color-palette">
                <h4>Color</h4>
                <div className="color-buttons">
                  {workbenchProps.colors.primary.map((color, index) => (
                    <ColorButton
                      key={`primary-${index}`}
                      color={color}
                      onClick={() => workbenchProps.changeItemColor(color)}
                      title={`Primary ${index + 1}`}
                    />
                  ))}
                  {workbenchProps.colors.accent.map((color, index) => (
                    <ColorButton
                      key={`accent-${index}`}
                      color={color}
                      onClick={() => workbenchProps.changeItemColor(color)}
                      title={`Accent ${index + 1}`}
                    />
                  ))}
                  {workbenchProps.colors.grays.map((color, index) => (
                    <ColorButton
                      key={`gray-${index}`}
                      color={color}
                      onClick={() => workbenchProps.changeItemColor(color)}
                      title={`Gray ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {(workbenchProps.layoutType === "Page" ||
              workbenchProps.selectedId !== workbenchProps.sectionId) && (
              <Button
                className="delete-button"
                onClick={workbenchProps.deleteSelected}
                title="Delete selected item"
              >
                Delete Item
              </Button>
            )}
          </>
        ) : (
          <p className="no-selection">
            No item selected. Click on an item to view its properties.
          </p>
        )}
      </ToolboxSection>

      {workbenchProps.selectedId === workbenchProps.sectionId && selectedSection && (
        <ToolboxSection title="Add Border">
          <div className="size-section">
            <h4>Border</h4>
            <div className="size-grid">
              {["left", "right", "top", "bottom"].map((border) => (
                <Button
                  key={`line-${border}`}
                  onClick={() => toggleBorder(border)}
                  className={`size-button ${
                    selectedSection.borderStyle?.[border] ? 'active' : ''
                  }`}
                >
                  {border}
                </Button>
              ))}
            </div>
            <TextField
              label="Border Width"
              type="number"
              variant="outlined"
              size="small"
              InputProps={{ inputProps: { min: 1, max: 10 } }}
              value={selectedSection.borderWidth || 2}
              onChange={(e) => changeBorderWidth(Number(e.target.value))}
              sx={{ marginTop: 2, width: "100px" }}
            />
          </div>
        </ToolboxSection>
      )}

      {workbenchProps.selectedId === workbenchProps.sectionId && selectedSection && (
        <ToolboxSection title="Border Color">
          <div className="color-palette">
            <h4>Border Color</h4>
            <div className="color-buttons">
              {workbenchProps.colors.primary.map((color, index) => (
                <ColorButton
                  key={`border-primary-${index}`}
                  color={color}
                  onClick={() => changeBorderColor(color)}
                  title={`Primary ${index + 1}`}
                />
              ))}
              {workbenchProps.colors.accent.map((color, index) => (
                <ColorButton
                  key={`border-accent-${index}`}
                  color={color}
                  onClick={() => changeBorderColor(color)}
                  title={`Accent ${index + 1}`}
                />
              ))}
              {workbenchProps.colors.grays.map((color, index) => (
                <ColorButton
                  key={`border-gray-${index}`}
                  color={color}
                  onClick={() => changeBorderColor(color)}
                  title={`Gray ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </ToolboxSection>
      )}

      {/* Keyboard Shortcuts */}
      <ToolboxSection title="Keyboard Shortcuts">
        <ul className="shortcuts-list">
          <li>
            <span className="shortcut-key">Delete</span> Remove selected item
          </li>
          <li>
            <span className="shortcut-key">Click + Drag</span> Move items
          </li>
          <li>
            <span className="shortcut-key">Click</span> Select item
          </li>
        </ul>
      </ToolboxSection>

      {workbenchProps.layoutType === "Page" && (
        <ToolboxSection title="Section Replacement">
          <div className="replacement-button-container">
            <Button
              onClick={workbenchProps.openReplacementPanel}
              className="replacement-button"
            >
              Replace Section
            </Button>
          </div>
        </ToolboxSection>
      )}

      {/* Layout Selection */}
      {workbenchProps.showLayoutList && (
        <ToolboxSection title="Select Layout to Edit">
          {workbenchProps.availableLayouts.length > 0 ? (
            <ul>
              {workbenchProps.availableLayouts.map((layout) => (
                <li key={layout._id}>
                  <strong>{layout.title}</strong>
                  <Button onClick={() => workbenchProps.loadLayoutFromSelected(layout)}>
                    Edit
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No saved layouts found.</p>
          )}
          <Button onClick={() => workbenchProps.setShowLayoutList(false)}>Close</Button>
        </ToolboxSection>
      )}
    </div>
  );
};

export default Toolbox;