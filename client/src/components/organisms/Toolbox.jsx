import React, { useState } from 'react';
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
  cellHeight,
  addPredefineditem,
  addNewSection,
  sectionId,
  addItemToSection,
  sections,
  columns,            // current layout columns (parent layout)
  rows,               // current layout rows (parent layout)
  addEmbeddedLayout,  // function to embed a layout into a section
  embeddedLayouts,    // already embedded layouts
  searchLayoutAndDisplay  // function to fetch & display entire layout overlay
}) => {
  // Local state to hold the selected layout id from the dropdown.
  const [selectedEmbedLayout, setSelectedEmbedLayout] = useState('');

  // Helper to find an item in a section by its id.
  const findItem = (sectionId, itemId) => {
    const section = sections.find(sec => sec.id === sectionId);
    if (!section) return null;
    return section.items.find(item => item.id === itemId) || null;
  };

  const selectedItem = findItem(sectionId, selectedId);

  // Render the embed layout selection dropdown based on the selected section's dimensions.
  const renderEmbedLayoutSelection = () => {
    const selectedSection = sections.find(sec => sec.id === sectionId);
    if (!selectedSection) {
      return <p>Please select a section.</p>;
    }
    // Use the section's sizeInfo to determine available space.
    const sectionCols = selectedSection.sizeInfo?.cols || 0;
    const sectionRows = selectedSection.sizeInfo?.rows || 0;
    // Filter available layouts to those that completely fit into the selected section.
    const fittingLayouts = availableLayouts.filter(layout => 
      layout.gridSettings.columns <= sectionCols &&
      layout.gridSettings.rows <= sectionRows
    );
    if (fittingLayouts.length === 0) {
      return <p>No available layouts fit in the selected section.</p>;
    }
    return (
      <div className="layout-selection">
        <select
          value={selectedEmbedLayout}
          onChange={(e) => setSelectedEmbedLayout(e.target.value)}
        >
          <option value="">-- Select a layout --</option>
          {fittingLayouts.map(layout => (
            <option key={layout._id} value={layout._id}>
              {layout.title} ({layout.gridSettings.columns}×{layout.gridSettings.rows})
            </option>
          ))}
        </select>
        <Button
          onClick={() => {
            const layout = fittingLayouts.find(l => l._id === selectedEmbedLayout);
            if (layout) {
              console.log('[Toolbox] Embedding layout via selection:', layout);
              addEmbeddedLayout(layout);
              setSelectedEmbedLayout('');
            } else {
              alert('Please select a valid layout.');
            }
          }}
        >
          Embed Layout
        </Button>
      </div>
    );
  };

  return (
    <div className="toolbox">
      <h2 className="toolbox-header">Tool Box</h2>

      {/* Search Layout Section */}
      <ToolboxSection title="Search Layout">
        <Button
          onClick={() => {
            console.log('[Toolbox] Search Layout button clicked.');
            searchLayoutAndDisplay();
          }}
        >
          Search Layout
        </Button>
      </ToolboxSection>

      <ToolboxSection title="Add Sections">
        <div className="size-section">
          <h4>Sections</h4>
          <div className="size-grid">
            {itemSizes.map(size => (
              <Button
                key={`box-${size.label}`}
                onClick={() => {
                  console.log('[Toolbox] Adding new section:', size);
                  addNewSection(size);
                }}
                className="size-button"
              >
                {size.label}
              </Button>
            ))}
          </div>
        </div>
      </ToolboxSection>

      <ToolboxSection title="Add Elements">
        <div className="size-section">
          <h4>Text Boxes</h4>
          <div className="size-grid">
            {itemSizes.map(size => (
              <Button
                key={`text-${size.label}`}
                onClick={() => {
                  console.log('[Toolbox] Adding text box of size:', size);
                  addItemToSection(sectionId, size, "text");
                }}
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
                onClick={() => {
                  console.log('[Toolbox] Adding image of size:', size);
                  addItemToSection(sectionId, size, "image");
                }}
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
                {`Col: ${Math.round(sections.find(i => i.id === selectedId)?.x / (cellWidth + gutterWidth)) || 0}, 
                Row: ${Math.round(sections.find(i => i.id === selectedId)?.y / cellHeight) || 0}`}
              </span>
            </div>
            <div className="property-group">
              <label>Size:</label>
              <span>{`${selectedItem?.sizeInfo?.cols || 1} × ${selectedItem?.sizeInfo?.rows || 1}`}</span>
            </div>
            {selectedId && selectedItem?.type === 'text' && (
              <div className="color-palette">
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

      <ToolboxSection title="Keyboard Shortcuts">
        <ul className="shortcuts-list">
          <li><span className="shortcut-key">Delete</span> Remove selected item</li>
          <li><span className="shortcut-key">Click + Drag</span> Move items</li>
          <li><span className="shortcut-key">Click</span> Select item</li>
        </ul>
      </ToolboxSection>

      <ToolboxSection title="Embed Layout">
        {!sectionId ? (
          <p>Please select a section to embed a layout.</p>
        ) : (
          <div className="layout-section">
            {renderEmbedLayoutSelection()}
          </div>
        )}
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