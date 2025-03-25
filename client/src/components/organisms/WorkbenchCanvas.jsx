import React, { useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Transformer, Group } from 'react-konva';
import URLImage from '../atoms/URLImage';
import { getGridLines } from '../../utils/gridHelpers';

const WorkbenchCanvas = ({
  stageSize,
  stageScale,
  toolMode,
  handleWheel,
  stageRef,
  items,
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
  sections = [], // default to empty array
  setSectionId,
  handleDragStart,
  handleDragEnd,
  handleDragMove,
  sectionId,
  columns,
  rows
}) => {
  const [draggingItem, setDraggingItem] = useState(false);

  // Generate grid lines based on columns, rows and gutterWidth
  const gridLines = getGridLines(
    columns,
    rows,
    stageSize.width,
    stageSize.height,
    gutterWidth,
    { grays: ['#202124', '#3c4043', '#5f6368', '#dadce0', '#f1f3f4'] }
  );

  useEffect(() => {
    if (!selectedId || !transformerRef.current) {
      transformerRef.current?.nodes([]);
      transformerRef.current?.getLayer()?.batchDraw();
      return;
    }

    let selectedItem = null;
    let selectedSection = null;
    // Use safe iteration over sections
    for (const section of sections || []) {
      const item = (section.items || []).find(i => i.id === selectedId);
      if (item) {
        selectedItem = item;
        selectedSection = section;
        break;
      }
    }
    if (!selectedItem) return;

    const selectedNode = stageRef.current.findOne(`#${selectedId}`);
    if (selectedNode) {
      transformerRef.current.nodes([selectedNode]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId, sections, transformerRef, stageRef]);

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

          {sections.map((section) => (
            <Group
              key={section.id || section._id}
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
              onClick={() => setSectionId(section.id)}
              onTap={() => setSectionId(section.id)}
            >
              <Rect
                width={section.width}
                height={section.height}
                fill=""
                stroke="red"
                strokeWidth={2}
                onTap={() => setSelectedId(section.id)}
                onClick={() => setSelectedId(section.id)}
              />

              {(section.items || []).map((item) =>
                item.type === "text" ? (
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
                    }}
                    onDragMove={(e) => handleItemDragMove(e, item.id, section.id)}
                    onDragEnd={(e) => {
                      setDraggingItem(false);
                      handleItemDragEnd(e, item.id, section.id);
                    }}
                    perfectDrawEnabled={false}
                  />
                ) : item.type === "image" ? (
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
                ) : null
              )}
            </Group>
          ))}

          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (!selectedId || !sectionId) return oldBox;

              const section = sections.find(sec => sec.id === sectionId);
              if (!section) return oldBox;

              const totalCellWidth = cellWidth + gutterWidth;
              const sectionLeft = section.x;
              const sectionRight = section.x + section.width;
              const sectionTop = section.y;
              const sectionBottom = section.y + section.height;

              const newX = Math.max(sectionLeft, Math.min(newBox.x, sectionRight - newBox.width));
              const newY = Math.max(sectionTop, Math.min(newBox.y, sectionBottom - newBox.height));

              const colSpan = Math.max(1, Math.round((newBox.width + gutterWidth) / totalCellWidth));
              const snappedWidth = colSpan * cellWidth + (colSpan - 1) * gutterWidth;
              const rowSpan = Math.max(1, Math.round(newBox.height / cellHeight));
              const snappedHeight = rowSpan * cellHeight;

              return {
                ...newBox,
                x: newX,
                y: newY,
                width: Math.min(snappedWidth, sectionRight - newX),
                height: Math.min(snappedHeight, sectionBottom - newY),
              };
            }}
            onTransformEnd={(e) => {
              handleTransformEnd(e);
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default WorkbenchCanvas;
