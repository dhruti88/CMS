import React from 'react';
import Button from '../atoms/Button';
import ColorButton from '../atoms/ColorButton';
import ToolboxSection from '../molecules/ToolboxSection';
import TextFormattingTools from '../molecules/TextFormattingTools';
import Input from '../atoms/Input';

const Toolbox = ({
  itemSizes,
  addNewSection,
  addItemToSection,
  handleImageUpload,
  selectedId,
  sectionId,
  sections = [], // default to empty array
  textFormatting,
  toggleFormat,
  changeFontSize,
  handleTextChange,
  textValue,
  setTextFormatting,
  colors,
  gutterWidth,
  setGutterWidth,
  availableLayouts = [], // default to empty array
  loadLayoutFromSelected,
  showLayoutList,
  setShowLayoutList,
  cellWidth,
  cellHeight,
  deleteSelected,
  changeItemColor,
  openReplacementPanel,
}) => {
  // Find selected section safely
  const selectedSection = (sections || []).find(section => section.id === selectedId);

  // Find selected item inside a section safely
  const selectedItem = (sections || [])
    .flatMap(section => section.items || [])
    .find(item => item.id === selectedId);

  return (
    <div className="toolbox">
      <h2 className="toolbox-header">Tool Box</h2>

      {/* Add Sections */}
      <ToolboxSection title="Add Sections">
        <div className="size-section">
          <h4>Sections</h4>
          <div className="size-grid">
            {itemSizes.map(size => (
              <Button key={`box-${size.label}`} onClick={() => addNewSection(size)} className="size-button">
                {size.label}
              </Button>
            ))}
          </div>
        </div>
      </ToolboxSection>

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
        </div>

        <div className="size-section">
          <h4>Upload Image</h4>
          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(sectionId, e)} />
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
                  ? `${selectedSection.sizeInfo? selectedSection.sizeInfo.cols : 1 } × ${selectedSection.sizeInfo? selectedSection.sizeInfo.rows : 1}`
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

            <Button className="delete-button" onClick={deleteSelected} title="Delete selected item">
              Delete Item
            </Button>
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

      {/* Section Replacement */}
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
                <li key={layout._id || layout.id}>
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
