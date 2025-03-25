import React from 'react';
import SetupModal from '../organisms/SetupModal';
import WorkbenchActions from '../organisms/WorkbenchActions';
import WorkbenchCanvas from '../organisms/WorkbenchCanvas';
import Toolbox from '../organisms/Toolbox';
import { WorkbenchContext } from '../../context/WorkbenchContext';
import { useContext } from 'react';
import NestedSectionsPanel from '../organisms/NestedSectionsPanel';



const WorkbenchTemplate = () => {
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
    city,
    setCity,
    dueDate,
    setDueDate,
    taskStatus,
    setTaskStatus,
    layoutType,
    setLayoutType,
  } = workbenchProps;

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
          setShowSetupForm={setShowSetupForm}
          city={city}
          setCity={setCity}
          dueDate={dueDate}
          setDueDate={setDueDate}
          taskStatus={taskStatus}
          setTaskStatus={setTaskStatus}
          layoutType={layoutType}
          setLayoutType={setLayoutType}
        />
      ) : (
        <>
          <div className="workbench-container">
      <WorkbenchActions
        uploadCanvasImage={uploadCanvasImage}
        saveLayout={saveLayout}
        fetchAvailableLayouts={fetchAvailableLayouts}
        toolMode={toolMode}
        setToolMode={setToolMode}
        zoomBy={zoomBy}
        layoutTitle = {layoutTitle}
        showLayoutList = {showLayoutList}
        setShowLayoutList = {setShowLayoutList}
        availableLayouts = {availableLayouts}
        loadLayoutFromSelected = {loadLayoutFromSelected}
        exportToCMYKPDF = {exportToCMYKPDF}
        stageRef={stageRef}
        fitStageToScreen = {fitStageToScreen}
      />
     <WorkbenchCanvas
  handleTransformEnd={handleTransformEnd}  // ✅ Make sure this is included
  stageSize={stageSize}
  stageScale={stageScale}
  toolMode={toolMode}
  handleWheel={handleWheel}
  stageRef={stageRef}
  items={items}
  selectedId={selectedId}
  setSelectedId={setSelectedId}
  handleItemDragEnd={handleItemDragEnd}
  cellWidth={cellWidth}
  cellHeight={cellHeight}
  gutterWidth={gutterWidth}
  transformerRef={transformerRef}
  setItems={setItems}
  handleItemDragStart={handleItemDragStart}
  handleItemDragMove={handleItemDragMove}
  sections={sections}
  setSectionId={setSectionId}
  handleDragStart={handleDragStart}
  handleDragEnd={handleDragEnd}
  handleDragMove={handleDragMove}
  sectionId={sectionId}
        columns={columns}
        rows={rows}
/>
    </div>
          <Toolbox
            itemSizes={itemSizes}
            addBox={addBox}
            addTextBox={addTextBox}
            addImageItem={addImageItem}
            handleImageUpload={handleImageUpload}
            selectedId={selectedId}
            items={items}
            changeItemColor={changeItemColor}
            deleteSelected={deleteSelected}
            textFormatting={textFormatting}
            toggleFormat={toggleFormat}
            changeFontSize={changeFontSize}
            handleTextChange={handleTextChange}
            textValue={textValue}
            setTextFormatting={setTextFormatting}
            colors={colors}
            gutterWidth={gutterWidth}
            setGutterWidth={setGutterWidth}
            availableLayouts={availableLayouts}
            loadLayoutFromSelected={loadLayoutFromSelected}
            showLayoutList={showLayoutList}
            setShowLayoutList={setShowLayoutList}
            cellWidth = {cellWidth}
            cellHeight = {cellHeight}
            addPredefineditem = {addPredefineditem}
            addNewSection = {addNewSection}
            sectionId = {sectionId}
            addItemToSection = {addItemToSection}
            sections = {sections}
            setSections = {setSections}
          />
        </>
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
