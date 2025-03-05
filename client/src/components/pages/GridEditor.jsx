import React, { useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Line } from 'react-konva';

// ------------------- Helper Functions -------------------

// Check if two grid rectangles overlap
const rectanglesOverlap = (boxA, boxB) => {
  //console.log("boxA -",boxA," BoxB - ",boxB);
  return (
    boxA.gridX < boxB.gridX + boxB.width &&
    boxA.gridX + boxA.width > boxB.gridX &&
    boxA.gridY < boxB.gridY + boxB.height &&
    boxA.gridY + boxA.height > boxB.gridY
  );
};

// Find the best position for a displaced box
const findBestPositionForBox = (box, fixedBoxes, columns, rows, originalPosition) => {
  if (originalPosition) {
    let conflict = false;
    for (let other of fixedBoxes) {
      if (
        rectanglesOverlap(
          { ...box, gridX: originalPosition.gridX, gridY: originalPosition.gridY },
          other
        )
      ) {
        conflict = true;
        break;
      }
    }
    if (!conflict) return originalPosition;
  }
  const possiblePositions = [];
  for (let y = 0; y <= rows - box.height; y++) {
    for (let x = 0; x <= columns - box.width; x++) {
      let conflict = false;
      for (let other of fixedBoxes) {
        if (rectanglesOverlap({ ...box, gridX: x, gridY: y }, other)) {
          conflict = true;
          break;
        }
      }
      if (!conflict) {
        let distance = originalPosition
          ? Math.sqrt(
              Math.pow(x - originalPosition.gridX, 2) +
              Math.pow(y - originalPosition.gridY, 2)
            )
          : x + y;
        possiblePositions.push({ gridX: x, gridY: y, distance });
      }
    }
  }
  possiblePositions.sort((a, b) => a.distance - b.distance);
  return possiblePositions.length > 0 ? possiblePositions[0] : null;
};

// Cascade reposition all boxes that would be displaced
const repositionBoxes = (movingBox, targetPosition, allBoxes, columns, rows) => {
  const result = { success: false, newPositions: {} };
  const fixedBoxes = [];
  const boxesToProcess = [...allBoxes];

  const movingBoxWithNewPos = { ...movingBox, gridX: targetPosition.gridX, gridY: targetPosition.gridY };
  fixedBoxes.push(movingBoxWithNewPos);
  result.newPositions[movingBox.id] = { gridX: targetPosition.gridX, gridY: targetPosition.gridY };

  const index = boxesToProcess.findIndex(b => b.id === movingBox.id);
  if (index !== -1) boxesToProcess.splice(index, 1);

  let overlappingBoxes = boxesToProcess.filter(box => rectanglesOverlap(movingBoxWithNewPos, box));

  const processBox = (box, remainingBoxes, processedBoxes = new Set()) => {
    if (processedBoxes.has(box.id)) return true;
    processedBoxes.add(box.id);
    const originalPos = { gridX: box.gridX, gridY: box.gridY };
    const newPos = findBestPositionForBox(box, fixedBoxes, columns, rows, originalPos);
    if (!newPos) return false;
    const boxWithNewPos = { ...box, gridX: newPos.gridX, gridY: newPos.gridY };
    fixedBoxes.push(boxWithNewPos);
    result.newPositions[box.id] = { gridX: newPos.gridX, gridY: newPos.gridY };

    const newOverlappingBoxes = remainingBoxes.filter(b => b.id !== box.id && rectanglesOverlap(boxWithNewPos, b));
    for (const overlappingBox of newOverlappingBoxes) {
      const success = processBox(overlappingBox, remainingBoxes.filter(b => b.id !== overlappingBox.id), processedBoxes);
      if (!success) return false;
    }
    return true;
  };

  let remainingToProcess = [...boxesToProcess];
  for (const overlappingBox of overlappingBoxes) {
    const success = processBox(overlappingBox, remainingToProcess.filter(b => b.id !== overlappingBox.id));
    if (!success) return result;
    remainingToProcess = remainingToProcess.filter(b => b.id !== overlappingBox.id);
  }
  result.success = true;
  return result;
};

// ------------------- Merged GridEditor Component -------------------

const GridEditor = () => {
  // ------------------- Setup Modal -------------------
  const [showSetupForm, setShowSetupForm] = useState(true);
  const [rows, setRows] = useState(6);
  const [columns, setColumns] = useState(6);
  const [gutterWidth, setGutterWidth] = useState(10);

  // ------------------- Stage Dimensions & Cell Calculations -------------------
  const [stageSize, setStageSize] = useState({ width: 600, height: 600 });
  // Cell width as in app.jsx:
  const cellWidth = (stageSize.width - ((columns - 1) * gutterWidth)) / columns;
  const cellHeight = stageSize.height / rows;

  // ------------------- Box/Element State -------------------
  // For custom box creation inputs (for text boxes, etc.)
  const [newBoxWidth, setNewBoxWidth] = useState(1);
  const [newBoxHeight, setNewBoxHeight] = useState(1);
  const [newBoxType, setNewBoxType] = useState('text'); // 'text' or 'box' or 'image'
  const [newBoxContent, setNewBoxContent] = useState('');
  const [boxes, setBoxes] = useState([
    { id: 'box1', gridX: 0, gridY: 0, width: 2, height: 2, type: 'text', text: 'Drag me!' },
    { id: 'box2', gridX: 2, gridY: 0, width: 2, height: 2, type: 'text', text: 'Box 2' },
    { id: 'box3', gridX: 2, gridY: 2, width: 2, height: 2, type: 'image', text: 'Image' }
  ]);

  // ------------------- Drag/Selection State -------------------
  const [draggingBox, setDraggingBox] = useState(null);
  const [dragPreviewPosition, setDragPreviewPosition] = useState(null);
  const [dragStatus, setDragStatus] = useState(null);
  const [snapLines, setSnapLines] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // ------------------- Layout Saving/Loading -------------------
  const [layoutTitle, setLayoutTitle] = useState("Default Layout");
  const [availableLayouts, setAvailableLayouts] = useState([]);
  const [showLayoutList, setShowLayoutList] = useState(false);
  const userId = "60d21b4667d0d8992e610c85";

  // ------------------- Save/Load Functions -------------------
  const saveLayout = async () => {
    try {
      const gridSettings = { rows, columns, gutterWidth };
      const response = await fetch('http://localhost:5000/api/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title: layoutTitle, items: boxes, gridSettings })
      });
      const data = await response.json();
      console.log('Layout saved successfully', data);
      alert("Layout saved successfully");
    } catch (error) {
      console.error('Error saving layout:', error);
      alert("Error saving layout");
    }
  };

  const fetchAvailableLayouts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/layouts?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableLayouts(data.layouts);
        setShowLayoutList(true);
      } else {
        console.log("No layouts found.");
        alert("No layouts found");
      }
    } catch (error) {
      console.error("Error fetching layouts:", error);
      alert("Error fetching layouts");
    }
  };

  const loadLayoutFromSelected = (layout) => {
    if (layout.gridSettings) {
      setRows(layout.gridSettings.rows);
      setColumns(layout.gridSettings.columns);
      setGutterWidth(layout.gridSettings.gutterWidth);
    }
    setBoxes(layout.items);
    setLayoutTitle(layout.title);
    setShowLayoutList(false);
    alert("Layout loaded successfully");
  };

  // ------------------- Drag/Drop Functions -------------------
  const snapToGrid = (pixelPosition) => {
    const totalCell = cellWidth + gutterWidth;
    const gridX = Math.round(pixelPosition.x / totalCell);
    const gridY = Math.round(pixelPosition.y / cellHeight);
    return { gridX: Math.max(0, gridX), gridY: Math.max(0, gridY) };
  };

  const generateSnapLines = (currentBox, gridPos) => {
    if (!currentBox) return [];
    const lines = [];
    const leftX = gridPos.gridX * (cellWidth + gutterWidth);
    const rightX = leftX + currentBox.width * cellWidth + (currentBox.width - 1) * gutterWidth;
    lines.push({
      points: [leftX, 0, leftX, stageSize.height],
      stroke: '#2196F3',
      strokeWidth: 1,
      dash: [5, 5]
    });
    lines.push({
      points: [rightX, 0, rightX, stageSize.height],
      stroke: '#2196F3',
      strokeWidth: 1,
      dash: [5, 5]
    });
    const topY = gridPos.gridY * cellHeight;
    const bottomY = topY + currentBox.height * cellHeight;
    lines.push({
      points: [0, topY, stageSize.width, topY],
      stroke: '#2196F3',
      strokeWidth: 1,
      dash: [5, 5]
    });
    lines.push({
      points: [0, bottomY, stageSize.width, bottomY],
      stroke: '#2196F3',
      strokeWidth: 1,
      dash: [5, 5]
    });
    return lines;
  };

  const handleDragStart = (e, id) => {
    setDraggingBox(id);
    setDragStatus(null);
    const currentBox = boxes.find(b => b.id === id);
    if (!currentBox) return;
    setSnapLines(generateSnapLines(currentBox, { gridX: currentBox.gridX, gridY: currentBox.gridY }));
  };

  const handleDragMove = (e, id) => {
    if (!draggingBox) return;
    const shape = e.target;
    const pixelPosition = { x: shape.x(), y: shape.y() };
    const gridPosition = snapToGrid(pixelPosition);
    const currentBox = boxes.find(b => b.id === id);
    if (!currentBox) return;
    const clampedGridX = Math.min(Math.max(0, gridPosition.gridX), columns - currentBox.width);
    const clampedGridY = Math.min(Math.max(0, gridPosition.gridY), rows - currentBox.height);
    setSnapLines(generateSnapLines(currentBox, { gridX: clampedGridX, gridY: clampedGridY }));
    if (
      dragPreviewPosition &&
      dragPreviewPosition.gridX === clampedGridX &&
      dragPreviewPosition.gridY === clampedGridY
    ) {
      return;
    }
    shape.position({
      x: clampedGridX * (cellWidth + gutterWidth),
      y: clampedGridY * cellHeight
    });
    setDragPreviewPosition({ gridX: clampedGridX, gridY: clampedGridY });
    const currentPosition = { gridX: currentBox.gridX, gridY: currentBox.gridY };
    if (clampedGridX === currentPosition.gridX && clampedGridY === currentPosition.gridY) {
      setDragStatus({ valid: true, message: 'Current position' });
      return;
    }
    const repositionResult = repositionBoxes(
      currentBox,
      { gridX: clampedGridX, gridY: clampedGridY },
      boxes,
      columns,
      rows
    );
    if (repositionResult.success) {
      setDragStatus({ valid: true, message: 'Valid position' });
    } else {
      setDragStatus({ valid: false, message: 'Invalid position - no space available' });
    }
  };

  const handleDragEnd = (e, id) => {
    setSnapLines([]);
    const currentBox = boxes.find(b => b.id === id);
    if (!currentBox) return;
    if (!dragPreviewPosition) {
      setDraggingBox(null);
      setDragPreviewPosition(null);
      setDragStatus(null);
      return;
    }
    const newGridX = dragPreviewPosition.gridX;
    const newGridY = dragPreviewPosition.gridY;
    if (newGridX === currentBox.gridX && newGridY === currentBox.gridY) {
      setDraggingBox(null);
      setDragPreviewPosition(null);
      setDragStatus(null);
      return;
    }
    const repositionResult = repositionBoxes(
      currentBox,
      { gridX: newGridX, gridY: newGridY },
      boxes,
      columns,
      rows
    );
    if (repositionResult.success) {
      setBoxes(prevBoxes =>
        prevBoxes.map(box => {
          if (repositionResult.newPositions[box.id]) {
            return {
              ...box,
              gridX: repositionResult.newPositions[box.id].gridX,
              gridY: repositionResult.newPositions[box.id].gridY
            };
          }
          return box;
        })
      );
    } else {
      const stageNode = e.target.getStage();
      const layer = stageNode.findOne('Layer');
      const group = layer.findOne(`#${id}`);
      if (group) {
        group.to({
          x: currentBox.gridX * (cellWidth + gutterWidth),
          y: currentBox.gridY * cellHeight,
          duration: 0.3
        });
      }
    }
    setDraggingBox(null);
    setDragPreviewPosition(null);
    setDragStatus(null);
  };

  // ------------------- Box Management -------------------
  // Predefined size options (as in your original grid editor code)
  const sizeOptions = [
    { cols: 1, rows: 1, label: '1×1' },
    { cols: 2, rows: 1, label: '2×1' },
    { cols: 2, rows: 2, label: '2×2' },
    { cols: 4, rows: 2, label: '4×2' },
    { cols: 4, rows: 4, label: '4×4' },
    { cols: 8, rows: 4, label: '8×4' },
  ];

  // addBox function for predefined sizes
  const addPredefinedBox = (size) => {
    if (!newBoxContent && newBoxType === 'text') {
      alert('Please enter text content for the new box');
      return;
    }
    const newBox = {
      id: `box${boxes.length + 1}`,
      width: size.cols,
      height: size.rows,
      type: newBoxType,
      text: newBoxType === 'text' ? newBoxContent : 'Image'
    };
    const position = findBestPositionForBox(newBox, boxes, columns, rows);
    if (!position) {
      alert('No space available for new box');
      return;
    }
    newBox.gridX = position.gridX;
    newBox.gridY = position.gridY;
    setBoxes([...boxes, newBox]);
    setNewBoxContent('');
  };

  // addCustomBox uses custom inputs for width/height
  const addCustomBox = () => {
    if (!newBoxContent && newBoxType === 'text') {
      alert('Please enter text content for the new box');
      return;
    }
    const newBox = {
      id: `box${boxes.length + 1}`,
      width: newBoxWidth,
      height: newBoxHeight,
      type: newBoxType,
      text: newBoxType === 'text' ? newBoxContent : 'Image'
    };
    const position = findBestPositionForBox(newBox, boxes, columns, rows);
    if (!position) {
      alert('No space available for new box');
      return;
    }
    newBox.gridX = position.gridX;
    newBox.gridY = position.gridY;
    setBoxes([...boxes, newBox]);
    setNewBoxContent('');
  };

  const removeBox = (id) => {
    setBoxes(boxes.filter(box => box.id !== id));
  };

  const getBoxColor = (type) => {
    switch (type) {
      case 'text': return '#9DC0F0';
      case 'image': return '#9DF0A3';
      default: return '#E0E0E0';
    }
  };

  // ------------------- Render Grid Lines (as in app.jsx) -------------------
  const gridLines = [];
  for (let i = 1; i < columns; i++) {
    const x = i * cellWidth + (i - 1) * gutterWidth;
    gridLines.push(
      <Rect key={`v-${i}`} x={x} y={0} width={gutterWidth} height={stageSize.height} fill="#dadce0" />
    );
  }
  for (let j = 1; j < rows; j++) {
    gridLines.push(
      <Rect key={`h-${j}`} x={0} y={j * cellHeight} width={stageSize.width} height={1} fill="#f1f3f4" />
    );
  }

  // ------------------- Render Selected Box Properties -------------------
  const selectedBox = boxes.find(box => box.id === selectedId);

  // ------------------- Main Render -------------------
  if (showSetupForm) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h2>Configure Grid Editor</h2>
        <div>
          <label>
            Rows: 
            <input type="number" value={rows} onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 6))} style={{ marginLeft: '5px', width: '50px' }} />
          </label>
        </div>
        <div>
          <label>
            Columns: 
            <input type="number" value={columns} onChange={(e) => setColumns(Math.max(1, parseInt(e.target.value) || 6))} style={{ marginLeft: '5px', width: '50px' }} />
          </label>
        </div>
        <div>
          <label>
            Gutter Width (px): 
            <input type="number" value={gutterWidth} onChange={(e) => setGutterWidth(Math.max(0, parseInt(e.target.value) || 10))} style={{ marginLeft: '5px', width: '50px' }} />
          </label>
        </div>
        <button style={{ marginTop: '10px' }} onClick={() => setShowSetupForm(false)}>Create Grid Editor</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', fontFamily: 'Arial, sans-serif' }}>
      {/* Left: Stage */}
      <div style={{ flex: 1, padding: '20px' }}>
        <Stage width={stageSize.width} height={stageSize.height} style={{ border: '2px solid #000' }}>
          <Layer>
            {gridLines}
            {snapLines.map((line, i) => (
              <Line key={`snap-${i}`} {...line} />
            ))}
            {boxes.map(box => (
              <Group
                key={box.id}
                id={box.id}
                x={box.gridX * (cellWidth + gutterWidth)}
                y={box.gridY * cellHeight}
                draggable
                onDragStart={(e) => { handleDragStart(e, box.id); setSelectedId(box.id); }}
                onDragMove={(e) => handleDragMove(e, box.id)}
                onDragEnd={(e) => handleDragEnd(e, box.id)}
                onClick={() => setSelectedId(box.id)}
              >
                <Rect
                  width={box.width * cellWidth + (box.width - 1) * gutterWidth}
                  height={box.height * cellHeight}
                  fill={getBoxColor(box.type)}
                  stroke={draggingBox === box.id ? '#3F51B5' : '#333'}
                  strokeWidth={draggingBox === box.id ? 2 : 1}
                  cornerRadius={4}
                />
                {draggingBox === box.id && (
                  <Text text={`(${box.gridX},${box.gridY})`} fontSize={10} fill="#fff" x={5} y={5} />
                )}
                <Text
                  text={box.text}
                  fontSize={Math.min(cellWidth * box.width / 3, 18)}
                  width={box.width * cellWidth + (box.width - 1) * gutterWidth}
                  height={box.height * cellHeight}
                  align="center"
                  verticalAlign="middle"
                />
                <Group
                  x={box.width * cellWidth + (box.width - 1) * gutterWidth - 20}
                  y={0}
                  onMouseDown={(e) => {
                    e.cancelBubble = true;
                    removeBox(box.id);
                  }}
                >
                  <Rect width={20} height={20} fill="rgba(244, 67, 54, 0.7)" cornerRadius={[0, 0, 0, 4]} />
                  <Text text="×" fontSize={16} fill="#fff" width={20} height={20} align="center" verticalAlign="middle" />
                </Group>
              </Group>
            ))}
          </Layer>
        </Stage>
        <div style={{ marginTop: '20px' }}>
          <h3>Instructions:</h3>
          <ul>
            <li>Drag boxes to reposition them. They snap exactly to the grid.</li>
            <li>Boxes automatically adjust to avoid overlaps.</li>
          </ul>
        </div>
      </div>
      {/* Right: Toolbox */}
      <div style={{ width: '320px', padding: '20px', borderLeft: '2px solid #000' }}>
        <h2>Toolbox</h2>
        <div style={{ marginBottom: '20px' }}>
          <h3>Add Predefined Elements</h3>
          <div>
            <h4>Text Boxes</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {sizeOptions.map((size) => (
                <button key={`text-${size.label}`} onClick={() => addPredefinedBox(size)}>
                  {size.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4>Boxes</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {sizeOptions.map((size) => (
                <button key={`box-${size.label}`} onClick={() => addPredefinedBox(size)}>
                  {size.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4>Images</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {sizeOptions.map((size) => (
                <button key={`image-${size.label}`} onClick={() => addPredefinedBox(size)}>
                  {size.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ marginBottom: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
          <h3>Add Custom Element</h3>
          <div>
            <label>
              Type:
              <select value={newBoxType} onChange={(e) => setNewBoxType(e.target.value)} style={{ marginLeft: '5px' }}>
                <option value="text">Text</option>
                <option value="box">Box</option>
                <option value="image">Image</option>
              </select>
            </label>
          </div>
          {newBoxType === 'text' && (
            <div>
              <label>
                Content:
                <input type="text" value={newBoxContent} onChange={(e) => setNewBoxContent(e.target.value)} placeholder="Enter text" style={{ marginLeft: '5px', width: '150px' }} />
              </label>
            </div>
          )}
          <div>
            <label>
              Width (cols):
              <input type="number" value={newBoxWidth} onChange={(e) => setNewBoxWidth(Math.max(1, parseInt(e.target.value) || 1))} style={{ marginLeft: '5px', width: '50px' }} />
            </label>
          </div>
          <div>
            <label>
              Height (rows):
              <input type="number" value={newBoxHeight} onChange={(e) => setNewBoxHeight(Math.max(1, parseInt(e.target.value) || 1))} style={{ marginLeft: '5px', width: '50px' }} />
            </label>
          </div>
          <button onClick={addCustomBox} style={{ marginTop: '5px' }}>Add Custom Box</button>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <h3>Upload Image</h3>
          <input type="file" accept="image/*" onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64data = reader.result;
                const defaultSize = { cols: 2, rows: 2, label: '2×2' };
                const imageItem = {
                  id: 'image-' + Date.now(),
                  type: 'image',
                  gridX: 0,
                  gridY: 0,
                  width: defaultSize.cols,
                  height: defaultSize.rows,
                  text: 'Image',
                  src: base64data
                };
                setBoxes([...boxes, imageItem]);
              };
              reader.readAsDataURL(file);
            }
          }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <h3>Grid Settings</h3>
          <div>
            <label>
              Gutter Width (px):
              <input
                type="number"
                value={gutterWidth}
                onChange={(e) => setGutterWidth(parseInt(e.target.value) || 0)}
                style={{ marginLeft: '5px', width: '60px' }}
              />
            </label>
          </div>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <h3>Layout</h3>
          <div>
            <label>
              Layout Title:
              <input
                type="text"
                value={layoutTitle}
                onChange={(e) => setLayoutTitle(e.target.value)}
                style={{ marginLeft: '5px', width: '150px' }}
              />
            </label>
          </div>
          <button onClick={saveLayout} style={{ marginTop: '5px' }}>Save Layout</button>
          <button onClick={fetchAvailableLayouts} style={{ marginTop: '5px', marginLeft: '5px' }}>Search Layout</button>
          {showLayoutList && (
            <div style={{ marginTop: '10px', border: '1px solid #ccc', padding: '5px' }}>
              <h4>Select a Layout:</h4>
              {availableLayouts.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {availableLayouts.map(layout => (
                    <li key={layout._id} style={{ marginBottom: '5px' }}>
                      <strong>{layout.title}</strong>
                      <button onClick={() => loadLayoutFromSelected(layout)} style={{ marginLeft: '5px' }}>Edit</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No saved layouts found.</p>
              )}
              <button onClick={() => setShowLayoutList(false)}>Close</button>
            </div>
          )}
        </div>
        {selectedBox && (
          <div style={{ marginBottom: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
            <h3>Item Properties</h3>
            <div><strong>ID:</strong> {selectedBox.id}</div>
            <div><strong>Type:</strong> {selectedBox.type}</div>
            <div><strong>Position:</strong> Col {selectedBox.gridX}, Row {selectedBox.gridY}</div>
            <div><strong>Size:</strong> {selectedBox.width}×{selectedBox.height}</div>
          </div>
        )}
        <div>
          <h3>Keyboard Shortcuts</h3>
          <ul>
            <li><span>Delete</span> Remove selected item</li>
            <li><span>Click + Drag</span> Move items</li>
            <li><span>Click</span> Select item</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GridEditor;
