import React,{ useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import SetupModal from '../organisms/SetupModal';
import WorkbenchActions from '../organisms/WorkbenchActions';
import WorkbenchCanvas from '../organisms/WorkbenchCanvas';
import Toolbox from '../organisms/Toolbox';
import { WorkbenchContext } from '../../context/WorkbenchContext';
import { useContext,useState } from 'react';
import NestedSectionsPanel from '../organisms/NestedSectionsPanel';
import SectionReplacementPanel from '../organisms/SectionReplacementPanel';
import CustomButton from '../atoms/button/CustomButton';
import Navbar from '../atoms/navbar/NavBar';
import { Modal ,Box } from '@mui/material';
import LoadLayoutAndSection from '../organisms/LoadLayoutAndSection';

// import { useEffect } from 'react';
// Add these imports at the top of your file
import { CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';





// Add styled component for the container
const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  background: theme.palette.background.default,
}));
const LoadingBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 3,
  padding: 4,
  borderRadius: 2,
  backgroundColor: 'background.paper',
  boxShadow: theme.shadows[3]
}));


// Loading component
const LoadingState2 = () => (
  // console.log("LoadingState2",showSetupForm),
  <LoadingContainer>
    <LoadingBox>
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h5" sx={{ fontWeight: 500 }}>
        Loading layout...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Please wait while we prepare your workspace
      </Typography>
    </LoadingBox>
  </LoadingContainer>
);



const WorkbenchTemplate = () => {
  const navigate = useNavigate(); // Initialize navigate function
  const workbenchProps = useContext(WorkbenchContext);
  const {
    showSetupForm,
    layoutTitle,
    setLayoutTitle,
    columns,
    setColumns,
    rows,
    setRows,
    gutterWidth,
    setGutterWidth,
    setShowSetupForm,
    stageSize,
    stageScale,
    toolMode,
    setToolMode,
    uploadCanvasImage,
    saveLayout,
    fetchAvailableLayouts,
    zoomBy,
    stageRef,
    items,
    selectedId,
    setSelectedId,
    handleDragEnd,
    transformerRef,
    cellWidth,
    cellHeight,
    textFormatting,
    setTextValue,
    setItems,
    handleTransformEnd,
    itemSizes,
    addBox,
    addTextBox,
    addImageItem,
    handleImageUpload,
    changeItemColor,
    deleteSelected,
    toggleFormat,
    changeFontSize,
    handleTextChange,
    textValue,
    setTextFormatting,
    colors,
    availableLayouts,
    loadLayoutFromSelected,
    showLayoutList,
    setShowLayoutList,
    handleWheel,
    addPredefineditem,
    handleDragStart,
    handleDragMove,
    addNewSection,
    addItemToSection,
    sectionId,
    setSectionId,
    sections,
    handleItemDragEnd,
    handleItemDragStart,
    handleItemDragMove,
    setSections,
    exportToCMYKPDF,
    fitStageToScreen,
    // fetchAvailableLayouts,
    fetchAvailableSections,
    // openReplacementPanel,
    city,
    setCity,
    dueDate,
    setDueDate,
    taskStatus,
    setTaskStatus,
    layoutType,
    setLayoutType,
    setHideGrid,        // New state function to hide grid
    setHideBackground,  // New state function to hide background
    hideGrid,       // New prop to control grid visibility
    hideBackground, // New prop to control background visibility
    changeFontFamily,
    handleDeleteLayout,
    isDeleting,
    snapLines,
    userID,
    userProfilePic,
    activeEditors,
    positionDisplay,
    LoadingState,
    // showSetupForm
    // setuserID,
  } = workbenchProps;
// Inside WorkbenchTemplate component (before the return)


useEffect(() => {
  if(!showSetupForm && localStorage.getItem('layoutid')){ {
    // Fetch available layouts when the setup form is shown
    // fetchAvailableLayouts();
    console.log("sf",showSetupForm);
    const layoutid =  localStorage.getItem('layoutid');
  
    setTimeout(()=> navigate(`/page/${layoutid}`),1000);

  }
}});
// useEffect(() => {
//   let timeoutId;
  
//   if (!showSetupForm) {
//     const layoutId = localStorage.getItem('layoutid');
//     if (layoutId) {
//       timeoutId = setTimeout(() => navigate(`/page/${layoutId}`), 1000);
//     }
//   }

//   return () => {
//     if (timeoutId) {
//       clearTimeout(timeoutId);
//     }
//   };
// }, [showSetupForm, navigate]);


// Correctly implement handleReplaceSection
// const handleReplaceSection = (selectedSection) => {
//   // Find the target section in the current sections array
//   const targetSection = sections.find(sec => sec.id === targetSectionIdForReplacement);

//   if (!targetSection || !selectedSection) {
//     console.warn("Invalid section replacement");
//     setShowReplacementPanel(false);
//     return;
//   }

//   // Create the new section, preserving position and size of the target section
//   const newSection = {
//     ...selectedSection,        // Take all data from the selected section
//     id: targetSection.id,       // Preserve the target section's ID
//     x: targetSection.x,         // Use the current layout's section position
//     y: targetSection.y,
//     width: targetSection.width, // And size
//     height: targetSection.height,
//     // Add any additional logic for merging or transforming section data
//   };

//   // // Update sections using the setSections function
//   // setSections(prevSections => 
//   //   prevSections.map(sec => 
//   //     sec.id === targetSectionIdForReplacement ? newSection : sec
//   //   )
//   const ReplaceSection = 
//     {
//       ...selectedSection,  
      
//     };
//     ReplaceSection.x= targetSection.x;         // Use the current layout's section position
//     ReplaceSection.y=  targetSection.y;
//     ReplaceSection.gridX= targetSection.gridX;         // Use the current layout's section position
//     ReplaceSection.gridY=  targetSection.gridY;
//     ReplaceSection.id= targetSection.id
//     // ReplaceSection.width=  targetSection.width; // And size
//     // ReplaceSection.height=  targetSection.height;
//   // );
//   // const new's=ReplaceSection();
//   console.log("Selected",selectedSection);
//   deleteSelected();
//   // layout.sections.append(ReplaceSection);
//   // setSections(prev => prev.map(ReplaceSection));
//   setSections(prevSections => 
//     prevSections.map(section => 
//       section.id === targetSection.id ? ReplaceSection : section
//     )
//   );
  
  
//   setSelectedId(ReplaceSection.id);
//   // const ma = addSection();
// console.log("Replce",ReplaceSection);



//   // Close the replacement panel
//   setShowReplacementPanel(false);
// // onClose();
//   // Optionally update the selected section
//   // setSelectedId(newSection.id);
// };


// const navigate= useNavigate();
  return (
    <div className="cms-container">
      {showSetupForm ? (
        <SetupModal
          layoutTitle={layoutTitle}
          setLayoutTitle={setLayoutTitle}
          columns={columns}
          setColumns={setColumns}
          rows={rows}
          setRows={setRows}
          gutterWidth={gutterWidth}
          setGutterWidth={setGutterWidth}
          showSetupForm={showSetupForm}
          setShowSetupForm={setShowSetupForm}
          city={city}
          setCity={setCity}
          dueDate={dueDate}
          setDueDate={setDueDate}
          layoutType={layoutType}
          setLayoutType={setLayoutType}
          saveLayout={saveLayout}
        />
      ) : (
        <div>
          {LoadingState2()}
        </div>
      )}
    </div>
  );
};

export default WorkbenchTemplate;




// import React, { useContext, useState } from 'react';
// import SetupModal from '../organisms/SetupModal';
// import WorkbenchActions from '../organisms/WorkbenchActions';
// import WorkbenchCanvas from '../organisms/WorkbenchCanvas';
// import Toolbox from '../organisms/Toolbox';
// import { WorkbenchContext } from '../../context/WorkbenchContext';
// import NestedSectionsPanel from '../organisms/NestedSectionsPanel';
// import Button from '../atoms/Button';

// const WorkbenchTemplate = () => {
//   const workbenchProps = useContext(WorkbenchContext);
//   const {
//     showSetupForm,
//     layoutTitle,
//     setLayoutTitle,
//     columns,
//     setColumns,
//     rows,
//     setRows,
//     gutterWidth,
//     setGutterWidth,
//     setShowSetupForm,
//     stageSize,
//     stageScale,
//     toolMode,
//     setToolMode,
//     uploadCanvasImage,
//     saveLayout,
//     fetchAvailableLayouts,
//     zoomBy,
//     stageRef,
//     items,
//     selectedId,
//     setSelectedId,
//     handleDragEnd,
//     transformerRef,
//     cellWidth,
//     cellHeight,
//     textFormatting,
//     setTextValue,
//     setItems,
//     handleTransformEnd,
//     itemSizes,
//     addBox,
//     addTextBox,
//     addImageItem,
//     handleImageUpload,
//     changeItemColor,
//     deleteSelected,
//     toggleFormat,
//     changeFontSize,
//     handleTextChange,
//     textValue,
//     setTextFormatting,
//     colors,
//     availableLayouts,
//     loadLayoutFromSelected,
//     showLayoutList,
//     setShowLayoutList,
//     handleWheel,
//     addPredefineditem,
//     handleDragStart,
//     handleDragMove,
//     addNewSection,
//     addItemToSection,
//     sectionId,
//     setSectionId,
//     sections,
//     handleItemDragEnd,
//     handleItemDragStart,
//     handleItemDragMove,
//     setSections,
//     exportToCMYKPDF,
//   } = workbenchProps;

//   // New state for nested section integration
//   const [showNestedPanel, setShowNestedPanel] = useState(false);
//   const [targetSectionId, setTargetSectionId] = useState(null);
//   const [nestedAvailableLayouts, setNestedAvailableLayouts] = useState([]);

//   // A simple collision-handling routine for nested sections.
//   // This is a placeholder—adjust as needed for your grid and rules.
//   const adjustNestedSectionPositions = (nestedSections, targetSection) => {
//     const placed = [];
//     return nestedSections.map(ns => {
//       let newNs = { ...ns }; // assume ns has gridX, gridY and sizeInfo (cols, rows)
//       let collision = placed.some(placedItem =>
//         (newNs.gridX < placedItem.gridX + placedItem.sizeInfo.cols &&
//          newNs.gridX + newNs.sizeInfo.cols > placedItem.gridX &&
//          newNs.gridY < placedItem.gridY + placedItem.sizeInfo.rows &&
//          newNs.gridY + newNs.sizeInfo.rows > placedItem.gridY)
//       );
//       // Shift right until no collision (this is very basic logic)
//       while (collision) {
//         newNs.gridX = newNs.gridX + 1;
//         collision = placed.some(placedItem =>
//           (newNs.gridX < placedItem.gridX + placedItem.sizeInfo.cols &&
//            newNs.gridX + newNs.sizeInfo.cols > placedItem.gridX &&
//            newNs.gridY < placedItem.gridY + placedItem.sizeInfo.rows &&
//            newNs.gridY + newNs.sizeInfo.rows > placedItem.gridY)
//         );
//       }
//       placed.push(newNs);
//       return newNs;
//     });
//   };

//   // Callback to insert nested sections into a target section.
//   // Collision handling is applied before merging.
//   const handleInsertNestedSections = (nestedSections) => {
//     setSections(prevSections =>
//       prevSections.map(section => {
//         if (section.id === targetSectionId) {
//           // Adjust nested section positions relative to the target section.
//           const adjustedNestedSections = adjustNestedSectionPositions(nestedSections, section);
//           return {
//             ...section,
//             nestedSections: section.nestedSections
//               ? [...section.nestedSections, ...adjustedNestedSections]
//               : adjustedNestedSections,
//           };
//         }
//         return section;
//       })
//     );
//   };

//   // Function to open the NestedSectionsPanel.
//   // For demonstration, we pick the first section as the target.
//   const openNestedPanel = () => {
//     if (sections && sections.length > 0) {
//       setTargetSectionId(sections[0].id);
//       // In a real scenario, you would fetch available layouts from your API.
//       setNestedAvailableLayouts(availableLayouts);
//       setShowNestedPanel(true);
//     }
//   };

//   return (
//     <div className="cms-container">
//       {showSetupForm ? (
//         <SetupModal
//           layoutTitle={layoutTitle}
//           setLayoutTitle={setLayoutTitle}
//           columns={columns}
//           setColumns={setColumns}
//           rows={rows}
//           setRows={setRows}
//           gutterWidth={gutterWidth}
//           setGutterWidth={setGutterWidth}
//           setShowSetupForm={setShowSetupForm}
//         />
//       ) : (
//         <>
//           <div className="workbench-container">
//             <WorkbenchActions
//               uploadCanvasImage={uploadCanvasImage}
//               saveLayout={saveLayout}
//               fetchAvailableLayouts={fetchAvailableLayouts}
//               toolMode={toolMode}
//               setToolMode={setToolMode}
//               zoomBy={zoomBy}
//               layoutTitle={layoutTitle}
//               showLayoutList={showLayoutList}
//               setShowLayoutList={setShowLayoutList}
//               availableLayouts={availableLayouts}
//               loadLayoutFromSelected={loadLayoutFromSelected}
//               exportToCMYKPDF={exportToCMYKPDF}
//               stageRef={stageRef}
//             />
//             <WorkbenchCanvas
//               stageSize={stageSize}
//               stageScale={stageScale}
//               toolMode={toolMode}
//               handleWheel={handleWheel}
//               stageRef={stageRef}
//               items={items}
//               selectedId={selectedId}
//               setSelectedId={setSelectedId}
//               handleDragEnd={handleDragEnd}
//               cellWidth={cellWidth}
//               cellHeight={cellHeight}
//               gutterWidth={gutterWidth}
//               transformerRef={transformerRef}
//               setItems={setItems}
//               handleItemDragStart={handleItemDragStart}
//               handleItemDragMove={handleItemDragMove}
//               handleItemDragEnd={handleItemDragEnd}
//               handleDragStart={handleDragStart}
//               handleDragMove={handleDragMove}
//               setSectionId={setSectionId}
//               sections={sections}
//               setSections={setSections}
//               columns={columns}
//               rows={rows}
//             />
//           </div>
//           <Toolbox
//             itemSizes={itemSizes}
//             addBox={addBox}
//             addTextBox={addTextBox}
//             addImageItem={addImageItem}
//             handleImageUpload={handleImageUpload}
//             selectedId={selectedId}
//             items={items}
//             changeItemColor={changeItemColor}
//             deleteSelected={deleteSelected}
//             textFormatting={textFormatting}
//             toggleFormat={toggleFormat}
//             changeFontSize={changeFontSize}
//             handleTextChange={handleTextChange}
//             textValue={textValue}
//             setTextFormatting={setTextFormatting}
//             colors={colors}
//             gutterWidth={gutterWidth}
//             setGutterWidth={setGutterWidth}
//             availableLayouts={availableLayouts}
//             loadLayoutFromSelected={loadLayoutFromSelected}
//             showLayoutList={showLayoutList}
//             setShowLayoutList={setShowLayoutList}
//             cellWidth={cellWidth}
//             cellHeight={cellHeight}
//             addPredefineditem={addPredefineditem}
//             addNewSection={addNewSection}
//             sectionId={sectionId}
//             addItemToSection={addItemToSection}
//             sections={sections}
//             setSections={setSections}
//           />
//           {/* New Insert Nested Sections button in the toolbar at the bottom */}
//           <div className="toolbar-bottom">
//             <Button onClick={openNestedPanel}>Insert Nested Sections</Button>
//           </div>
//         </>
//       )}
//       {showNestedPanel && (
//         <NestedSectionsPanel
//           availableLayouts={nestedAvailableLayouts}
//           targetSectionId={targetSectionId}
//           onInsertNestedSections={handleInsertNestedSections}
//           onClose={() => setShowNestedPanel(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default WorkbenchTemplate;
