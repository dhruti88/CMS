import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { saveAs } from "file-saver";
import { SERVER_URL } from '../Urls';
import axios from "axios";
import { useParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import useYjsManager from './useYjsManager';


const useWorkbench = () => {
  // Constants
  const defaultTitle = "default";
  // Stage dimensions (minus toolbox width)
  const cellWidth = 100;
  const cellHeight = 50;

  //States
  const [showSetupForm, setShowSetupForm] = useState(true);
  const [layoutTitle, setLayoutTitle] = useState(defaultTitle);
  const [columns, setColumns] = useState(8);
  const [rows, setRows] = useState(12);
  const [gutterWidth, setGutterWidth] = useState(10);
  const [userID, setUserID] = useState("60d21b4667d0d8992e610c85");
  const token = localStorage.getItem("token");
  const [userProfilePic, setUserProfilePic] = useState("");
  const [CurrentLayout, setCurrentLayout] = useState("");
  const [isDeleting, setIsDeleting] = useState(null);
  const [sections, setSections] = useState([]);
  const [sectionId, setSectionId] = useState('');
  const [city, setCity] = useState("Pune");
  const [dueDate, setDueDate] = useState(() => {
    const today = new Date().toISOString().split("T")[0]; return today;
  });
  const [taskStatus, setTaskStatus] = useState("Pending");
  const [layoutType, setLayoutType] = useState("Page");
  const [hideGrid, setHideGrid] = useState(false);          // State to control grid visibility
  const [hideBackground, setHideBackground] = useState(false);  // State to control background visibility
  const [positionDisplay, setPositionDisplay] = useState({
    show: false,
    x: 0,
    y: 0,
    gridX: 0,
    gridY: 0,
    isSection: false
  });
  const [selectedId, setSelectedId] = useState(null);
  const [availableLayouts, setAvailableLayouts] = useState([]);
  const [showLayoutList, setShowLayoutList] = useState(false);

  // Zoom and tool state
  const [stageScale, setStageScale] = useState(1);
  const [toolMode, setToolMode] = useState("pointer");
  const [check, setCheck] = useState(false);

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
  const [stageSize, setStageSize] = useState({
    width: columns * cellWidth + (columns - 1) * gutterWidth,
    height: rows * cellHeight,
  });
  const [draggingBox, setDraggingBox] = useState(null);
  const [dragPreviewPosition, setDragPreviewPosition] = useState(null);
  const [dragStatus, setDragStatus] = useState(null);
  const [snapLines, setSnapLines] = useState([]);


  // Fetch user info from the backend
  const fetchUser = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserID(response.data.uid); // Set the user data
      setUserProfilePic(response.data.photoURL);
      console.log("User photoURL:", response.data.photoURL);
      console.log("User UID:", response.data.uid);
      localStorage.setItem('userId', response.data.uid);
      console.log("User data fetched:", response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleDeleteLayout = async (layout) => {
    const confirmReload = window.confirm("Are you sure you want to delete the layout?");
    if (!confirmReload) return; // Exit if the user cancels

    try {
      setIsDeleting(layout._id);

      // Assuming you have a way to get the current user's ID
      const userId = localStorage.getItem('userId'); // Adjust this based on your auth method

      const response = await fetch(`${SERVER_URL}/api/layout?_id=${encodeURIComponent(layout._id)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      console.log(result);
      if (result.success) {
        // Refresh the layouts list
        fetchAvailableLayouts();
        // Optionally, you can add a toast or alert here
        alert(`Layout "${layout.title}" deleted successfully`);
      } else {
        alert('Failed to delete layout');
      }
    } catch (error) {
      console.error('Error deleting layout:', error);
      alert('An error occurred while deleting the layout');
    } finally {
      setIsDeleting(null);
    }
  };

  useEffect(() => {
    if (token) {
      console.log("token--", token);
      fetchUser();
    } else {
      console.error("No token found. Please sign in.");
    }
  }, [token]);


  const [layoutid, setlayoutid] = useState(null);
  //call useYjsManager 
  const {
    activeEditors,
    activeUsersCount,
    updateSectionsAndSync,
    syncToYjs,
    isLocalUpdate,
    userId,
  } = useYjsManager({
    layoutid,
    cellWidth,
    cellHeight,
    gutterWidth,
    userID,
    userProfilePic,
    setSections
  });

  //----------------------------------------------------------

  // Add new section to Yjs array
  const addSection = (size) => {
    return {
      id: "section-" + Date.now(),
      type: "section",
      sectionType: "section",
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
      borderStyle: {
        left: false,
        right: false,
        top: false,
        bottom: false,
      },
      borderColor: colors.grays[2],      // default border color
      borderWidth: 2,                    // default border width
    }
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


  const handleImageUpload = (sectionId, e) => {
    console.log("image : -", e);
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        const defaultSize = { cols: 2, rows: 2, label: '2×2' };
        const imageItem = addImageItem(defaultSize);
        imageItem.src = base64data; // Set uploaded image source

        // Create new sections array with updated section
        const updatedSections = sections.map(section => {
          if (section.id !== sectionId) return section;

          // Check available space before adding the image
          const bestPosition = findBestPositionForItem(imageItem, section.items, section.sizeInfo);
          if (!bestPosition) {
            alert("No space available in section!");
            return section;
          }

          // Assign correct position before adding the image
          imageItem.gridX = bestPosition.gridX;
          imageItem.gridY = bestPosition.gridY;
          imageItem.x = imageItem.gridX * (cellWidth + gutterWidth);
          imageItem.y = imageItem.gridY * cellHeight;

          return {
            ...section,
            items: [...section.items, imageItem]
          };
        });

        // Update sections and sync with Yjs in one go
        updateSectionsAndSync(updatedSections);
        setSelectedId(imageItem.id);
      };

      reader.readAsDataURL(file);
    }
  };



  const addItemToSection = (sectionId, size, type, e = null) => {
    let newItem;

    if (type === "text") {
      newItem = addTextBox(size);
    } else {
      newItem = addImageItem(size);
    }

    // Create updated sections array
    const updatedSections = sections.map(section => {
      if (section.id !== sectionId) return section; // Skip if not the target section

      const bestPosition = findBestPositionForItem(newItem, section.items, section.sizeInfo);

      if (!bestPosition) {
        alert('No space available in section!');
        return section;
      }

      // Assign position
      newItem = {
        ...newItem,
        gridX: bestPosition.gridX,
        gridY: bestPosition.gridY,
        x: bestPosition.gridX * (cellWidth + gutterWidth),
        y: bestPosition.gridY * cellHeight,
      };

      return {
        ...section,
        items: [...section.items, newItem]
      };
    });

    // Update sections and sync with Yjs in one go
    updateSectionsAndSync(updatedSections);
    setSelectedId(newItem.id);
  };

  const addNewSection = (size) => {
    const newSection = addSection(size);

    const position = findBestPositionForBox(newSection, sections, columns, rows);
    if (!position) {
      alert('No space available for new section');
      return;
    }

    // Calculate position
    newSection.gridX = position.gridX;
    newSection.gridY = position.gridY;
    newSection.x = newSection.gridX * cellWidth + (newSection.gridX) * gutterWidth;
    newSection.y = newSection.gridY * cellHeight;

    // Create updated sections array with new section
    const updatedSections = [...sections, newSection];

    // Update sections and sync with Yjs in one go
    updateSectionsAndSync(updatedSections);
    setSelectedId(newSection.id);
    setSectionId(newSection.id);
  };

  useEffect(() => {
    console.log("laytoutid : -- ", layoutid);
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



  // Stage reference for Konva
  const stageRef = useRef(null);
  const transformerRef = useRef(null);


  useEffect(() => {
    setStageSize({
      width: columns * cellWidth + (columns - 1) * gutterWidth,
      height: rows * cellHeight,
    });
  }, [columns, rows, gutterWidth, cellWidth, cellHeight]);





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
  const {layoutid: layoutID} = useParams();
  // Layout endpoints
  const saveLayout = async ({ e = 1 }) => {
    console.log(taskStatus);

    try {
      // 1. Convert canvas to Base64
      const stage = stageRef.current;
      console.log("stage ", stage);

      // Initialize as let instead of const so we can reassign it
      let dataURL = null;

      if (stage) {
        try {
          // Try to get dataURL with proper CORS settings
          dataURL = stage.toDataURL({
            pixelRatio: 2,
            // Add these options to help with CORS issues
            mimeType: 'image/png',
            quality: 0.8
          });
        } catch (canvasError) {
          console.warn("Failed to export canvas: ", canvasError);
          // Continue without the image data if we can't get it
          dataURL = null;
        }
      }

      // const {layoutid} = useParams();
      // const layoutID = layoutid;
      const layoutData = {
        userId,
        title: layoutTitle,
        sections,
        gridSettings: { columns, rows, gutterWidth },
        layouttype: layoutType,
        city,
        duedate: dueDate,
        status: taskStatus,
        stageImage: dataURL, // base64 image
        layoutID: e === 0 ? null : layoutID,
      };

      const response = await fetch(`${SERVER_URL}/api/layout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(layoutData),
      });

      const data = await response.json();
      console.log('Layout saved successfully', data);
      if (!e) {
        console.log(data.layout._id);
        localStorage.setItem('layoutid', data.layout._id);

        return data;
      }
    } catch (error) {
      console.error('Error saving layout:', error);
    }
  };


  const fetchAvailableLayouts = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/layouts`,
        { headers: { 'Authorization': `Bearer ${token}` } },
      );
      console.log("response : -", response);
      if (response.ok) {
        console.log("Hii", response);
        const data = await response.json();
        // console.log("data : - ",data.layouts, "city : - ",city);
        setAvailableLayouts(data.layouts);
        setShowLayoutList(true);
      } else {
        console.log("No layouts found.");
      }
    } catch (error) {
      console.error("Error fetching layouts:", error);
    }
  };

  const fetchAvailableSections = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/layouts?userId=${userId}`,
        { headers: { 'Authorization': `Bearer ${token}` } },
      );
      if (response.ok) {
        console.log("Hii2", response);
        const data = await response.json();
        setAvailableLayouts(data.layouts);
        // setShowLayoutList(true);
      } else {
        console.log("No layouts found.");
      }
    } catch (error) {
      console.error("Error fetching layouts:", error);
    }
  };


  const addTextBox = (size) => {
    return {
      id: 'text-' + Date.now(),
      type: 'text',
      x: 0,
      y: 0 - 10,
      width: size.cols * cellWidth + (size.cols - 1) * gutterWidth,
      height: size.rows * cellHeight,
      text: 'Add your text here',
      fontSize: 16,
      fontStyle: '',
      fontFamily: textFormatting.fontFamily,
      textDecoration: '',
      fill: colors.grays[0],
      align: 'left',
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


  const loadLayoutFromSelected = (layout) => {
    console.log("rendering layout");

    if (layout.gridSettings && layout.gridSettings.gutterWidth !== undefined) {
      setColumns(layout.gridSettings.columns);
      setRows(layout.gridSettings.rows);
      setGutterWidth(layout.gridSettings.gutterWidth);
    }

    const recalculatedSections = layout.sections.map((section) => ({
      ...section,
      x: section.gridX * cellWidth + section.gridX * layout.gridSettings.gutterWidth,
      y: section.gridY * cellHeight
    }));

    // Update sections and sync with Yjs in one go
    updateSectionsAndSync(recalculatedSections);
    localStorage.setItem('layoutid', layout._id);
    setLayoutTitle(layout.title);
    setShowLayoutList(false);
    setShowSetupForm(false);

    // Using functional updates to ensure correct state update
    setCity(() => layout.city);
    setDueDate(() => layout.publishingdate);
    setLayoutType(() => layout.layouttype);

    console.log("Loaded layout:", layout);


  };


  // Text change handler with proper sync
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setTextValue(newText);

    if (selectedId) {
      const updatedSections = updateSections(selectedId, sections, item => ({
        ...item,
        text: newText
      }));
      updateSectionsAndSync(updatedSections);
    }
  };

  // Toggle format with proper sync
  const toggleFormat = (format) => {
    if (format === 'align') {
      const alignments = ['left', 'center', 'right', 'justify'];
      const currentIndex = alignments.indexOf(textFormatting.align);
      const nextIndex = (currentIndex + 1) % alignments.length;

      setTextFormatting(prev => ({ ...prev, align: alignments[nextIndex] }));

      if (selectedId) {
        const updatedSections = updateSections(selectedId, sections, item => ({
          ...item,
          align: alignments[nextIndex]
        }));
        updateSectionsAndSync(updatedSections);
      }
      return;
    }

    setTextFormatting(prev => {
      const updated = { ...prev, [format]: !prev[format] };

      if (selectedId) {
        const updatedSections = updateSections(selectedId, sections, item => {
          const fontStyle = [
            updated.bold ? 'bold' : '',
            updated.italic ? 'italic' : ''
          ].join(' ').trim();

          const textDecoration = updated.underline ? 'underline' : '';
          return { ...item, fontStyle, textDecoration };
        });
        updateSectionsAndSync(updatedSections);
      }

      return updated;
    });
  };

  // Change font family with proper sync
  const changeFontFamily = (newFont) => {
    setTextFormatting(prev => {
      const updated = { ...prev, fontFamily: newFont };

      if (selectedId) {
        const updatedSections = updateSections(selectedId, sections, item => ({
          ...item,
          fontFamily: newFont
        }));
        updateSectionsAndSync(updatedSections);
      }

      return updated;
    });
  };

  // Change font size with proper sync
  const changeFontSize = (change) => {
    setTextFormatting(prev => {
      const newSize = Math.max(8, Math.min(72, prev.fontSize + change));
      const updated = { ...prev, fontSize: newSize };

      if (selectedId) {
        const updatedSections = updateSections(selectedId, sections, item => ({
          ...item,
          fontSize: newSize
        }));
        updateSectionsAndSync(updatedSections);
      }

      return updated;
    });
  };

  // Change color with proper sync
  const changeItemColor = (color) => {
    if (selectedId) {
      const updatedSections = updateSections(selectedId, sections, item => ({
        ...item,
        fill: color
      }));
      updateSectionsAndSync(updatedSections);
    }
  };

  // Delete selected with proper sync
  const deleteSelected = () => {
    if (!selectedId) return;

    const updatedSections = sections
      .map(section => {
        if (section.id === selectedId) return null;
        return {
          ...section,
          items: section.items.filter(item => item.id !== selectedId)
        };
      })
      .filter(Boolean);

    updateSectionsAndSync(updatedSections);
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
      console.log("stage : -", stage);
      const dataURL = stage.toDataURL();
      console.log("dataURL : -", dataURL);
      const blob = dataURLToBlob(dataURL);
      const formData = new FormData();
      formData.append("image", blob, "canvas-image.png");
      fetch(`${SERVER_URL}/upload`, {
        method: "POST",
        body: formData,
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(response => response.json())
        .then(data => console.log("Upload successful:", data))
        .catch(error => console.error("Error uploading:", error));
    }
  };

  const exportToCMYKPDF = async () => {
    const stage = stageRef.current;
    console.log(stage);
    const dataURL = stage.toDataURL({ pixelRatio: 3 }); // High-resolution

    const response = await fetch(dataURL);
    const imageBlob = await response.blob();
    const formData = new FormData();
    formData.append("image", imageBlob, "konva_image.png");

    try {
      const res = await fetch(`${SERVER_URL}/api/pdf/convert-cmyk`, {
        method: "POST",
        body: formData,
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to generate PDF");

      const blob = await res.blob();
      saveAs(blob, "CMYK_Newspaper_Export.pdf");
    } catch (error) {
      console.error("PDF conversion failed:", error);
    }
  };

  //Zoom handlers
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

  const fitStageToScreen = () => {
    if (!stageRef.current) return;

    const stage = stageRef.current;

    // Reset scale
    setStageScale(1);
    stage.scale({ x: 1, y: 1 });

    // Reset position
    stage.position({ x: 0, y: 0 });

    // Redraw the stage
    stage.batchDraw();
  };

  const handleTransformEndHelper = (node, cellWidth, gutterWidth, cellHeight, stageSize) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const newWidth = node.width() * scaleX;
    const newHeight = node.height() * scaleY;
    const totalCellWidth = cellWidth + gutterWidth;
    const colSpan = Math.round((newWidth + gutterWidth) / totalCellWidth);
    const snappedWidth = colSpan * cellWidth + (colSpan - 1) * gutterWidth;
    const rowSpan = Math.round(newHeight / cellHeight);
    const snappedHeight = rowSpan * cellHeight;
    return { snappedWidth, snappedHeight, colSpan, rowSpan };
  };

  const handleTransformEnd = (e) => {
    console.log("Transform end");
    const node = e.target;
    if (!selectedId || !sectionId) return;

    const section = sections.find(sec => sec.id === sectionId);
    if (!section) return;

    const { snappedWidth, snappedHeight, colSpan, rowSpan } = handleTransformEndHelper(
      node,
      cellWidth,
      gutterWidth,
      cellHeight,
      stageSize
    );

    // Compute new gridX, gridY inside section
    const newGridX = Math.round((node.x()) / (cellWidth + gutterWidth));
    const newGridY = Math.round((node.y()) / cellHeight);

    // Ensure grid position doesn't exceed section boundaries
    const maxGridX = (section.width - snappedWidth) / (cellWidth + gutterWidth);
    const maxGridY = (section.height - snappedHeight) / cellHeight;

    // Create updated sections array
    const updatedSections = sections.map(sec =>
      sec.id === sectionId
        ? {
          ...sec,
          items: sec.items.map(item =>
            item.id === selectedId
              ? {
                ...item,
                width: snappedWidth,
                height: snappedHeight,
                gridX: Math.max(0, Math.min(maxGridX, newGridX)),
                gridY: Math.max(0, Math.min(maxGridY, newGridY)),
                sizeInfo: { cols: colSpan, rows: rowSpan },
              }
              : item
          ),
        }
        : sec
    );

    // Update sections and sync with Yjs in one go
    // updateSectionsAndSync(updatedSections);
    setTimeout(() => {
      updateSectionsAndSync(updatedSections);
    }, 0);
    // Reset transformation
    node.scaleX(1);
    node.scaleY(1);
  };

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
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedId &&
        (layoutType === "Page" || selectedId !== sectionId) &&
        document.activeElement === document.body
      ) {
        deleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, layoutType, sectionId]);


  useEffect(() => {
    console.log("s-", stageRef);

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
    console.log("size : -", item.sizeInfo);
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

  const addPredefinedItem = (size, type) => {
    // Create new item based on type
    let newItem;
    if (type === "box") {
      newItem = addBox(size);
    } else if (type === "text") {
      newItem = addTextBox(size);
    } else {
      newItem = addImageItem(size);
    }

    // Find best position for the new item
    const position = findBestPositionForBox(newItem, sections, columns, rows);
    if (!position) {
      alert('No space available for new item');
      return;
    }

    // Calculate grid position and coordinates
    newItem.gridX = position.gridX;
    newItem.gridY = position.gridY;
    newItem.x = newItem.gridX * cellWidth + (newItem.gridX) * gutterWidth;
    newItem.y = newItem.gridY * cellHeight;

    // Create updated sections array with new item
    const updatedSections = [...sections, newItem];

    // Update sections and sync with Yjs in one go
    updateSectionsAndSync(updatedSections);
    setSelectedId(newItem.id);
  };

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

  // Reset item position if movement is invalid
  const resetItemPosition = (e, id, currentItem) => {
    if (!e || !e.target) {
      alert("Error: Dragging operation failed."); // Alert if event is missing
      return;
    }

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

  const handleItemDragEnd = (e, itemId, sectionId) => {
    setSnapLines([]); // Clear snap lines

    // Create updated sections array
    const updatedSections = sections.map(section => {
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
      const repositionResult = repositionItemsInSection(
        currentItem,
        { gridX: newGridX, gridY: newGridY },
        section
      );

      if (repositionResult.success) {
        return {
          ...section,
          items: section.items.map(item =>
            repositionResult.newPositions[item.id]
              ? {
                ...item,
                gridX: repositionResult.newPositions[item.id].gridX,
                gridY: repositionResult.newPositions[item.id].gridY,
                x: repositionResult.newPositions[item.id].gridX * (cellWidth + gutterWidth),
                y: repositionResult.newPositions[item.id].gridY * cellHeight
              }
              : item
          )
        };
      } else {
        alert("Cannot move item: No available space.");
        resetItemPosition(e, itemId, currentItem);
        return section;
      }
    });

    // Update sections and sync with Yjs in one go
    updateSectionsAndSync(updatedSections);
    console.log("Item drag end update applied for:", itemId);

    resetDragState();
  };

  const handleItemDragMove = (e, itemId, sectionId) => {
    if (!draggingBox) return;

    const shape = e.target;
    const section = sections.find(s => s.id === sectionId);
    const item = section?.items.find(i => i.id === itemId);

    if (!section || !item) return;

    const pixelPosition = { x: shape.x(), y: shape.y() };
    const gridPosition = snapToGrid(pixelPosition);

    const clampedGridX = Math.min(Math.max(0, gridPosition.gridX),
      section.sizeInfo.cols - item.sizeInfo.cols);
    const clampedGridY = Math.min(Math.max(0, gridPosition.gridY),
      section.sizeInfo.rows - item.sizeInfo.rows);
    // Update position display
    setPositionDisplay({
      show: true,
      x: shape.x() + section.x,
      y: shape.y() + section.y,
      gridX: clampedGridX,
      gridY: clampedGridY,
      isSection: false
    });
    // Generate snap lines relative to section
    setSnapLines(generateSnapLines(item, {
      gridX: clampedGridX,
      gridY: clampedGridY
    }, section));

    shape.position({
      x: clampedGridX * (cellWidth + gutterWidth),
      y: clampedGridY * cellHeight
    });

    setDragPreviewPosition({ gridX: clampedGridX, gridY: clampedGridY });
  };

  const snapToGrid = (pixelPosition) => {
    const gridX = Math.round(pixelPosition.x / (cellWidth + gutterWidth));
    const gridY = Math.round(pixelPosition.y / cellHeight);

    return {
      gridX: Math.max(0, gridX),
      gridY: Math.max(0, gridY)
    };
  };
  const generateSnapLines = (item, gridPos, container) => {
    if (!item || !gridPos || !container) return [];

    // Calculate positions
    const leftX = container.x + (gridPos.gridX * (cellWidth + gutterWidth));
    const rightX = leftX + item.width;
    const topY = container.y + (gridPos.gridY * cellHeight);
    const bottomY = topY + item.height;

    // Add center lines
    const centerX = leftX + (item.width / 2);
    const centerY = topY + (item.height / 2);

    // Container boundaries
    const containerLeft = container.x;
    const containerRight = container.x + container.width;
    const containerTop = container.y;
    const containerBottom = container.y + container.height;

    // Create snap lines with different colors for sections vs items
    const isSection = item.type === 'section';
    const primaryColor = isSection ? '#ff6b6b' : '#00ff00';
    const secondaryColor = isSection ? '#ff8787' : '#ff0000';

    const lines = [
      // Edges
      {
        points: [leftX, containerTop, leftX, containerBottom],
        stroke: primaryColor,
        strokeWidth: isSection ? 3 : 2,
        dash: [8, 6],
        opacity: 0.8
      },
      {
        points: [rightX, containerTop, rightX, containerBottom],
        stroke: primaryColor,
        strokeWidth: isSection ? 3 : 2,
        dash: [8, 6],
        opacity: 0.8
      },
      {
        points: [containerLeft, topY, containerRight, topY],
        stroke: primaryColor,
        strokeWidth: isSection ? 3 : 2,
        dash: [8, 6],
        opacity: 0.8
      },
      {
        points: [containerLeft, bottomY, containerRight, bottomY],
        stroke: primaryColor,
        strokeWidth: isSection ? 3 : 2,
        dash: [8, 6],
        opacity: 0.8
      },
      // Center lines
      {
        points: [centerX, containerTop, centerX, containerBottom],
        stroke: secondaryColor,
        strokeWidth: isSection ? 2.5 : 2,
        dash: [6, 6],
        opacity: 0.7
      },
      {
        points: [containerLeft, centerY, containerRight, centerY],
        stroke: secondaryColor,
        strokeWidth: isSection ? 2.5 : 2,
        dash: [6, 6],
        opacity: 0.7
      }
    ];

    // Add grid snap indicators
    const gridLines = Array.from({ length: columns + 1 }, (_, i) => ({
      points: [
        i * (cellWidth + gutterWidth),
        containerTop,
        i * (cellWidth + gutterWidth),
        containerBottom
      ],
      stroke: '#4299e1',
      strokeWidth: 1,
      dash: [4, 4],
      opacity: 0.3
    }));

    return [...lines, ...gridLines];
  };

  const resetDragState = () => {
    setDraggingBox(null);
    setDragPreviewPosition(null);
    setDragStatus(null);
    setPositionDisplay({ show: false, x: 0, y: 0, gridX: 0, gridY: 0, isSection: false });
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

    const currentSection = sections.find(b => b.id === id);
    if (!currentSection) return;

    const canvasSection = {
      x: 0,
      y: 0,
      width: stageSize.width,
      height: stageSize.height
    };

    setSnapLines(generateSnapLines(currentSection, {
      gridX: currentSection.gridX,
      gridY: currentSection.gridY
    }, canvasSection));
  };

  const handleDragMove = (e, id) => {
    if (!draggingBox) return;

    const shape = e.target;
    const currentSection = sections.find(b => b.id === id);

    if (!currentSection) return;

    const pixelPosition = { x: shape.x(), y: shape.y() };
    const gridPosition = snapToGrid(pixelPosition);

    const clampedGridX = Math.min(Math.max(0, gridPosition.gridX),
      columns - currentSection.sizeInfo.cols);
    const clampedGridY = Math.min(Math.max(0, gridPosition.gridY),
      rows - currentSection.sizeInfo.rows);

    // Update position display
    setPositionDisplay({
      show: true,
      x: shape.x(),
      y: shape.y(),
      gridX: clampedGridX,
      gridY: clampedGridY,
      isSection: true
    });


    // Create a parent section context for the whole canvas
    const canvasSection = {
      x: 0,
      y: 0,
      width: stageSize.width,
      height: stageSize.height
    };

    // Generate snap lines with canvas as parent section
    setSnapLines(generateSnapLines(currentSection, {
      gridX: clampedGridX,
      gridY: clampedGridY
    }, canvasSection));

    shape.position({
      x: clampedGridX * (cellWidth + gutterWidth),
      y: clampedGridY * cellHeight
    });

    setDragPreviewPosition({ gridX: clampedGridX, gridY: clampedGridY });
  };

  const handleDragEnd = (e, id) => {
    setSnapLines([]); // Clear snap lines
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

    const repositionResult = repositionBoxes(
      currentBox,
      { gridX: newGridX, gridY: newGridY },
      sections,
      columns,
      rows
    );

    if (repositionResult.success) {
      // Create updated sections array
      const updatedSections = sections.map(box =>
        repositionResult.newPositions[box.id]
          ? {
            ...box,
            gridX: repositionResult.newPositions[box.id].gridX,
            gridY: repositionResult.newPositions[box.id].gridY,
            x: repositionResult.newPositions[box.id].gridX * (cellWidth + gutterWidth),
            y: repositionResult.newPositions[box.id].gridY * cellHeight,
          }
          : box
      );

      // Update sections and sync with Yjs in one go
      updateSectionsAndSync(updatedSections);
    } else {
      alert("Cannot move item: No available space.");
      resetBoxPosition(e, id, currentBox);
    }

    resetDragState();
  };

  const resetBoxPosition = (e, id, currentBox) => {
    if (!e || !e.target) {
      alert("Error: Dragging operation failed."); // Alert if event is missing
      return;
    }

    const stageNode = e.target.getStage();
    const layer = stageNode.findOne('Layer');
    const group = layer.findOne(`#${id}`);

    if (group) {
      group.to({
        x: currentBox.gridX * (cellWidth + gutterWidth),
        y: currentBox.gridY * cellHeight,
        duration: 0.3, //
        easing: Konva.Easings.EaseOut
      });
    }
  };

  //=================================

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLayoutById = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${SERVER_URL}/api/layouts/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Layout not found');
      }

      const layout = await response.json();
      if (layout) {
        console.log("fetched layout successfully", layout);
        loadLayoutFromSelected(layout);
      }
      // Use the existing loadLayoutFromSelected function from context
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching layout:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const LoadingState = () => (
    <div className="loading-container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <CircularProgress />
      <Typography variant="h6" style={{ marginLeft: '1rem' }}>
        Loading layout...
      </Typography>
    </div>
  );

  const ErrorState = ({ error }) => (
    <div className="error-container" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <Typography variant="h5" color="error" gutterBottom>
        Error Loading Layout
      </Typography>
      <Typography variant="body1">
        {error}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => window.history.back()}
        style={{ marginTop: '1rem' }}
      >
        Go Back
      </Button>
    </div>
  );

  if (isLoading) {
    LoadingState();
  }

  if (error) {
    ErrorState(error);
  }

  useEffect(() => {
    if (layoutid) {
      fetchLayoutById();
    }
  }, [layoutid]);

  // const { layoutid: x } = useParams();

  // useEffect(() => {
  //   console.log("layoutid : check11", x);
  //   if (!check && window.location.pathname === `/page/${layoutid}`) {
  //     setCheck(true);
  //     console.log("layoutid : check", x);
  //     fetchLayoutById();
  //   }
  // }, [check, x]);

  //=================================
  return {
    userId,
    showSetupForm,
    setShowSetupForm,
    layoutTitle,
    setSections,
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
    saveLayout,
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
    addPredefinedItem,
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
    exportToCMYKPDF,
    fitStageToScreen,
    fetchAvailableSections,
    city,
    setCity,
    dueDate,
    setDueDate,
    taskStatus,
    setTaskStatus,
    layoutType,
    setLayoutType,
    setHideGrid,
    setHideBackground,
    hideGrid,
    hideBackground,
    changeFontFamily,
    handleDeleteLayout,
    isDeleting,
    snapLines,
    userID,
    setUserID,
    userProfilePic,
    activeEditors,
    positionDisplay,
    activeUsersCount,
    fetchLayoutById,
    LoadingState,
    CurrentLayout,
    setCurrentLayout,
    layoutid,
    setlayoutid,
    updateSectionsAndSync,
  };
};

export default useWorkbench;