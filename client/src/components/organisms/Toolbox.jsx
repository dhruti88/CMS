// toolbox.jsx:
import React ,{useState, useEffect} from 'react';
import Button from '../atoms/Button';
import ColorButton from '../atoms/ColorButton';
import ToolboxSection from '../molecules/ToolboxSection';
import TextFormattingTools from '../molecules/TextFormattingTools';
import ManualRowColumn from '../molecules/ManualRowColumn';
import SectionReplacementPanel from './SectionReplacementPanel';
import Input from '../atoms/Input';
import { TextField, MenuItem, Select, FormControl,Grid, InputLabel } from "@mui/material";

const Toolbox = ({
  itemSizes,
  addNewSection,
  addItemToSection,
  handleImageUpload,
  selectedId,
  sectionId,
  sections,
  textFormatting,
  toggleFormat,
  changeFontSize,
  handleTextChange,
  textValue,
  setTextFormatting,
  colors,
  gutterWidth,
  setGutterWidth,
  availableLayouts,
  loadLayoutFromSelected,
  showLayoutList,
  setShowLayoutList,
  cellWidth,
  cellHeight,
  deleteSelected,
  changeItemColor,
  openReplacementPanel,
  taskStatus,
  setTaskStatus,
  changeFontFamily,
  layoutType,
  rows,
  columns,
}) => {
  
  // Find selected section
  const selectedSection = sections.find(section => section.id === selectedId);
  useEffect(() => {
    if (layoutType !== "Page") {
      addNewSection({ 
        cols: columns, 
        rows: rows, 
        label: `${columns}×${rows}`
      });
    }
  }, [layoutType]);

  // Find selected item inside a section
  const selectedItem = sections
    .flatMap(section => section.items)
    .find(item => item.id === selectedId);

  return (
    <div className="toolbox">
      <h2 className="toolbox-header">Tool Box</h2>

      <ToolboxSection>
      {/* Task Status & Layout Type */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ background: "#f8f9fa", px: 0.5 }} >Task Status</InputLabel>
              <Select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)}>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          </ToolboxSection>

      {/* Add Sections */}
      {layoutType === "Page" && (
      <ToolboxSection title="Add Sections">
        <div className="size-section">
          <h4>Sections</h4>
          <div className="size-grid">
            {itemSizes.map((size) => (
              <Button
                key={`box-${size.label}`}
                onClick={() => addNewSection(size)}
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
          handleClick={addNewSection}
        />
      </ToolboxSection>
    )}



      {/* Add Elements */}
      <ToolboxSection title="Add Elements">
        <div className="size-section">
          <h4>Text Boxes</h4>
          <div className="size-grid">
            {itemSizes.map(size => (
              <Button key={`text-${size.label}`} onClick={() => addItemToSection(sectionId, size, "text")} className="size-button">
                {size.label}
              </Button>
            ))}
          </div>
          <ManualRowColumn title = "Manual Text Box" buttonText='Add' sectionId={sectionId} type='text' handleClick={addItemToSection}/>
        </div>

        <div className="size-section">
          <h4>Images</h4>
          <div className="size-grid">
            {itemSizes.map(size => (
              <Button key={`image-${size.label}`} onClick={() => addItemToSection(sectionId, size, "dimage")} className="size-button">
                {size.label}
              </Button>
            ))}
          </div>
          <ManualRowColumn title = "Manual Image" buttonText='Add' sectionId={sectionId} type='dimage' handleClick={addItemToSection}/>
        </div>

        <div className="size-section">
          <h4>Upload Image</h4>
          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(sectionId, e)}/>
        </div>
      </ToolboxSection>

      {/* Text Formatting Tools (only for text items) */}
      {selectedItem?.type === 'text' && (
        <ToolboxSection title="Text Formatting">
          <TextFormattingTools
            textFormatting={textFormatting}
            toggleFormat={toggleFormat}
            changeFontSize={changeFontSize}
            handleTextChange={handleTextChange}
            textValue={textValue}
            setTextFormatting={setTextFormatting}
            changeFontFamily = {changeFontFamily}
          />
        </ToolboxSection>
      )}

      {/* Item Properties (for sections & items) */}
      <ToolboxSection title="Item Properties">
        {selectedId ? (
          <>
            <div className="property-group">
              <label>ID:</label>
              <span>{selectedId}</span>
            </div>

            <div className="property-group">
              <label>Type:</label>
              <span>{selectedItem?.type || (selectedSection ? 'Section' : 'Unknown')}</span>
            </div>

            <div className="property-group">
              <label>Position:</label>
              <span>
                {selectedSection
                  ? `Col: ${selectedSection.gridX}, Row: ${selectedSection.gridY}`
                  : `Col: ${Math.round(selectedItem?.x / (cellWidth + gutterWidth)) || 0}, 
                     Row: ${Math.round(selectedItem?.y / cellHeight) || 0}`}
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
                  {colors.primary.map((color, index) => (
                    <ColorButton
                      key={`primary-${index}`}
                      color={color}
                      onClick={() => changeItemColor(color)}
                      title={`Primary ${index + 1}`}
                    />
                  ))}
                  {colors.accent.map((color, index) => (
                    <ColorButton
                      key={`accent-${index}`}
                      color={color}
                      onClick={() => changeItemColor(color)}
                      title={`Accent ${index + 1}`}
                    />
                  ))}
                  {colors.grays.map((color, index) => (
                    <ColorButton
                      key={`gray-${index}`}
                      color={color}
                      onClick={() => changeItemColor(color)}
                      title={`Gray ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}

{(layoutType === "Page" || selectedId !== sectionId )&& (
  <Button className="delete-button" onClick={deleteSelected} title="Delete selected item">
    Delete Item
  </Button>
)}

          </>
        ) : (
          <p className="no-selection">No item selected. Click on an item to view its properties.</p>
        )}
      </ToolboxSection>

      {/* Keyboard Shortcuts */}
      <ToolboxSection title="Keyboard Shortcuts">
        <ul className="shortcuts-list">
          <li><span className="shortcut-key">Delete</span> Remove selected item</li>
          <li><span className="shortcut-key">Click + Drag</span> Move items</li>
          <li><span className="shortcut-key">Click</span> Select item</li>
        </ul>
      </ToolboxSection>
      
<ToolboxSection title="Section Replacement">
  <div className="replacement-button-container">
    <Button onClick={openReplacementPanel} className="replacement-button">
      Replace Section
    </Button>
  </div>
</ToolboxSection>


      {/* Layout Selection */}
      {showLayoutList && (
        <ToolboxSection title="Select Layout to Edit">
          {availableLayouts.length > 0 ? (
            <ul>
              {availableLayouts.map(layout => (
                <li key={layout._id}>
                  <strong>{layout.title}</strong>
                  <Button onClick={() => loadLayoutFromSelected(layout)}>Edit</Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No saved layouts found.</p>
          )}
          <Button onClick={() => setShowLayoutList(false)}>Close</Button>
        </ToolboxSection>
      )}
    </div>
  );
};

export default Toolbox;