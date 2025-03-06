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
  const [items, setItems] = useState([]);
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
  const saveLayout = async () => {
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

  const loadLayoutFromSelected = (layout) => {
    if (layout.gridSettings && layout.gridSettings.gutterWidth !== undefined) {
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

  // Item addition functions
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
    setItems(prev => [...prev, box]);
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
    setItems(prev => [...prev, textBox]);
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
    setItems(prev => [...prev, imageItem]);
    setSelectedId(imageItem.id);
  };

  // Image upload handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
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
        setItems(prev => [...prev, imageItem]);
        setSelectedId(imageItem.id);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag end handler (snapping)
  const handleDragEnd = (e) => {
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

  // Text change handler for text boxes
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


  // Toggle text formatting
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


  // Change font size handler
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

  // Change color for selected item
  const changeItemColor = (color) => {
    if (selectedId) {
      const updatedItems = items.map(item =>
        item.id === selectedId ? { ...item, fill: color } : item
      );
      setItems(updatedItems);
    }
  };

  // Delete selected item
  const deleteSelected = () => {
    if (selectedId) {
      setItems(items.filter(item => item.id !== selectedId));
      setSelectedId(null);
    }
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
    setItems(prev => prev.map(item =>
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

  return {
    userId,
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
    items,
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
    saveLayout,
    fetchAvailableLayouts,
    zoomBy,
    handleWheel,
    addBox,
    addTextBox,
    addImageItem,
    handleImageUpload,
    handleDragEnd,
    handleTextChange,
    toggleFormat,
    changeFontSize,
    changeItemColor,
    deleteSelected,
    handleTransformEnd,
    loadLayoutFromSelected,
    cellWidth,
    cellHeight,
  };
};

export default useWorkbench;
