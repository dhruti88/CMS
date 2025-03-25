import React, { useContext, useState } from 'react';
import SetupModal from '../organisms/SetupModal';
import WorkbenchActions from '../organisms/WorkbenchActions';
import WorkbenchCanvas from '../organisms/WorkbenchCanvas';
import Toolbox from '../organisms/Toolbox';
import { WorkbenchContext } from '../../context/WorkbenchContext';
import SectionReplacementPanel from '../organisms/SectionReplacementPanel';

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
    sections = [],
    setSections,
    exportToCMYKPDF,
    fetchAvailablesections, // make sure spelling matches the one exported by your hook
  } = workbenchProps;

  // State for section replacement panel.
  const [showReplacementPanel, setShowReplacementPanel] = useState(false);
  const [targetSectionIdForReplacement, setTargetSectionIdForReplacement] = useState(null);

  // Open the replacement panel.
  // It fetches the available sections and then shows the panel.
  const openReplacementPanel = () => {
    if (sections && sections.length > 0 && selectedId) {
      setTargetSectionIdForReplacement(selectedId);
      // Fetch available sections from backend (ensure your function updates availableLayouts in context)
      fetchAvailablesections();
      setShowReplacementPanel(true);
    } else {
      console.warn("No section selected for replacement.");
    }
  };

  // When a section is replaced, replace the target section in the sections array
  // while preserving its original position and dimensions.
  const handleReplaceSection = (newSectionData) => {
    if (!newSectionData) return;
    if (typeof setSections !== 'function') {
      console.error("setSections is not defined properly in context.");
      return;
    }
    setSections(prevSections =>
      prevSections.map(sec => {
        if (sec.id === targetSectionIdForReplacement) {
          // Replace section content with newSectionData but preserve position/size.
          return {
            ...newSectionData,
            id: sec.id, // Optionally preserve the target section's id
            x: sec.x,
            y: sec.y,
            width: sec.width,
            height: sec.height,
          };
        }
        return sec;
      })
    );
    setShowReplacementPanel(false);
  };

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
              layoutTitle={layoutTitle}
              showLayoutList={showLayoutList}
              setShowLayoutList={setShowLayoutList}
              availableLayouts={availableLayouts}
              loadLayoutFromSelected={loadLayoutFromSelected}
              exportToCMYKPDF={exportToCMYKPDF}
              stageRef={stageRef}
              fitStageToScreen={workbenchProps.fitStageToScreen}
            />
            <WorkbenchCanvas
              stageSize={stageSize}
              stageScale={stageScale}
              toolMode={toolMode}
              handleWheel={handleWheel}
              stageRef={stageRef}
              items={items}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              handleDragEnd={handleDragEnd}
              cellWidth={cellWidth}
              cellHeight={cellHeight}
              gutterWidth={gutterWidth}
              transformerRef={transformerRef}
              setItems={setItems}
              handleItemDragStart={handleDragStart}
              handleItemDragMove={handleDragMove}
              handleItemDragEnd={handleDragEnd}
              handleDragStart={handleDragStart}
              handleDragMove={handleDragMove}
              setSectionId={setSectionId}
              sections={sections}
              setSections={setSections}
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
            cellWidth={cellWidth}
            cellHeight={cellHeight}
            addPredefineditem={addPredefineditem}
            addNewSection={addNewSection}
            sectionId={sectionId}
            addItemToSection={addItemToSection}
            sections={sections}
            setSections={setSections}
            openReplacementPanel={openReplacementPanel}
          />
        </>
      )}
      {showReplacementPanel && (
        <SectionReplacementPanel
          availableSections={availableLayouts} // Use availableLayouts as the list of sections to choose from.
          onReplaceSection={handleReplaceSection}
          onClose={() => setShowReplacementPanel(false)}
        />
      )}
    </div>
  );
};

export default WorkbenchTemplate;
