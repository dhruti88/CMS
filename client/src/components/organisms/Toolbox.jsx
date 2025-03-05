import React from 'react';
import Button from '../atoms/Button';
import ColorButton from '../atoms/ColorButton';
import ToolboxSection from '../molecules/ToolboxSection';
import TextFormattingTools from '../molecules/TextFormattingTools';
import Input from '../atoms/Input';

const Toolbox = ({
  itemSizes,
  addBox,
  addTextBox,
  addImageItem,
  handleImageUpload,
  selectedId,
  items,
  changeItemColor,
  deleteSelected,
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
  cellHeight
}) => {
  const selectedItem = items.find(i => i.id === selectedId);
  return (
    <div className="toolbox">
      <h2 className="toolbox-header">Tool Box</h2>
      <ToolboxSection title="Add Elements">
        <div className="size-section">
          <h4>Text Boxes</h4>
          <div className="size-grid">
            {itemSizes.map(size => (
              <Button
                key={`text-${size.label}`}
                onClick={() => addTextBox(size)}
                className="size-button"
              >
                {size.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="size-section">
          <h4>Boxes</h4>
          <div className="size-grid">
            {itemSizes.map(size => (
              <Button
                key={`box-${size.label}`}
                onClick={() => addBox(size)}
                className="size-button"
              >
                {size.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="size-section">
          <h4>Images</h4>
          <div className="size-grid">
            {itemSizes.map(size => (
              <Button
                key={`image-${size.label}`}
                onClick={() => addImageItem(size)}
                className="size-button"
              >
                {size.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="size-section">
          <h4>Upload Image</h4>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>
      </ToolboxSection>
      {selectedId && selectedItem?.type === 'text' && (
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
      <ToolboxSection title="Item Properties">
        {selectedId ? (
          <>
            <div className="property-group">
              <label>Item ID:</label>
              <span>{selectedId}</span>
            </div>
            <div className="property-group">
              <label>Type:</label>
              <span>{selectedItem?.type || 'Unknown'}</span>
            </div>
            <div className="property-group">
              <label>Position:</label>
              <span>
                  {`Col: ${Math.round(items.find(i => i.id === selectedId)?.x / (cellWidth + gutterWidth)) || 0}, 
                     Row: ${Math.round(items.find(i => i.id === selectedId)?.y / cellHeight) || 0}`}
                </span>
            </div>
            <div className="property-group">
              <label>Size:</label>
              <span>{`${selectedItem?.sizeInfo?.cols || 1} × ${selectedItem?.sizeInfo?.rows || 1}`}</span>
            </div>
            {selectedId && selectedItem?.type === 'text' && (<div className="color-palette">
              <h4>Color</h4>
              <div className="color-buttons">
                {colors.primary.map((color, index) => (
                  <ColorButton
                    key={`primary-${index}`}
                    color={color}
                    onClick={changeItemColor}
                    title={`Primary ${index + 1}`}
                  />
                ))}
                {colors.accent.map((color, index) => (
                  <ColorButton
                    key={`accent-${index}`}
                    color={color}
                    onClick={changeItemColor}
                    title={`Accent ${index + 1}`}
                  />
                ))}
                {colors.grays.map((color, index) => (
                  <ColorButton
                    key={`gray-${index}`}
                    color={color}
                    onClick={changeItemColor}
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
      {/* <ToolboxSection title="Grid Settings">
        <div className="property-group">
          <label>Gutter Width (px):</label>
          <Input
            type="number"
            value={gutterWidth}
            onChange={(e) => setGutterWidth(parseInt(e.target.value) || 0)}
          />
        </div>
      </ToolboxSection> */}
      <ToolboxSection title="Keyboard Shortcuts">
        <ul className="shortcuts-list">
          <li><span className="shortcut-key">Delete</span> Remove selected item</li>
          <li><span className="shortcut-key">Click + Drag</span> Move items</li>
          <li><span className="shortcut-key">Click</span> Select item</li>
        </ul>
      </ToolboxSection>
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
