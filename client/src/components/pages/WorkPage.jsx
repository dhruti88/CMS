import React,{useEffect} from 'react';
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
import { useNavigate } from 'react-router-dom';
import { Modal ,Box } from '@mui/material';
import LoadLayoutAndSection from '../organisms/LoadLayoutAndSection';


const WorkPage = () => {
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
    fetchLayoutById,
    // setuserID,
  } = workbenchProps;
// Inside WorkbenchTemplate component (before the return)

  const [targetSectionIdForReplacement, setTargetSectionIdForReplacement] = useState(null);
  const [showReplacementPanel, setShowReplacementPanel] = useState(false);

const openReplacementPanel = async () => {
  // Check if there are sections and a section is currently selected
  if (sections && sections.length > 0 && selectedId == sectionId) {
    // Save the selected section ID as the target for replacement
    setTargetSectionIdForReplacement(selectedId);
    // Optionally, you might trigger a fetch here if you need to update availableLayouts:
    await fetchAvailableSections();  // Uncomment if needed
    // Now open the replacement panel
    setShowReplacementPanel(true);
  } else {
    console.warn("No section selected for replacement.");
  }
};

const handleReplaceSection = (selectedSection) => {
  // Debug: Log the function call and inputs
  console.log('handleReplaceSection called');
  console.log('selectedSection:', selectedSection);
  console.log('targetSectionIdForReplacement:', targetSectionIdForReplacement);
  console.log('Current sections:', sections);

  // Verify setSections function exists
  if (typeof setSections !== 'function') {
    console.error('setSections is not a function!');
    return;
  }

  // Find the target section in the current sections array
  const targetSection = sections.find(sec => sec.id === targetSectionIdForReplacement);

  if (!targetSection || !selectedSection) {
    console.warn("Invalid section replacement");
    setShowReplacementPanel(false);
    return;
  }

  // Create the replacement section
  const replacementSection = {
    ...selectedSection,
    id: targetSection.id,  // Keep original ID
    x: targetSection.x,
    y: targetSection.y,
    gridX: targetSection.gridX,
    gridY: targetSection.gridY,
    // Add any other necessary properties
  };

  // Use functional update to ensure correct state update
  setSections(prevSections => 
    prevSections.map(section => 
      section.id === targetSectionIdForReplacement 
        ? replacementSection 
        : section
    )
  );

  // Close the replacement panel
  setShowReplacementPanel(false);

  // Update selected section
  setSelectedId(replacementSection.id);

  // Debug: Log the result
  console.log('Replacement completed', replacementSection);
};


  return (
    <div className="cms-container">
      {false ? (
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
          layoutType={layoutType}
          setLayoutType={setLayoutType}
          saveLayout={saveLayout}
        />
      ) : (
        <>
                <Navbar>
                  <CustomButton onClick={() => navigate("/signup")}>Sign up</CustomButton>
                </Navbar>
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
        setHideGrid={setHideGrid}
        setHideBackground={setHideBackground}
        transformerRef={transformerRef}
        setSelectedId = {setSelectedId}
        handleDeleteLayout = {handleDeleteLayout}
        isDeleting = {isDeleting}
        userID={userID} 
        userProfilePic = {userProfilePic}
        activeEditors = {activeEditors}
        setLayoutTitle={setLayoutTitle}
      />
     <WorkbenchCanvas
  handleTransformEnd={handleTransformEnd}  
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
  positionDisplay = {positionDisplay}
        columns={columns}
        rows={rows}
        hideGrid={hideGrid}
        hideBackground={hideBackground}
        setSections = {setSections}
        snapLines = {snapLines}
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
          taskStatus={taskStatus}
          setTaskStatus={setTaskStatus}
          changeFontFamily = {changeFontFamily}
            openReplacementPanel={openReplacementPanel}
            layoutType = {layoutType}
            rows = {rows}
            columns = {columns}            
          />
{showReplacementPanel && (
  <LoadLayoutAndSection
    availableLayouts={availableLayouts}
    targetSection={sections.find(sec => sec.id === targetSectionIdForReplacement)}
    onReplaceSection={handleReplaceSection}
    setShowLayoutList={setShowReplacementPanel} // Used to close panel
    mode="section" // Handles section replacement
    selectedId = {selectedId}
    sectionId = {sectionId}
  />
)}
        </>
      )}
    </div>
  );
};

export default WorkPage;

