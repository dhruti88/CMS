import React, { useState } from 'react';
import { Stage, Layer, Rect, Text, Transformer, Group } from 'react-konva';
import URLImage from '../atoms/URLImage';
import { getGridLines } from '../../utils/gridHelpers';

const WorkbenchCanvas = ({
  stageSize,
  stageScale,
  toolMode,
  handleWheel,
  stageRef,
  items, // Not used directly if using sections
  selectedId,
  setSelectedId,
  handleItemDragEnd,
  cellWidth,
  cellHeight,
  gutterWidth,
  transformerRef,
  setItems,
  handleTransformEnd,
  handleItemDragStart,
  handleItemDragMove,
  sections,
  setSectionId,
  handleDragStart,
  handleDragEnd,
  handleDragMove,
}) => {
  const [draggingItem, setDraggingItem] = useState(false);

  // Draw grid lines
  const gridLines = getGridLines(
    stageSize.width,
    stageSize.height,
    cellWidth,
    cellHeight,
    gutterWidth,
    { grays: ['#202124', '#3c4043', '#5f6368', '#dadce0', '#f1f3f4'] }
  );

  // Helper: Render a section (recursively used for embedded layouts too)
  const renderSection = (section) => {
    return (
      <Group
        key={section.id}
        x={section.x}
        y={section.y}
        draggable={!draggingItem}
        onDragStart={(e) => {
          if (!draggingItem) {
            handleDragStart(e, section.id);
            setSelectedId(section.id);
          }
        }}
        onDragMove={(e) => {
          if (!draggingItem) {
            handleDragMove(e, section.id);
          }
        }}
        onDragEnd={(e) => {
          if (!draggingItem) {
            handleDragEnd(e, section.id);
          }
        }}
        onTap={() => setSectionId(section.id)}
      >
        <Rect
          width={section.width}
          height={section.height}
          fill=""
          stroke="red"
          strokeWidth={2}
          onClick={() => setSectionId(section.id)}
          onTap={() => setSectionId(section.id)}
        />
        {section.items.map((item) => {
          if (item.type === "text") {
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
                textDecoration={item.textDecoration}
                draggable
                onClick={() => {
                  setSelectedId(item.id);
                  setSectionId(section.id);
                }}
                onTap={() => setSelectedId(item.id)}
                onDragStart={(e) => {
                  setDraggingItem(true);
                  handleItemDragStart(e, item.id, section.id);
                  setSelectedId(item.id);
                }}
                onDragMove={(e) => handleItemDragMove(e, item.id, section.id)}
                onDragEnd={(e) => {
                  setDraggingItem(false);
                  handleItemDragEnd(e, item.id, section.id);
                }}
                perfectDrawEnabled={false}
              />
            );
          } else if (item.type === "image") {
            return (
              <URLImage
                key={item.id}
                id={item.id}
                x={item.x}
                y={item.y}
                width={item.width}
                height={item.height}
                src={item.src}
                draggable
                onClick={() => setSelectedId(item.id)}
                onTap={() => setSelectedId(item.id)}
                onDragStart={(e) => {
                  setDraggingItem(true);
                  handleItemDragStart(e, item.id, section.id);
                  setSelectedId(item.id);
                }}
                onDragMove={(e) => handleItemDragMove(e, item.id, section.id)}
                onDragEnd={(e) => {
                  setDraggingItem(false);
                  handleItemDragEnd(e, item.id, section.id);
                }}
                perfectDrawEnabled={false}
              />
            );
          } else if (item.type === "embedded") {
            return renderEmbeddedItem(item, section);
          }
          return null;
        })}
      </Group>
    );
  };

  // Helper: Render an embedded layout item.
  // It renders a group that displays a background, a label and then renders its embedded sections.
  const renderEmbeddedItem = (item, parentSection) => {
    const embeddedLayout = item.embeddedLayout; // The entire layout object from the backend.
    if (!embeddedLayout) return null;
    return (
      <Group
        key={item.id}
        id={item.id}
        x={item.x}
        y={item.y}
        draggable
        onClick={() => {
          setSelectedId(item.id);
          setSectionId(parentSection.id);
        }}
        onTap={() => setSelectedId(item.id)}
        onDragStart={(e) => {
          setDraggingItem(true);
          handleItemDragStart(e, item.id, parentSection.id);
          setSelectedId(item.id);
        }}
        onDragMove={(e) => handleItemDragMove(e, item.id, parentSection.id)}
        onDragEnd={(e) => {
          setDraggingItem(false);
          handleItemDragEnd(e, item.id, parentSection.id);
        }}
      >
        <Rect
          width={item.width}
          height={item.height}
          fill="#ffffffAA"  // Semi-transparent white
          stroke="blue"
          strokeWidth={2}
        />
        <Text
          text={`Embedded: ${embeddedLayout.title}`}
          fontSize={16}
          fill="black"
          align="center"
          width={item.width}
          height={20}
          verticalAlign="middle"
        />
        {/* Render each section of the embedded layout.
            Adjust positions if necessary. */}
        {embeddedLayout.sections && embeddedLayout.sections.map(sec => {
          // We assume the embedded sections have their own x,y coordinates relative to the embedded layout.
          return renderSection(sec);
        })}
      </Group>
    );
  };

  return (
    <div className="workbench-container" style={{ border: '2px solid black' }}>
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={stageScale}
        scaleY={stageScale}
        draggable={toolMode === 'hand'}
        onWheel={handleWheel}
        onClick={(e) => {
          if (toolMode === 'pointer' && e.target === e.target.getStage()) {
            setSelectedId(null);
          }
        }}
        className="konva-stage"
      >
        <Layer>
          <Rect x={0} y={0} width={stageSize.width} height={stageSize.height} fill="gray" />
          {gridLines}
          {sections.map(section => renderSection(section))}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              const totalCellWidth = cellWidth + gutterWidth;
              const colSpan = Math.round((newBox.width + gutterWidth) / totalCellWidth);
              const snappedWidth = colSpan * cellWidth + (colSpan - 1) * gutterWidth;
              const rowSpan = Math.round(newBox.height / cellHeight);
              const snappedHeight = rowSpan * cellHeight;
              const minWidth = cellWidth;
              const minHeight = cellHeight;
              const maxWidth = stageSize.width;
              const maxHeight = stageSize.height;
              return {
                ...newBox,
                width: Math.max(minWidth, Math.min(maxWidth, snappedWidth)),
                height: Math.max(minHeight, Math.min(maxHeight, snappedHeight)),
              };
            }}
            onTransformEnd={handleTransformEnd}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default WorkbenchCanvas;
