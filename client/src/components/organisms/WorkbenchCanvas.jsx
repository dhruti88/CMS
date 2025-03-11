import React,{useRef} from 'react';
import { Stage, Layer, Rect, Text, Transformer } from 'react-konva';
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
  handleDragEnd,
  cellWidth,
  cellHeight,
  gutterWidth,
  transformerRef,
  setItems,
  handleTransformEnd,
  handleDragStart,
  handleDragMove,
  layerRef
}) => {
  // Build grid lines using the helper
  const gridLines = getGridLines(
    stageSize.width,
    stageSize.height,
    cellWidth,
    cellHeight,
    gutterWidth,
    { grays: ['#202124', '#3c4043', '#5f6368', '#dadce0', '#f1f3f4'] }
  );

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
        <Layer ref={layerRef}>
          <Rect x={0} y={0} width={stageSize.width} height={stageSize.height} fill="gray" />
          {gridLines}
          {items.map((item) => {
            if (item.type === 'box') {
              return (
                <Rect
                  key={item.id}
                  id={item.id}
                  x={item.x}
                  y={item.y}
                  width={item.width}
                  height={item.height}
                  fill={item.fill}
                  stroke={item.stroke}
                  strokeWidth={item.strokeWidth}
                  draggable
                  onClick={() => setSelectedId(item.id)}
                  onTap={() => setSelectedId(item.id)}
                  onDragStart={(e) => { handleDragStart(e, item.id); setSelectedId(item.id); }}
                  onDragMove={(e) => handleDragMove(e, item.id)}
                  onDragEnd={(e) => handleDragEnd(e, item.id)}
                  perfectDrawEnabled={false}
                />
              );
            } else if (item.type === 'text') {
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
                  draggable
                  onClick={() => setSelectedId(item.id)}
                  onTap={() => setSelectedId(item.id)}
                  onDragStart={(e) => { handleDragStart(e, item.id); setSelectedId(item.id); }}
                  onDragMove={(e) => handleDragMove(e, item.id)}
                  onDragEnd={(e) => handleDragEnd(e, item.id)}
                  textDecoration={item.textDecoration}
                  perfectDrawEnabled={false}
                />
              );
            } else if (item.type === 'image') {
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
                  onDragStart={(e) => { handleDragStart(e, item.id); setSelectedId(item.id); }}
                  onDragMove={(e) => handleDragMove(e, item.id)}
                  onDragEnd={(e) => handleDragEnd(e, item.id)}
                  perfectDrawEnabled={false}
                />
              );
            }
            return null;
          })}
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
