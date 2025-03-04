import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Line, Text, Transformer, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import './WorkBench.css';

// Helper component to load and display an image (from URL or base64)
const URLImage = ({ src, ...props }) => {
  const [image] = useImage(src);
  return <KonvaImage image={image} {...props} />;
};

function WorkBench() {
  // Constants
  const userId = "60d21b4667d0d8992e610c85"; // example ObjectId
  const defaultTitle = "default";

  // Canvas dimensions (account for toolbox)
  const [stageSize, setStageSize] = useState({
    width: window.innerWidth - 320,
    height: window.innerHeight,
  });

  // Grid configuration (dynamic)
  const [columns, setColumns] = useState(8);
  const [rows, setRows] = useState(12);
  const [gutterWidth, setGutterWidth] = useState(10);
  const [showSetupForm, setShowSetupForm] = useState(true);

  // Workbench items and grid settings
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [layoutTitle, setLayoutTitle] = useState(defaultTitle);
  const [availableLayouts, setAvailableLayouts] = useState([]);
  const [showLayoutList, setShowLayoutList] = useState(false);

  // Zoom state
  const [stageScale, setStageScale] = useState(1);

  // Tool mode: "pointer" (for selecting) vs. "hand" (for panning)
  const [toolMode, setToolMode] = useState("pointer");

  // Cell dimensions
  const cellWidth = (stageSize.width - ((columns - 1) * gutterWidth)) / columns;
  const cellHeight = stageSize.height / rows;

  // Text editing state
  const [textValue, setTextValue] = useState('');
  const [textFormatting, setTextFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    fontSize: 16,
    align: 'left',
    fontFamily: 'Arial'
  });

  // References
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const textareaRef = useRef(null);

  // Available sizes
  const itemSizes = [
    { cols: 1, rows: 1, label: '1×1' },
    { cols: 2, rows: 1, label: '2×1' },
    { cols: 2, rows: 2, label: '2×2' },
    { cols: 4, rows: 2, label: '4×2' },
    { cols: 4, rows: 4, label: '4×4' },
    { cols: 8, rows: 4, label: '8×4' },
  ];

  // Theme colors
  const colors = {
    primary: ['#1a73e8', '#4285f4', '#8ab4f8'],
    accent: ['#ea4335', '#fbbc04', '#34a853'],
    grays: ['#202124', '#3c4043', '#5f6368', '#dadce0', '#f1f3f4']
  };

  // Update transformer when selection changes
  useEffect(() => {
    // console.log("sel id - ",selectedId);
    // console.log("tran id - ", transformerRef);
      
    if (selectedId && transformerRef.current) {
      
      const selectedNode = transformerRef.current.getStage().findOne('#' + selectedId);
      // console.log("sel node ", selectedNode);

      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();

        const item = items.find(i => i.id === selectedId);

        if (item && item.type === 'text') {
          setTextValue(item.text);
          setTextFormatting({
            bold: item.fontStyle?.includes('bold') || false,
            italic: item.fontStyle?.includes('italic') || false,
            underline: item.textDecoration === 'underline' || false,
            fontSize: item.fontSize || 16,
            align: item.align || 'left',
            fontFamily: item.fontFamily || 'Arial'
          });
        }
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId, items]);



  // // Adjust stage size on window resize
  // useEffect(() => {
  //   const handleResize = () => {
  //     setStageSize({
  //       width: window.innerWidth - 320,
  //       height: window.innerHeight,
  //     });
    
  //   };
  //   window.addEventListener('resize', handleResize);
  //   return () => window.removeEventListener('resize', handleResize);
  // },[]);

  // Update cursor style based on tool mode
  useEffect(() => {
    console.log("s-",stageRef);
    
    const container = stageRef.current && stageRef.current.container();
    if (container) {
      container.style.cursor = toolMode === "hand" ? "grab" : "default";
    }
  }, [toolMode]);


  // Layout endpoints
  const saveLayout = async () => {
    try {
      const gridSettings = { columns, rows, gutterWidth };
      const response = await fetch('http://localhost:5000/api/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title: layoutTitle, items, gridSettings })
      });
      const data = await response.json();
      console.log('Layout saved successfully', data);
    } catch (error) {
      console.error('Error saving layout:', error);
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
      }
    } catch (error) {
      console.error("Error fetching layouts:", error);
    }
  };

  const loadLayoutFromSelected = (layout) => {
    if (layout.gridSettings  && layout.gridSettings.gutterWidth !== undefined) {
      setColumns(layout.gridSettings.columns);
      setRows(layout.gridSettings.rows);
      setGutterWidth(layout.gridSettings.gutterWidth);
    }
    setItems(layout.items);
    setLayoutTitle(layout.title);
    setShowLayoutList(false);
    setShowSetupForm(false);
    console.log("Loaded layout:", layout);
  };

  // Workbench functions
  const addBox = (size) => {
    const box = {
      id: 'box-' + Date.now(),
      type: 'box',
      x: 0,
      y: 0,
      width: size.cols * cellWidth + (size.cols - 1) * gutterWidth,
      height: size.rows * cellHeight,
      fill: colors.grays[4],
      stroke: colors.grays[2],
      strokeWidth: 1,
      draggable: true,
      sizeInfo: size,
    };
    setItems([...items, box]);
    setSelectedId(box.id);
  };

  const addTextBox = (size) => {
    const textBox = {
      id: 'text-' + Date.now(),
      type: 'text',
      x: 0,
      y: 0,
      width: size.cols * cellWidth + (size.cols - 1) * gutterWidth,
      height: size.rows * cellHeight,
      text: 'Add your text here',
      fontSize: 16,
      fontStyle: '',
      fontFamily: textFormatting.fontFamily,
      textDecoration: '',
      fill: colors.grays[0],
      align: 'left',
      padding: 10,
      backgroundFill: 'white',
      draggable: true,
      sizeInfo: size,
    };
    setItems([...items, textBox]);
    setSelectedId(textBox.id);
    setTextValue('Add your text here');
  };

  const addImageItem = (size) => {
    const imageItem = {
      id: 'image-' + Date.now(),
      type: 'image',
      x: 0,
      y: 0,
      width: size.cols * cellWidth + (size.cols - 1) * gutterWidth,
      height: size.rows * cellHeight,
      src: 'https://konvajs.org/assets/lion.png',
      draggable: true,
      sizeInfo: size,
    };
    setItems([...items, imageItem]);
    setSelectedId(imageItem.id);
  };

  // Read image as base64
  const handleImageUpload = (e) => {
    // console.log("e- ", e);
    
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // console.log("upr");
        const base64data = reader.result; // base64 string
        const defaultSize = { cols: 2, rows: 2, label: '2×2' };
        const imageItem = {
          id: 'image-' + Date.now(),
          type: 'image',
          x: 0,
          y: 0,
          width: defaultSize.cols * cellWidth + (defaultSize.cols - 1) * gutterWidth,
          height: defaultSize.rows * cellHeight,
          src: base64data,
          draggable: true,
          sizeInfo: defaultSize,
        };
        setItems([...items, imageItem]);
        setSelectedId(imageItem.id);
      };
      // console.log("niche");
      reader.readAsDataURL(file);
    }
  };


  //correct the logic, not working!!!
  const handleDragEnd = (e) => {
    // console.log("e2- ", e);
    const id = e.target.id();
    const shape = e.target;
    const totalCellWidth = cellWidth + gutterWidth;
    const colIndex = Math.round(shape.x() / totalCellWidth);
    const rowIndex = Math.round(shape.y() / cellHeight);
    const maxColIndex = columns - (items.find(i => i.id === id)?.sizeInfo?.cols || 1);
    const boundedColIndex = Math.min(Math.max(0, colIndex), maxColIndex);
    const boundedX = boundedColIndex * totalCellWidth;
    const maxRowIndex = rows - (items.find(i => i.id === id)?.sizeInfo?.rows || 1);
    const boundedRowIndex = Math.min(Math.max(0, rowIndex), maxRowIndex);
    const boundedY = boundedRowIndex * cellHeight;
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, x: boundedX, y: boundedY } : item
    );
    setItems(updatedItems);
  };


  
  const handleTextChange = (e) => {
    console.log(e);
    
    const newText = e.target.value;
    setTextValue(newText);
    if (selectedId) {
      const updatedItems = items.map(item =>
        item.id === selectedId && item.type === 'text'
          ? { ...item, text: newText }
          : item
      );
      setItems(updatedItems);
    }
  };

  const toggleFormat = (format) => {
    if (format === 'align') {
      const alignments = ['left', 'center', 'right'];
      const currentIndex = alignments.indexOf(textFormatting.align);
      const nextIndex = (currentIndex + 1) % alignments.length;
      setTextFormatting(prev => ({ ...prev, align: alignments[nextIndex] }));
      if (selectedId) {
        const updatedItems = items.map(item =>
          item.id === selectedId && item.type === 'text'
            ? { ...item, align: alignments[nextIndex] }
            : item
        );
        setItems(updatedItems);
      }
      return;
    }
    setTextFormatting(prev => {
      // console.log("pre- ",prev);
      // console.log(format);
      const updated = { ...prev, [format]: !prev[format] };
      if (selectedId) {
        const updatedItems = items.map(item => {
          if (item.id === selectedId && item.type === 'text') {
            let fontStyle = '';
            let textDecoration = '';
            if (updated.bold) fontStyle += 'bold ';
            if (updated.italic) fontStyle += 'italic ';
            if (updated.underline) textDecoration = 'underline';
            return { ...item, fontStyle: fontStyle.trim(), textDecoration };
          }
          return item;
        });
        setItems(updatedItems);
        // console.log("new- ",updatedItems);
        
      }
      return updated;
    });
  };

  const changeFontSize = (change) => {
    setTextFormatting(prev => {
      const newSize = Math.max(8, Math.min(72, prev.fontSize + change));
      const updated = { ...prev, fontSize: newSize };
      if (selectedId) {
        const updatedItems = items.map(item =>
          item.id === selectedId && item.type === 'text'
            ? { ...item, fontSize: newSize }
            : item
        );
        setItems(updatedItems);
      }
      return updated;
    });
  };

  const changeItemColor = (color) => {
    if (selectedId) {
      const updatedItems = items.map(item =>
        item.id === selectedId ? { ...item, fill: color } : item
      );
      setItems(updatedItems);
    }
  };

  const deleteSelected = () => {
    if (selectedId) {
      setItems(items.filter(item => item.id !== selectedId));
      setSelectedId(null);
    }
  };

  // Function to convert dataURL to Blob (for canvas uploads)
  const dataURLToBlob = (dataURL) => {
    // console.log("this",dataURL);
    
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  // Upload canvas image
  const uploadCanvasImage = () => {
    const stage = stageRef.current;
    if (stage) {
      const dataURL = stage.toDataURL();
      console.log("Data URL generated:", dataURL);
      const blob = dataURLToBlob(dataURL);
      console.log("Blob created:", blob);
      const formData = new FormData();
      formData.append("image", blob, "canvas-image.png");
      console.log("FormData prepared:", formData);
      fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData
      })
        .then(response => response.json())
        .then(data => console.log("Upload successful:", data))
        .catch(error => console.error("Error uploading:", error));
    }
  };

  // Zoom functions (using mouse wheel and buttons)
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    // console.log("old-" , oldScale);
    
    const scaleBy = 1.02;
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setStageScale(newScale);
    stage.scale({ x: newScale, y: newScale });
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
  };

  const zoomBy = (factor) => {
    // console.log("factor: ", factor)
    const stage = stageRef.current;
    const center = { x: stageSize.width / 2, y: stageSize.height / 2 };
    const oldScale = stage.scaleX();
    const newScale = oldScale * factor;
    setStageScale(newScale);
    const mousePointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    };
    const newPos = {
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    };
    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);
    stage.batchDraw();
  };

  // Build grid lines
  const gridLines = [];
  for (let i = 1; i < columns; i++) {
    const x = i * cellWidth + (i - 1) * gutterWidth;
    gridLines.push(
      <Rect
        key={`v-gutter-${i}`}
        x={x}
        y={0}
        width={gutterWidth}
        height={stageSize.height}
        fill={colors.grays[3]}
        stroke="black"
        strokeWidth={1}
      />
    );
  }
  
  // Horizontal grid lines using <Line>
for (let i = 1; i < rows; i++) {
  const y = i * cellHeight;
  gridLines.push(
    <Rect
      key={`hline-${i}`}
      x={0}
        y={i * cellHeight}
      width={stageSize.width}
      height={1}
      fill={colors.grays[4]}
      />
  );
}

  const handleKeyDown = (e) => {
    //console.log("hd -", document.activeElement);
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && document.activeElement === document.body) {
      deleteSelected();
    } 
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);

  return (
    <div className="cms-container">
      {showSetupForm && (
        <div className="setup-modal">
          <h2>Configure Grid Layout</h2>
          <div className="form-group">
            <label>Layout Title:</label>
            <input
              type="text"
              value={layoutTitle}
              onChange={(e) => setLayoutTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Columns:</label>
            <input
              type="number"
              value={columns}
              min="1"
              onChange={(e) => setColumns(Math.max(1, parseInt(e.target.value) || 8))}
            />
          </div>
          <div className="form-group">
            <label>Rows:</label>
            <input
              type="number"
              value={rows}
              min="1"
              onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 12))}
            />
          </div>
          <div className="form-group">
            <label>Gutter Width:</label>
            <input
              type="number"
              value={gutterWidth}
              min="0"
              onChange={(e) => setGutterWidth(Math.max(0, parseInt(e.target.value) || 10))}
            />
          </div>
          <button 
            className="submit-button"
            onClick={() => setShowSetupForm(false)}
          >
            Create Workbench
          </button>
        </div>
      )}

      {!showSetupForm && (
      <div className="workbench-container" style={{ border: "2px solid black" }}>
        <div className="workbench-header">
          <h1>DB Corp CMS Workbench</h1>
          <div className="workbench-actions">
            <button className="action-button" onClick={uploadCanvasImage}>Upload Canvas</button>
            <button className="action-button" onClick={saveLayout}>Save Layout</button>
            <button className="action-button" onClick={fetchAvailableLayouts}>Search Layout</button>
            <button className="action-button" onClick={() => setToolMode(toolMode === "pointer" ? "hand" : "pointer")}>
              {toolMode === "pointer" ? "Switch to Hand Tool" : "Switch to Pointer Tool"}
            </button>
            <button className="action-button" onClick={() => zoomBy(1.1)}>Zoom In</button>
            <button className="action-button" onClick={() => zoomBy(1 / 1.1)}>Zoom Out</button>
          </div>
        </div>
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          scaleX={stageScale}
          scaleY={stageScale}
          draggable={toolMode === "hand"}
          onWheel={handleWheel}
          onClick={(e) => {
            if (toolMode === "pointer") {
              const clickedOnEmpty = e.target === e.target.getStage();
              if (clickedOnEmpty) setSelectedId(null);
            }
          }}
          className="konva-stage"
        >
          <Layer>
            <Rect x={0} y={0} width={stageSize.width} height={stageSize.height} fill="gray" />
            {gridLines}
            {items.map(item => {
              if (item.type === 'box') {
                return (
                  <Rect
                    key={item.id}
                    id={item.id}
                    x={item.x}
                    y={item.y}
                    width={item.width}
                    height={item.height}
                    fill={item.fill}
                    stroke={item.stroke}
                    strokeWidth={item.strokeWidth}
                    draggable={true}
                    onClick={() => setSelectedId(item.id)}
                    onTap={() => setSelectedId(item.id)}
                    onDragEnd={handleDragEnd}
                    perfectDrawEnabled={false}
                  />
                );
              } else if (item.type === 'text') {
                return (
                  <Text
                    key={item.id}
                    id={item.id}
                    x={item.x}
                    y={item.y}
                    width={item.width}
                    height={item.height}
                    text={item.text}
                    fontSize={item.fontSize}
                    fontStyle={item.fontStyle}
                    fontFamily={item.fontFamily}
                    fill={item.fill}
                    align={item.align}
                    padding={item.padding}
                    backgroundFill={item.backgroundFill}
                    draggable={true}
                    onClick={() => setSelectedId(item.id)}
                    onTap={() => setSelectedId(item.id)}
                    onDragEnd={handleDragEnd}
                    textDecoration={item.textDecoration}
                    perfectDrawEnabled={false}
                  />
                );
              } else if (item.type === 'image') {
                return (
                  <URLImage
                    key={item.id}
                    id={item.id}
                    x={item.x}
                    y={item.y}
                    width={item.width}
                    height={item.height}
                    src={item.src}
                    draggable={true}
                    onClick={() => setSelectedId(item.id)}
                    onTap={() => setSelectedId(item.id)}
                    onDragEnd={handleDragEnd}
                    perfectDrawEnabled={false}
                  />
                );
              }
              return null;
            })}

            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // console.log("o- ",oldBox);
                // console.log("n- ",newBox);
                const totalCellWidth = cellWidth + gutterWidth;
                const colSpan = Math.round((newBox.width + gutterWidth) / totalCellWidth);
                const snappedWidth = colSpan * cellWidth + (colSpan - 1) * gutterWidth;
                const rowSpan = Math.round(newBox.height / cellHeight);
                const snappedHeight = rowSpan * cellHeight;
                const minWidth = cellWidth;
                const minHeight = cellHeight;
                const maxWidth = columns * cellWidth + (columns - 1) * gutterWidth;
                const maxHeight = rows * cellHeight;
                return {
                  ...newBox,
                  width: Math.max(minWidth, Math.min(maxWidth, snappedWidth)),
                  height: Math.max(minHeight, Math.min(maxHeight, snappedHeight)),
                };
              }}
              onTransformEnd={(e) => {
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();

                // console.log("nodeX ",scaleX);
                // console.log("nodeY ",scaleY);
                // console.log("StageX ",stageRef.current.scaleX());
                // console.log("StageY ",stageRef.current.scaleY());
                
                const updatedItems = items.map(item => {
                  if (item.id === node.id()) {
                    const newWidth = item.width * scaleX;
                    const newHeight = item.height * scaleY;
                    const totalCellWidth = cellWidth + gutterWidth;
                    const colSpan = Math.round((newWidth + gutterWidth) / totalCellWidth);
                    const snappedWidth = colSpan * cellWidth + (colSpan - 1) * gutterWidth;
                    const rowSpan = Math.round(newHeight / cellHeight);
                    const snappedHeight = rowSpan * cellHeight;
                    // console.log("before return");
                    // console.log("nodeX ",scaleX);
                    // console.log("nodeY ",scaleY);
                    // console.log("StageX ",stageRef.current.scaleX());
                    // console.log("StageY ",stageRef.current.scaleY());
                    
                    return {
                      ...item,
                      width: snappedWidth,
                      height: snappedHeight,
                      scaleX: 1,
                      scaleY: 1,
                      sizeInfo: { cols: colSpan, rows: rowSpan }
                    };
                  }
                  return item;
                });
                setItems(updatedItems);
                node.scaleX(1);
                node.scaleY(1);
                console.log("after return");
                    console.log("nodeX ",node.scaleX());
                    console.log("nodeY ",node.scaleY());
                    console.log("StageX ",stageRef.current.scaleX());
                    console.log("StageY ",stageRef.current.scaleY());
              }}
            />
          </Layer>
        </Stage>
      </div>
      )}
      
      {!showSetupForm && (
      <div className="toolbox">
        <h2 className="toolbox-header">Toolbox</h2>
        <div className="toolbox-section">
          <h3>Add Elements</h3>
          <div className="size-section">
            <h4>Text Boxes</h4>
            <div className="size-grid">
              {itemSizes.map((size) => (
                <button
                  key={`text-${size.label}`}
                  className="size-button"
                  onClick={() => addTextBox(size)}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
          <div className="size-section">
            <h4>Boxes</h4>
            <div className="size-grid">
              {itemSizes.map((size) => (
                <button
                  key={`box-${size.label}`}
                  className="size-button"
                  onClick={() => addBox(size)}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
          <div className="size-section">
            <h4>Images</h4>
            <div className="size-grid">
              {itemSizes.map((size) => (
                <button
                  key={`image-${size.label}`}
                  className="size-button"
                  onClick={() => addImageItem(size)}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
          <div className="toolbox-section">
            <h3>Upload Image</h3>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
        </div>
        {selectedId && items.find(i => i.id === selectedId)?.type === 'text' && (
          <div className="toolbox-section">
            <h3>Text Formatting</h3>
            <div className="formatting-buttons">
              <button
                className={`format-button ${textFormatting.bold ? 'active' : ''}`}
                onClick={() => toggleFormat('bold')}
                title="Bold"
              >
                B
              </button>
              <button
                className={`format-button ${textFormatting.italic ? 'active' : ''}`}
                onClick={() => toggleFormat('italic')}
                title="Italic"
              >
                I
              </button>
              <button
                className={`format-button ${textFormatting.underline ? 'active' : ''}`}
                onClick={() => toggleFormat('underline')}
                title="Underline"
              >
                U
              </button>
              <button
                className="format-button align-button"
                onClick={() => toggleFormat('align')}
                title={`Align: ${textFormatting.align}`}
              >
                {textFormatting.align === 'left' ? '⫷' : textFormatting.align === 'center' ? '⫶' : '⫸'}
              </button>
            </div>
            <div className="font-size-control">
              <button className="format-button" onClick={() => changeFontSize(-2)} title="Decrease font size">
                A-
              </button>
              <span className="font-size-display">{textFormatting.fontSize}px</span>
              <button className="format-button" onClick={() => changeFontSize(2)} title="Increase font size">
                A+
              </button>
            </div>
            <div className="font-family-selector">
              <label>Font:</label>
              <select
                value={textFormatting.fontFamily}
                onChange={(e) => {
                  const newFont = e.target.value;
                  setTextFormatting(prev => ({ ...prev, fontFamily: newFont }));
                  if (selectedId) {
                    const updatedItems = items.map(item =>
                      item.id === selectedId && item.type === 'text'
                        ? { ...item, fontFamily: newFont }
                        : item
                    );
                    setItems(updatedItems);
                  }
                }}
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
              </select>
            </div>
            <textarea
              ref={textareaRef}
              value={textValue}
              onChange={handleTextChange}
              className="text-editor"
              placeholder="Enter text here..."
            />
          </div>
        )}
        <div className="toolbox-section">
          <h3>Item Properties</h3>
          {selectedId ? (
            <>
              <div className="property-group">
                <label>Item ID:</label>
                <span>{selectedId}</span>
              </div>
              <div className="property-group">
                <label>Type:</label>
                <span>{items.find(i => i.id === selectedId)?.type || 'Unknown'}</span>
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
                <span>
                  {`${items.find(i => i.id === selectedId)?.sizeInfo?.cols || 1} × 
                     ${items.find(i => i.id === selectedId)?.sizeInfo?.rows || 1}`}
                </span>
              </div>
              <div className="color-palette">
                <h4>Color</h4>
                <div className="color-buttons">
                  {colors.primary.map((color, index) => (
                    <button
                      key={`primary-${index}`}
                      className="color-button"
                      style={{ backgroundColor: color }}
                      onClick={() => changeItemColor(color)}
                      title={`Primary ${index + 1}`}
                    />
                  ))}
                  {colors.accent.map((color, index) => (
                    <button
                      key={`accent-${index}`}
                      className="color-button"
                      style={{ backgroundColor: color }}
                      onClick={() => changeItemColor(color)}
                      title={`Accent ${index + 1}`}
                    />
                  ))}
                  {colors.grays.map((color, index) => (
                    <button
                      key={`gray-${index}`}
                      className="color-button"
                      style={{ backgroundColor: color }}
                      onClick={() => changeItemColor(color)}
                      title={`Gray ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              <button className="delete-button" onClick={deleteSelected} title="Delete selected item">
                Delete Item
              </button>
            </>
          ) : (
            <p className="no-selection">No item selected. Click on an item to view its properties.</p>
          )}
        </div>
        <div className="toolbox-section">
          <h3>Grid Settings</h3>
          <div className="property-group">
            <label>Gutter Width (px):</label>
            <input 
              type="number" 
              value={gutterWidth} 
              onChange={(e) => setGutterWidth(parseInt(e.target.value) || 0)} 
              style={{ width: '60px' }}
            />
          </div>
        </div>
        <div className="toolbox-section">
          <h3>Keyboard Shortcuts</h3>
          <ul className="shortcuts-list">
            <li><span className="shortcut-key">Delete</span> Remove selected item</li>
            <li><span className="shortcut-key">Click + Drag</span> Move items</li>
            <li><span className="shortcut-key">Click</span> Select item</li>
          </ul>
        </div>
      </div>
      )}
      
      {showLayoutList && (
        <div className="layout-list-modal">
          <h2>Select a Layout to Edit</h2>
          {availableLayouts.length > 0 ? (
            <ul>
              {availableLayouts.map(layout => (
                <li key={layout._id}>
                  <strong>{layout.title}</strong>
                  <button onClick={() => loadLayoutFromSelected(layout)}>Edit</button>
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
  );
}

export default WorkBench;
