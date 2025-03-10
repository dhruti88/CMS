import React from 'react';
import SetupModal from '../organisms/SetupModal';
import WorkbenchActions from '../organisms/WorkbenchActions';
import WorkbenchCanvas from '../organisms/WorkbenchCanvas';
import Toolbox from '../organisms/Toolbox';

const WorkbenchTemplate = (props) => {
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
    addPredefinedBox,
    handleDragStart,
    handleDragMove,
  } = props;

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
        layoutTitle = {layoutTitle}
        showLayoutList = {showLayoutList}
        setShowLayoutList = {setShowLayoutList}
        availableLayouts = {availableLayouts}
        loadLayoutFromSelected = {loadLayoutFromSelected}
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
        handleDragStart = {handleDragStart}
        handleDragMove = {handleDragMove}
        handleTransformEnd={handleTransformEnd}
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
            addPredefinedBox = {addPredefinedBox}
          />
        </>
      )}
    </div>
  );
};

export default WorkbenchTemplate;
