import { useState, useRef, useEffect } from 'react';
import { getCellDimensions } from '../utils/gridHelpers';

const useWorkbench = () => {
  // Constants
  const userId = "60d21b4667d0d8992e610c85"; // example ObjectId
  const defaultTitle = "default";

  // Setup & grid configuration
  const [showSetupForm, setShowSetupForm] = useState(true);
  const [layoutTitle, setLayoutTitle] = useState(defaultTitle);
  const [columns, setColumns] = useState(8);
  const [rows, setRows] = useState(12);
  const [gutterWidth, setGutterWidth] = useState(10);

  // Workbench items and layout state
  //const [items, setSections] = useState([]);
  const [sections, setSections] = useState([]);
  const [sectionId, setSectionId] = useState(''); // Ensure ID type matches
  const [embeddedLayouts, setEmbeddedLayouts] = useState([]);
  const addSection = (size) => {
    return {
      id: 'box-' + Date.now(), // Ensuring ID remains a string
      sectionType: 'defaulti',  // Added required field
      x: 0,
      y: 0,
      width: size.cols * cellWidth + (size.cols - 1) * gutterWidth,
      height: size.rows * cellHeight,
      fill: colors.grays[4],
      stroke: colors.grays[2],
      strokeWidth: 1,
      draggable: true,
      sizeInfo: size,
      gridX: 0,
      gridY: 0,
      items: [],
    };
  };
  
  // Item addition function
  const addBox = (size) => {
    return {
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
      gridX: 0,
      gridY: 0
    };
  };
  
  
  const addItemToSection = (sectionId, size,type) => {
    setSections(prevSections =>
      prevSections.map(section => {
        if (section.id !== sectionId) return section; // Skip if it's not the target section
  
        let newItem;
        if(type == "text")
        newItem = addTextBox(size);
        else
        newItem = addImageItem(size);

        const bestPosition = findBestPositionForItem(newItem, section.items, section.sizeInfo);
  
        if (!bestPosition) {
          alert('No space available in section!');
          return section;
        }
  
        newItem.gridX = bestPosition.gridX;
        newItem.gridY = bestPosition.gridY;
        newItem.x = newItem.gridX * cellWidth + newItem.gridX * gutterWidth;
        newItem.y = newItem.gridY * cellHeight;
  
        return { ...section, items: [...section.items, newItem] };
      })
    );
  };
  
  const addNewSection = (size) => {
    // if (!newBoxContent && newBoxType === 'text') {
    //   alert('Please enter text content for the new box');
    //   return;
    // }
    const newSection = addSection(size)
  
    const position = findBestPositionForBox(newSection, sections, columns, rows);
    if (!position) {
      alert('No space available for new box');
      return;
    }
    console.log("position: - ",position);
    newSection.gridX = position.gridX;
    newSection.gridY = position.gridY;
    newSection.x = newSection.gridX * cellWidth + (newSection.gridX) * gutterWidth;
    newSection.y = newSection.gridY * cellHeight;
    setSections(prev => [...prev, newSection]);
    setSelectedId(newSection.id);
    
  };
  
  
  // Debugging useEffect to log sections when they change
  useEffect(() => {
    console.log("Updated sections:", sections);
  }, [sections]);
  
  

  const itemsOverlap = (itemA, itemB) => {
    return (
      itemA.gridX < itemB.gridX + itemB.sizeInfo.cols &&
      itemA.gridX + itemA.sizeInfo.cols > itemB.gridX &&
      itemA.gridY < itemB.gridY + itemB.sizeInfo.rows &&
      itemA.gridY + itemA.sizeInfo.rows > itemB.gridY
    );
  };
  
  // Find the best position for an item inside a section
  const findBestPositionForItem = (item, sectionItems, sectionSize, originalPosition = null) => {

    console.log(sectionSize);
    if (originalPosition) {
      let conflict = sectionItems.some(other => itemsOverlap({ ...item, gridX: originalPosition.gridX, gridY: originalPosition.gridY }, other));
      if (!conflict) return originalPosition;
    }
  
    const possiblePositions = [];
    for (let y = 0; y <= sectionSize.rows - item.sizeInfo.rows; y++) {
      for (let x = 0; x <= sectionSize.cols - item.sizeInfo.cols; x++) {
        let conflict = sectionItems.some(other => itemsOverlap({ ...item, gridX: x, gridY: y }, other));
        if (!conflict) {
          let distance = originalPosition
            ? Math.sqrt(Math.pow(x - originalPosition.gridX, 2) + Math.pow(y - originalPosition.gridY, 2))
            : x + y;
          possiblePositions.push({ gridX: x, gridY: y, distance });
        }
      }
    }
  
    possiblePositions.sort((a, b) => a.distance - b.distance);
    return possiblePositions.length > 0 ? possiblePositions[0] : null;
  };
  
  const [selectedId, setSelectedId] = useState(null);
  const [availableLayouts, setAvailableLayouts] = useState([]);
  const [showLayoutList, setShowLayoutList] = useState(false);

  // Zoom and tool state
  const [stageScale, setStageScale] = useState(1);
  const [toolMode, setToolMode] = useState("pointer");

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

  // Stage reference for Konva
  const stageRef = useRef(null);
  const transformerRef = useRef(null);

  // Stage dimensions (minus toolbox width)
  const [stageSize, setStageSize] = useState({
    width: window.innerWidth - 320,
    height: window.innerHeight,
  });

  // Calculate cell dimensions using a helper
  const { cellWidth, cellHeight } = getCellDimensions(stageSize.width, stageSize.height, columns, rows, gutterWidth);

  // Available item sizes
  const itemSizes = [
    { cols: 1, rows: 1, label: '1×1' },
    { cols: 2, rows: 1, label: '2×1' },
    { cols: 2, rows: 2, label: '2×2' },
    { cols: 4, rows: 2, label: '4×2' },
    { cols: 4, rows: 4, label: '4×4' },
    { cols: 8, rows: 4, label: '8×4' },
  ];

  // Color palette
  const colors = {
    primary: ['#1a73e8', '#4285f4', '#8ab4f8'],
    accent: ['#ea4335', '#fbbc04', '#34a853'],
    grays: ['#202124', '#3c4043', '#5f6368', '#dadce0', '#f1f3f4']
  };

  // Layout endpoints
  const saveLayout1 = async () => {
    try {
      const gridSettings = { columns, rows, gutterWidth };
      const response = await fetch('http://localhost:5000/api/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title: layoutTitle, items, gridSettings }),
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
        console.log("Hii",response);
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

  const loadLayoutFromSelected1 = (layout) => {
    if (layout.gridSettings && layout.gridSettings.gutterWidth !== undefined) {
      setColumns(layout.gridSettings.columns);
      setRows(layout.gridSettings.rows);
      setGutterWidth(layout.gridSettings.gutterWidth);
    }
    setSections(layout.items);
    setLayoutTitle(layout.title);
    setShowLayoutList(false);
    setShowSetupForm(false);
    console.log("Loaded layout:", layout);
  };

  
  const addTextBox = (size) => {
    return {
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
      gridX: 0,
      gridY: 0
    };
  };
  
  const addImageItem = (size) => {
    return {
      id: 'image-' + Date.now(),
      type: 'image',
      x: 0,
      y: 0,
      width: size.cols * cellWidth + (size.cols - 1) * gutterWidth,
      height: size.rows * cellHeight,
      src: 'https://konvajs.org/assets/lion.png',
      draggable: true,
      sizeInfo: size,
      gridX: 0,
      gridY: 0
    };
  };
  
  // Image upload handler
  const handleImageUpload = (e) => {
    console.log("image : -",e);
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        const defaultSize = { cols: 2, rows: 2, label: '2×2' };
        const imageItem = addImageItem(defaultSize);
        imageItem.src = base64data; // Set uploaded image source
        setSections(prevSections =>
          prevSections.map(section => 
            section.id === sectionId  // Ensure you're adding image inside the correct section
              ? { ...section, items: [...section.items, imageItem] }
              : section
          )
        );
        
        setSelectedId(imageItem.id);
      };
      reader.readAsDataURL(file);
    }
  };
  
// Helper function to update sections
const updateSections = (selectedId, sections, updateFn) => {
  return sections.map(section => ({
    ...section,
    items: section.items.map(item => 
      item.id === selectedId && item.type === 'text'
        ? updateFn(item)
        : item
    )
  }));
};

// Text change handler for text boxes
const handleTextChange = (e) => {
  const newText = e.target.value;
  setTextValue(newText);

  if (selectedId) {
    setSections(prevSections => updateSections(selectedId, prevSections, item => ({
      ...item,
      text: newText
    })));
  }
};

// Toggle text formatting
const toggleFormat = (format) => {
  if (format === 'align') {
    const alignments = ['left', 'center', 'right'];
    const currentIndex = alignments.indexOf(textFormatting.align);
    const nextIndex = (currentIndex + 1) % alignments.length;

    setTextFormatting(prev => ({ ...prev, align: alignments[nextIndex] }));

    if (selectedId) {
      setSections(prevSections => updateSections(selectedId, prevSections, item => ({
        ...item,
        align: alignments[nextIndex]
      })));
    }
    return;
  }

  setTextFormatting(prev => {
    const updated = { ...prev, [format]: !prev[format] };

    if (selectedId) {
      setSections(prevSections => updateSections(selectedId, prevSections, item => {
        const fontStyle = [
          updated.bold ? 'bold' : '',
          updated.italic ? 'italic' : ''
        ].join(' ').trim();

        const textDecoration = updated.underline ? 'underline' : '';

        return { ...item, fontStyle, textDecoration };
      }));
    }

    return updated;
  });
};

// Change font size handler
const changeFontSize = (change) => {
  setTextFormatting(prev => {
    const newSize = Math.max(8, Math.min(72, prev.fontSize + change));
    const updated = { ...prev, fontSize: newSize };

    if (selectedId) {
      setSections(prevSections => updateSections(selectedId, prevSections, item => ({
        ...item,
        fontSize: newSize
      })));
    }

    return updated;
  });
};

// Change color for selected item
const changeItemColor = (color) => {
  if (selectedId) {
    setSections(prevSections => updateSections(selectedId, prevSections, item => ({
      ...item,
      fill: color
    })));
  }
};

// Delete selected section or item
const deleteSelected = () => {
  if (!selectedId) return;

  setSections(prevSections => 
    prevSections
      .map(section => {
        if (section.id === selectedId) return null; // Remove section
        return { ...section, items: section.items.filter(item => item.id !== selectedId) }; // Filter out item
      })
      .filter(Boolean) // Remove null values (deleted sections)
  );

  setSelectedId(null);
};


  // Convert dataURL to Blob
  const dataURLToBlob = (dataURL) => {
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
    console.log(stage);
    if (stage) {
      console.log("stage : -",stage);
      const dataURL = stage.toDataURL();
      console.log("dataURL : -",dataURL);
      const blob = dataURLToBlob(dataURL);
      const formData = new FormData();
      formData.append("image", blob, "canvas-image.png");
      fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      })
        .then(response => response.json())
        .then(data => console.log("Upload successful:", data))
        .catch(error => console.error("Error uploading:", error));
    }
  };

  // Zoom handlers
  
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    //console.log("old-" , oldScale);
    
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

// Transformer onTransformEnd handler
  const handleTransformEnd = (e) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const newWidth = node.width() * scaleX;
    const newHeight = node.height() * scaleY;
    const totalCellWidth = cellWidth + gutterWidth;
    const colSpan = Math.round((newWidth + gutterWidth) / totalCellWidth);
    const snappedWidth = colSpan * cellWidth + (colSpan - 1) * gutterWidth;
    const rowSpan = Math.round(newHeight / cellHeight);
    const snappedHeight = rowSpan * cellHeight;
    setSections(prev => prev.map(item =>
      item.id === node.id() ? {
        ...item,
        width: snappedWidth,
        height: snappedHeight,
        scaleX: 1,
        scaleY: 1,
        sizeInfo: { cols: colSpan, rows: rowSpan },
      } : item
    ));
    node.scaleX(1);
    node.scaleY(1);
  };


  // Update transformer when selection changes
 // Update transformer when selection changes
useEffect(() => {
  if (!selectedId || !transformerRef.current) {
    transformerRef.current?.nodes([]);
    transformerRef.current?.getLayer()?.batchDraw();
    return;
  }

  // Find selected item inside sections
  let selectedItem = null;
  let selectedSection = null;

  for (const section of sections) {
    const item = section.items.find(i => i.id === selectedId);
    if (item) {
      selectedItem = item;
      selectedSection = section;
      break; // Stop searching once found
    }
  }

  if (!selectedItem) return;

  // Find the corresponding node in the Konva stage
  const selectedNode = transformerRef.current.getStage().findOne(`#${selectedId}`);

  if (selectedNode) {
    transformerRef.current.nodes([selectedNode]);
    transformerRef.current.getLayer().batchDraw();
    
    if (selectedItem.type === 'text') {
      setTextValue(selectedItem.text);
      setTextFormatting({
        bold: selectedItem.fontStyle?.includes('bold') || false,
        italic: selectedItem.fontStyle?.includes('italic') || false,
        underline: selectedItem.textDecoration === 'underline' || false,
        fontSize: selectedItem.fontSize || 16,
        align: selectedItem.align || 'left',
        fontFamily: selectedItem.fontFamily || 'Arial'
      });
    }
  }
}, [selectedId, sections]);


  // Global keydown handler for Delete key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && document.activeElement === document.body) {
        deleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);
  
    useEffect(() => {
      console.log("s-",stageRef);
      
      const container = stageRef.current && stageRef.current.container();
      if (container) {
        container.style.cursor = toolMode === "hand" ? "grab" : "default";
      }
    }, [toolMode]);

// Check if two grid rectangles overlap
const rectanglesOverlap = (boxA, boxB) => {
  //console.log("boxA -",boxA," BoxB - ",boxB);
  return (
    boxA.gridX < boxB.gridX + boxB.sizeInfo.cols &&
    boxA.gridX + boxA.sizeInfo.cols > boxB.gridX &&
    boxA.gridY < boxB.gridY + boxB.sizeInfo.rows &&
    boxA.gridY + boxA.sizeInfo.rows > boxB.gridY
  );  
};

const findBestPositionForBox = (item, fixedItems, columns, rows, originalPosition) => {
  if (originalPosition) {
    let conflict = false;
    for (let other of fixedItems) {
      if (rectanglesOverlap({ ...item, gridX: originalPosition.gridX, gridY: originalPosition.gridY }, other)) {
        conflict = true;
        break;
      }
    }
    if (!conflict) return originalPosition;
  }

  const possiblePositions = [];
  
  // Use `item.sizeInfo.cols` and `item.sizeInfo.rows` instead of `item.width` & `item.height`
  console.log("size : -",item.sizeInfo);
  for (let y = 0; y <= rows - item.sizeInfo.rows; y++) {
    for (let x = 0; x <= columns - item.sizeInfo.cols; x++) {
      let conflict = false;
      for (let other of fixedItems) {
        if (rectanglesOverlap({ ...item, gridX: x, gridY: y }, other)) {
          conflict = true;
          break;
        }
      }
      if (!conflict) {
        let distance = originalPosition
          ? Math.sqrt(Math.pow(x - originalPosition.gridX, 2) + Math.pow(y - originalPosition.gridY, 2))
          : x + y;
        possiblePositions.push({ gridX: x, gridY: y, distance });
      }
    }
  }

  possiblePositions.sort((a, b) => a.distance - b.distance);
  return possiblePositions.length > 0 ? possiblePositions[0] : null;
};




// addBox function for predefined sizes
const addPredefineditem = (size,type) => {
  // if (!newBoxContent && newBoxType === 'text') {
  //   alert('Please enter text content for the new box');
  //   return;
  // }
  let newItem;
  if(type == "box")
  newItem = addBox(size);
  else if(type == "text")
  newItem = addTextBox(size);
  else
  newItem = addImageItem(size);

  const position = findBestPositionForBox(newItem, items, columns, rows);
  if (!position) {
    alert('No space available for new box');
    return;
  }
  console.log("position: - ",position);
  newItem.gridX = position.gridX;
  newItem.gridY = position.gridY;
  newItem.x = newItem.gridX * cellWidth + (newItem.gridX) * gutterWidth;
  newItem.y = newItem.gridY * cellHeight;
  setSections(prev => [...prev, newItem]);
  setSelectedId(newItem.id);
  
};


// Cascade reposition all boxes that would be displaced
const repositionBoxes = (movingItem, targetPosition, allItems, columns, rows) => {
  const result = { success: false, newPositions: {} };
  const fixedBoxes = [];
  const boxesToProcess = [...allItems];

  const movingBoxWithNewPos = { ...movingItem, gridX: targetPosition.gridX, gridY: targetPosition.gridY };
  fixedBoxes.push(movingBoxWithNewPos);
  result.newPositions[movingItem.id] = { gridX: targetPosition.gridX, gridY: targetPosition.gridY };

  const index = boxesToProcess.findIndex(b => b.id === movingItem.id);
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


  const [draggingBox, setDraggingBox] = useState(null);
  const [dragPreviewPosition, setDragPreviewPosition] = useState(null);
  const [dragStatus, setDragStatus] = useState(null);
  const [snapLines, setSnapLines] = useState([]);

  const repositionItemsInSection = (movingItem, targetPosition, section) => {
    const result = { success: false, newPositions: {} };
    const fixedItems = [];
    const itemsToProcess = [...section.items];
  
    // Update the position of the moving item
    const movingItemWithNewPos = { ...movingItem, gridX: targetPosition.gridX, gridY: targetPosition.gridY };
    fixedItems.push(movingItemWithNewPos);
    result.newPositions[movingItem.id] = { gridX: targetPosition.gridX, gridY: targetPosition.gridY };
  
    // Remove moving item from the processing list
    const index = itemsToProcess.findIndex(item => item.id === movingItem.id);
    if (index !== -1) itemsToProcess.splice(index, 1);
  
    let overlappingItems = itemsToProcess.filter(item => itemsOverlap(movingItemWithNewPos, item));
  
    const processItem = (item, remainingItems, processedItems = new Set()) => {
      if (processedItems.has(item.id)) return true;
      processedItems.add(item.id);
      
      const originalPos = { gridX: item.gridX, gridY: item.gridY };
      const newPos = findBestPositionForItem(item, fixedItems, section.sizeInfo, originalPos);
      
      if (!newPos) return false; // No space found
  
      const itemWithNewPos = { ...item, gridX: newPos.gridX, gridY: newPos.gridY };
      fixedItems.push(itemWithNewPos);
      result.newPositions[item.id] = { gridX: newPos.gridX, gridY: newPos.gridY };
  
      // Check for overlapping items after moving
      const newOverlappingItems = remainingItems.filter(
        b => b.id !== item.id && itemsOverlap(itemWithNewPos, b)
      );
      
      for (const overlappingItem of newOverlappingItems) {
        const success = processItem(overlappingItem, remainingItems.filter(b => b.id !== overlappingItem.id), processedItems);
        if (!success) return false;
      }
      return true;
    };
  
    let remainingToProcess = [...itemsToProcess];
    for (const overlappingItem of overlappingItems) {
      const success = processItem(overlappingItem, remainingToProcess.filter(b => b.id !== overlappingItem.id));
      if (!success) return result;
      remainingToProcess = remainingToProcess.filter(b => b.id !== overlappingItem.id);
    }
  
    result.success = true;
    return result;
  };
  
  // Handle item drag inside a section
  const handleItemDragEnd = (e, itemId, sectionId) => {
    setSections(prevSections =>
      prevSections.map(section => {
        if (section.id !== sectionId) return section; // Ignore other sections
  
        const currentItem = section.items.find(item => item.id === itemId);
        if (!currentItem || !dragPreviewPosition) {
          resetDragState();
          return section;
        }
  
        const { gridX: newGridX, gridY: newGridY } = dragPreviewPosition;
        if (newGridX === currentItem.gridX && newGridY === currentItem.gridY) {
          resetDragState();
          return section;
        }
  
        // Reposition items inside the section
        const repositionResult = repositionItemsInSection(currentItem, { gridX: newGridX, gridY: newGridY }, section);
        
        if (repositionResult.success) {
          return {
            ...section,
            items: section.items.map(item =>
              repositionResult.newPositions[item.id]
                ? {
                    ...item,
                    gridX: repositionResult.newPositions[item.id].gridX,
                    gridY: repositionResult.newPositions[item.id].gridY,
                    x: repositionResult.newPositions[item.id].gridX * cellWidth + repositionResult.newPositions[item.id].gridX * gutterWidth,
                    y: repositionResult.newPositions[item.id].gridY * cellHeight
                  }
                : item
            )
          };
        } else {
          resetItemPosition(itemId, currentItem);
          return section;
        }
      })
    );
  
    resetDragState();
  };
  
  // Reset item position if movement is invalid
  const resetItemPosition = (id, currentItem) => {
    const stageNode = e.target.getStage();
    const layer = stageNode.findOne('Layer');
    const group = layer.findOne(`#${id}`);
    if (group) {
      group.to({
        x: currentItem.gridX * (cellWidth + gutterWidth),
        y: currentItem.gridY * cellHeight,
        duration: 0.3
      });
    }
  };
  
  // Handle item dragging
  const handleItemDragMove = (e, itemId, sectionId) => {
    if (!draggingBox) return;
    const shape = e.target;
    const pixelPosition = { x: shape.x(), y: shape.y() };
    const gridPosition = snapToGrid(pixelPosition);
  
    const currentSection = sections.find(section => section.id === sectionId);
    if (!currentSection) return;
    
    const currentItem = currentSection.items.find(item => item.id === itemId);
    if (!currentItem) return;
  
    const clampedGridX = Math.min(Math.max(0, gridPosition.gridX), currentSection.sizeInfo.cols - currentItem.sizeInfo.cols);
    const clampedGridY = Math.min(Math.max(0, gridPosition.gridY), currentSection.sizeInfo.rows - currentItem.sizeInfo.rows);
  
    setSnapLines(generateSnapLines(currentItem, { gridX: clampedGridX, gridY: clampedGridY }));
    shape.position({
      x: clampedGridX * (cellWidth + gutterWidth),
      y: clampedGridY * cellHeight
    });
    setDragPreviewPosition({ gridX: clampedGridX, gridY: clampedGridY });
  };
  
  // Snap to grid logic for sections
  const snapToGrid = (pixelPosition) => {
    const gridX = Math.round(pixelPosition.x / (cellWidth + gutterWidth));
    const gridY = Math.round(pixelPosition.y / cellHeight);
  
    return {
      gridX: Math.max(0, gridX),
      gridY: Math.max(0, gridY)
    };
  };
  
  // Generate snapping lines
  const generateSnapLines = (currentItem, gridPos) => {
    if (!currentItem) return [];
  
    const lines = [];
    const leftX = gridPos.gridX * (cellWidth + gutterWidth);
    const rightX = leftX + (currentItem.sizeInfo.cols * cellWidth) + ((currentItem.sizeInfo.cols - 1) * gutterWidth);
    const topY = gridPos.gridY * cellHeight;
    const bottomY = topY + (currentItem.sizeInfo.rows * cellHeight);
  
    lines.push({ points: [leftX, 0, leftX, stageSize.height], stroke: '#2196F3', strokeWidth: 1, dash: [5, 5] });
    lines.push({ points: [rightX, 0, rightX, stageSize.height], stroke: '#2196F3', strokeWidth: 1, dash: [5, 5] });
    lines.push({ points: [0, topY, stageSize.width, topY], stroke: '#2196F3', strokeWidth: 1, dash: [5, 5] });
    lines.push({ points: [0, bottomY, stageSize.width, bottomY], stroke: '#2196F3', strokeWidth: 1, dash: [5, 5] });
  
    return lines;
  };
  
  // Reset drag state
  const resetDragState = () => {
    setDraggingBox(null);
    setDragPreviewPosition(null);
    setDragStatus(null);
  };
  const handleItemDragStart = (e, itemId, sectionId) => {
    setDraggingBox(itemId);
    setDragStatus(null);
  
    // Find the section and item being dragged
    const section = sections.find(sec => sec.id === sectionId);
    if (!section) return;
  
    const currentItem = section.items.find(item => item.id === itemId);
    if (!currentItem) return;
  
    // Generate snap lines within the section boundaries
    setSnapLines(generateSnapLines(currentItem, { gridX: currentItem.gridX, gridY: currentItem.gridY }));
  };
    
    const handleDragStart = (e, id) => {
      setDraggingBox(id);
      setDragStatus(null);
      const currentBox = sections.find(b => b.id === id);
      if (!currentBox) return;
      setSnapLines(generateSnapLines(currentBox, { gridX: currentBox.gridX, gridY: currentBox.gridY }));
    };
    
    const handleDragMove = (e, id) => {
      if (!draggingBox) return;
      const shape = e.target;
      const pixelPosition = { x: shape.x(), y: shape.y() };
      const gridPosition = snapToGrid(pixelPosition);
      const currentBox = sections.find(b => b.id === id);
      if (!currentBox) return;
    
      const clampedGridX = Math.min(Math.max(0, gridPosition.gridX), columns - currentBox.sizeInfo.cols);
      const clampedGridY = Math.min(Math.max(0, gridPosition.gridY), rows - currentBox.sizeInfo.rows);
    
      setSnapLines(generateSnapLines(currentBox, { gridX: clampedGridX, gridY: clampedGridY }));
      shape.position({
        x: clampedGridX * (cellWidth + gutterWidth),
        y: clampedGridY * cellHeight
      });
      setDragPreviewPosition({ gridX: clampedGridX, gridY: clampedGridY });
    };
    
    const handleDragEnd = (e, id) => {
      setSnapLines([]);
      const currentBox = sections.find(b => b.id === id);
      if (!currentBox || !dragPreviewPosition) {
        resetDragState();
        return;
      }
    
      const { gridX: newGridX, gridY: newGridY } = dragPreviewPosition;
      if (newGridX === currentBox.gridX && newGridY === currentBox.gridY) {
        resetDragState();
        return;
      }
    
      const repositionResult = repositionBoxes(currentBox, { gridX: newGridX, gridY: newGridY }, sections, columns, rows);
      if (repositionResult.success) {
        setSections(prevBoxes =>
          prevBoxes.map(box => repositionResult.newPositions[box.id] ? {
            ...box,
            gridX: repositionResult.newPositions[box.id].gridX,
            gridY: repositionResult.newPositions[box.id].gridY,
            x: repositionResult.newPositions[box.id].gridX * (cellWidth + gutterWidth),
            y: repositionResult.newPositions[box.id].gridY * cellHeight,
          } : box)
        );
      } else {
        resetBoxPosition(id, currentBox);
      }
      resetDragState();
    };
    const resetBoxPosition = (id, currentBox) => {
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
    }; 


// New function to add an embedded layout
const addEmbeddedLayout = (layoutToEmbed, sectionId) => {
  setSections(prevSections =>
    prevSections.map(section => {
      if (section.id !== sectionId) return section; // Skip if it's not the target section

      const newEmbedded = {
        layoutId: layoutToEmbed._id,
        title: layoutToEmbed.title,
        gridSettings: layoutToEmbed.gridSettings,
        sections: layoutToEmbed.sections.map(sec => ({
          ...sec,
          id: `${sec.id}-${Date.now()}`, // Ensure unique ID
        })),
      };

      return { ...section, embeddedLayouts: [...(section.embeddedLayouts || []), newEmbedded] };
    })
  );
};

// Update saveLayout to include embeddedLayouts (stored as previousLayouts)
// Update saveLayout to include embeddedLayouts (stored as previousLayouts)
// const saveLayout = async () => {
//   try {
//     const gridSettings = { columns, rows, gutterWidth };
//     const response = await fetch('http://localhost:5000/api/layout', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ userId, title: layoutTitle, items: sections, gridSettings, previousLayouts: embeddedLayouts }),
//     });
//     const data = await response.json();
//     console.log('Layout saved successfully', data);
//   } catch (error) {
//     console.error('Error saving layout:', error);
//   }
// };

// Update saveLayout to validate sections before saving (if needed)
const saveLayout = async () => {
  try {
    const gridSettings = { columns, rows, gutterWidth };
    // Validate that every section has sectionType.
    const validatedSections = sections.map(section => ({
      ...section,
      sectionType: section.sectionType || 'default'
    }));
    console.log('[useWorkbench] Saving layout with gridSettings:', gridSettings);
    console.log('[useWorkbench] Embedded layouts:', embeddedLayouts);
    console.log('[useWorkbench] Sections:', validatedSections);
    
    const response = await fetch('http://localhost:5000/api/layout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title: layoutTitle, items: validatedSections, gridSettings, previousLayouts: embeddedLayouts }),
    });
    const data = await response.json();
    console.log('[useWorkbench] Layout saved successfully', data);
  } catch (error) {
    console.error('[useWorkbench] Error saving layout:', error);
  }
};
//NEW:: Embed a layout into the currently selected section
const embedLayoutInSection = (layoutToEmbed) => {
  if (!sectionId) {
    alert("Please select a section to embed the layout.");
    return;
  }
  console.log('[useWorkbench] Attempting to embed layout into section:', layoutToEmbed, sectionId);

  // Check if the layout has sections
  if (!layoutToEmbed.items || layoutToEmbed.items.length === 0) {
    console.log('[useWorkbench] Selected layout has no sections.');
    alert("Selected layout has no sections to embed.");
    return;
  }
  
  // Gather all items from all sections in the selected layout.
  let embeddedItems = [];
  layoutToEmbed.items.forEach(sec => {
    if (sec.items && sec.items.length > 0) {
      embeddedItems = embeddedItems.concat(sec.items);
    }
  });

  if (embeddedItems.length === 0) {
    console.log('[useWorkbench] Selected layout has sections but no items.');
    alert("Selected layout has sections but no items to embed.");
    return;
  }
  
  // Merge these embedded items into the currently selected section.
  setSections(prevSections =>
    prevSections.map(section => {
      if (section.id === sectionId) {
        const mergedItems = [...section.items, ...embeddedItems];
        console.log('[useWorkbench] Merging embedded items into section:', section.id, mergedItems);
        return { ...section, items: mergedItems };
      }
      return section;
    })
  );
};

  // Update loadLayoutFromSelected to restore embedded layouts
const loadLayoutFromSelected = (layout) => {
  if (layout.gridSettings && layout.gridSettings.gutterWidth !== undefined) {
    setColumns(layout.gridSettings.columns);
    setRows(layout.gridSettings.rows);
    setGutterWidth(layout.gridSettings.gutterWidth);
  }
  setSections(layout.items);
  if (layout.previousLayouts) setEmbeddedLayouts(layout.previousLayouts);
  setLayoutTitle(layout.title);
  setShowLayoutList(false);
  console.log("Loaded layout:", layout);
};

    
  // Drag end handler (snapping)
  // const handleDragEnd = (e) => {
  //   const id = e.target.id();
  //   const shape = e.target;
  //   const totalCellWidth = cellWidth + gutterWidth;
  //   const colIndex = Math.round(shape.x() / totalCellWidth);
  //   const rowIndex = Math.round(shape.y() / cellHeight);
  //   const maxColIndex = columns - (items.find(i => i.id === id)?.sizeInfo?.cols || 1);
  //   const boundedColIndex = Math.min(Math.max(0, colIndex), maxColIndex);
  //   const boundedX = boundedColIndex * totalCellWidth;
  //   const maxRowIndex = rows - (items.find(i => i.id === id)?.sizeInfo?.rows || 1);
  //   const boundedRowIndex = Math.min(Math.max(0, rowIndex), maxRowIndex);
  //   const boundedY = boundedRowIndex * cellHeight;
  //   const updatedItems = items.map(item =>
  //     item.id === id ? { ...item, x: boundedX, y: boundedY} : item
  //   );
  //   setSections(updatedItems);
  // };

  // const handleDragEnd = (e, id) => {
  //   setSnapLines([]); // Clear snap lines
    
  //   const currentBox = items.find(b => b.id === id);
  //   if (!currentBox || !dragPreviewPosition) {
  //     setDraggingBox(null);
  //     setDragPreviewPosition(null);
  //     setDragStatus(null);
  //     return;
  //   }
  
  //   const { gridX: newGridX, gridY: newGridY } = dragPreviewPosition;
    
  //   // No movement, just reset
  //   if (newGridX === currentBox.gridX && newGridY === currentBox.gridY) {
  //     setDraggingBox(null);
  //     setDragPreviewPosition(null);
  //     setDragStatus(null);
  //     return;
  //   }
  
  //   // Try repositioning
  //   const repositionResult = repositionBoxes(
  //     currentBox,
  //     { gridX: newGridX, gridY: newGridY },
  //     items,
  //     columns,
  //     rows
  //   );
  
  //   if (repositionResult.success) {
  //     // Update the state with new positions
  //     setSections(prevBoxes =>
  //       prevBoxes.map(box => {
  //         if (repositionResult.newPositions[box.id]) {
  //           return {
  //             ...box,
  //             gridX: repositionResult.newPositions[box.id].gridX,
  //             gridY: repositionResult.newPositions[box.id].gridY,
  //             x: repositionResult.newPositions[box.id].gridX * (cellWidth + gutterWidth),
  //             y: repositionResult.newPositions[box.id].gridY * cellHeight,
  //           };
  //         }
  //         return box;
  //       })
  //     );
  //   } else {
  //     // If invalid, reset position visually
  //     const stageNode = e.target.getStage();
  //     const layer = stageNode.findOne('Layer');
  //     const group = layer.findOne(`#${id}`);
  
  //     if (group) {
  //       group.to({
  //         x: currentBox.gridX * (cellWidth + gutterWidth),
  //         y: currentBox.gridY * cellHeight,
  //         duration: 0.3
  //       });
  //     }
  //   }
  
  //   setDraggingBox(null);
  //   setDragPreviewPosition(null);
  //   setDragStatus(null);
  // };
  



// // addCustomBox uses custom inputs for width/height
// const addCustomBox = () => {
//   // if (!newBoxContent && newBoxType === 'text') {
//   //   alert('Please enter text content for the new box');
//   //   return;
//   // }
//   const newBox = {
//     id: `box${boxes.length + 1}`,
//     width: newBoxWidth,
//     height: newBoxHeight,
//     type: newBoxType,
//     text: newBoxType === 'text' ? newBoxContent : 'Image'
//   };
//   const position = findBestPositionForBox(newBox, boxes, columns, rows);
//   if (!position) {
//     alert('No space available for new box');
//     return;
//   }
//   newBox.gridX = position.gridX;
//   newBox.gridY = position.gridY;
//   setBoxes([...boxes, newBox]);
//   setNewBoxContent('');
// };



  return {
    userId,
    embeddedLayouts,
    addEmbeddedLayout: embedLayoutInSection,
    saveLayout,
  // loadLayoutFromSelected,
    showSetupForm,
    setShowSetupForm,
    layoutTitle,
    setLayoutTitle,
    columns,
    setColumns,
    rows,
    setRows,
    gutterWidth,
    setGutterWidth,
    stageSize,
    stageScale,
    toolMode,
    setToolMode,
    selectedId,
    setSelectedId,
    availableLayouts,
    showLayoutList,
    setShowLayoutList,
    textValue,
    setTextValue,
    textFormatting,
    setTextFormatting,
    stageRef,
    transformerRef,
    itemSizes,
    colors,
    uploadCanvasImage,
    // saveLayout,
    fetchAvailableLayouts,
    zoomBy,
    handleWheel,
    addBox,
    addTextBox,
    addImageItem,
    handleImageUpload,
    handleTextChange,
    toggleFormat,
    changeFontSize,
    changeItemColor,
    deleteSelected,
    handleTransformEnd,
    loadLayoutFromSelected,
    cellWidth,
    cellHeight,
    addPredefineditem,
    addNewSection,
    addItemToSection,
    setSectionId,
    sectionId,
    sections,
    handleItemDragEnd,
    handleItemDragStart,
    handleItemDragMove,
    handleDragStart,
    handleDragEnd,
    handleDragMove,
    // addNewSection
  };
};

export default useWorkbench;
