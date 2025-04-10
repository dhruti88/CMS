import React, { useState, useEffect, useContext } from 'react';
import { Stage, Layer, Rect, Text, Transformer, Group, Line } from 'react-konva';
import URLImage from '../atoms/URLImage';
import { getGridLines } from '../../utils/gridHelpers';
import { WorkbenchContext } from '../../context/WorkbenchContext'; // Adjust the path as needed

const WorkbenchCanvas = () => {
  const workbenchProps = useContext(WorkbenchContext);
  const [draggingItem, setDraggingItem] = useState(false);

  const gridLines = getGridLines(
    workbenchProps.columns,
    workbenchProps.rows,
    workbenchProps.stageSize.width,
    workbenchProps.stageSize.height,
    workbenchProps.gutterWidth,
    { grays: ['#202124', '#3c4043', '#5f6368', '#dadce0', '#f1f3f4'] }
  );

  const offset = workbenchProps.gutterWidth / 2;

  const PositionDisplay = ({ position }) => {
    if (!position.show) return null;

    return (
      <div
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 1000,
          pointerEvents: 'none',
        }}
      >
        <div>
          {position.isSection ? 'Section' : 'Item'} Position:
        </div>
        <div>
          Pixels: ({Math.round(position.x)}, {Math.round(position.y)})
        </div>
        <div>
          Grid: ({position.gridX}, {position.gridY})
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (!workbenchProps.selectedId || !workbenchProps.transformerRef.current) {
      workbenchProps.transformerRef.current?.nodes([]);
      workbenchProps.transformerRef.current?.getLayer()?.batchDraw();
      return;
    }

    let selectedItem = null;
    let selectedSection = null;

    for (const section of workbenchProps.sections) {
      const item = section.items.find(i => i.id === workbenchProps.selectedId);
      if (item) {
        selectedItem = item;
        selectedSection = section;
        break;
      }
    }

    if (!selectedItem) return;

    const selectedNode = workbenchProps.stageRef.current.findOne(`#${workbenchProps.selectedId}`);

    if (selectedNode) {
      workbenchProps.transformerRef.current.nodes([selectedNode]);
      workbenchProps.transformerRef.current.getLayer().batchDraw();
    }
  }, [workbenchProps.selectedId, workbenchProps.sections, workbenchProps.transformerRef, workbenchProps.stageRef]);

  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const container = document.querySelector('.workbench-container');
    if (!container || !workbenchProps.stageRef.current) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Directly adjust the stage size using the ref
    workbenchProps.stageRef.current.width(Math.max(workbenchProps.stageSize.width, containerWidth));
    workbenchProps.stageRef.current.height(Math.max(workbenchProps.stageSize.height, containerHeight));
  }, [zoomLevel, workbenchProps.stageSize, workbenchProps.stageRef]);

  return (
    <div className="workbench-container" style={{ border: '2px solid black' }}>
      <PositionDisplay position={workbenchProps.positionDisplay} />
      <Stage
        ref={workbenchProps.stageRef}
        width={workbenchProps.stageSize.width}
        height={workbenchProps.stageSize.height}
        scaleX={workbenchProps.stageScale}
        scaleY={workbenchProps.stageScale}
        draggable={workbenchProps.toolMode === 'hand'}
        onWheel={workbenchProps.handleWheel}
        onClick={(e) => {
          if (workbenchProps.toolMode === 'pointer' && e.target === e.target.getStage()) {
            workbenchProps.setSelectedId(null);
          }
        }}
        className="konva-stage"
      >
        <Layer>
          {!workbenchProps.hideBackground && (
            <Rect
              x={0}
              y={0}
              width={workbenchProps.stageSize.width}
              height={workbenchProps.stageSize.height}
              fill="gray"
              onClick={() => workbenchProps.setSelectedId(null)}
              onTap={() => workbenchProps.setSelectedId(null)}
            />
          )}
          {!workbenchProps.hideGrid && gridLines}

          {workbenchProps.sections.map((section) => (
            <Group
              key={section.id}
              id={section.id}
              x={section.x}
              y={section.y}
              draggable={!draggingItem}
              onDragStart={(e) => !draggingItem && workbenchProps.handleDragStart(e, section.id)}
              onDragMove={(e) => !draggingItem && workbenchProps.handleDragMove(e, section.id)}
              onDragEnd={(e) => !draggingItem && workbenchProps.handleDragEnd(e, section.id)}
              onClick={() => workbenchProps.setSectionId(section.id)}
              onTap={() => workbenchProps.setSectionId(section.id)}
            >
              {!workbenchProps.hideBackground && (
                <Rect
                  width={section.width}
                  height={section.height}
                  fill=""
                  stroke="red"
                  strokeWidth={2}
                  onTap={(e) => {
                    workbenchProps.transformerRef.current?.nodes([]);
                    workbenchProps.transformerRef.current?.getLayer()?.batchDraw();
                    workbenchProps.setSelectedId(section.id);
                  }}
                  onClick={(e) => {
                    workbenchProps.transformerRef.current?.nodes([]);
                    workbenchProps.transformerRef.current?.getLayer()?.batchDraw();
                    workbenchProps.setSelectedId(section.id);
                  }}
                />
              )}

              {/* Left Border (-offset) */}
              {section.borderStyle.left && (
                <Line
                  points={[-offset, 0, -offset, section.height]}
                  stroke={section.borderColor || "black"}
                  strokeWidth={section.borderWidth || 2}
                />
              )}

              {/* Right Border (+offset) */}
              {section.borderStyle.right && (
                <Line
                  points={[section.width + offset, 0, section.width + offset, section.height]}
                  stroke={section.borderColor || "black"}
                  strokeWidth={section.borderWidth || 2}
                />
              )}

              {/* Top Border */}
              {section.borderStyle.top && (
                <Line
                  points={[0, 0, section.width, 0]}
                  stroke={section.borderColor || "black"}
                  strokeWidth={section.borderWidth || 2}
                />
              )}

              {/* Bottom Border */}
              {section.borderStyle.bottom && (
                <Line
                  points={[0, section.height, section.width, section.height]}
                  stroke={section.borderColor || "black"}
                  strokeWidth={section.borderWidth || 2}
                />
              )}

              {section.items.map((item) =>
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
                    textDecoration={item.textDecoration}
                    draggable
                    onClick={() => {
                      workbenchProps.setSelectedId(item.id);
                      workbenchProps.setSectionId(section.id);
                    }}
                    onDragStart={(e) => {
                      setDraggingItem(true);
                      workbenchProps.handleItemDragStart(e, item.id, section.id);
                    }}
                    onDragMove={(e) => workbenchProps.handleItemDragMove(e, item.id, section.id)}
                    onDragEnd={(e) => {
                      setDraggingItem(false);
                      workbenchProps.handleItemDragEnd(e, item.id, section.id);
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
                    onClick={() => workbenchProps.setSelectedId(item.id)}
                    onTap={() => workbenchProps.setSelectedId(item.id)}
                    onDragStart={(e) => {
                      setDraggingItem(true);
                      workbenchProps.handleItemDragStart(e, item.id, section.id);
                      workbenchProps.setSelectedId(item.id);
                    }}
                    onDragMove={(e) => workbenchProps.handleItemDragMove(e, item.id, section.id)}
                    onDragEnd={(e) => {
                      setDraggingItem(false);
                      workbenchProps.handleItemDragEnd(e, item.id, section.id);
                    }}
                    perfectDrawEnabled={false}
                  />
                ) : null
              )}
            </Group>
          ))}

          <Transformer
            ref={workbenchProps.transformerRef}
            rotateEnabled={false}
            boundBoxFunc={(oldBox, newBox) => {
              if (!workbenchProps.selectedId || !workbenchProps.sectionId) return oldBox;

              const section = workbenchProps.sections.find(sec => sec.id === workbenchProps.sectionId);
              if (!section) return oldBox;

              const selectedItem = section.items.find(i => i.id === workbenchProps.selectedId);
              if (!selectedItem) return oldBox;

              const otherItems = section.items.filter(i => i.id !== workbenchProps.selectedId);
              console.log("section : - ", section, "new box : -", newBox, "old box : -", oldBox);

              // Section boundaries
              const sectionLeft = section.x;
              const sectionRight = section.x + section.width;
              const sectionTop = section.y;
              const sectionBottom = section.y + section.height;

              // Grid calculations
              const totalCellWidth = workbenchProps.cellWidth + workbenchProps.gutterWidth;
              const newGridX = Math.round((newBox.x - section.x) / totalCellWidth);
              const newGridY = Math.round((newBox.y - section.y) / workbenchProps.cellHeight);
              const colSpan = Math.max(1, Math.round((newBox.width + workbenchProps.gutterWidth) / totalCellWidth));
              const rowSpan = Math.max(1, Math.round(newBox.height / workbenchProps.cellHeight));
              const snappedWidth = colSpan * workbenchProps.cellWidth + (colSpan - 1) * workbenchProps.gutterWidth;
              const snappedHeight = rowSpan * workbenchProps.cellHeight;

              let canExpandLeft = true, canExpandRight = true, canExpandTop = true, canExpandBottom = true;

              // **Check for collisions**
              otherItems.forEach(item => {
                const itemGridX = Math.round(item.x / totalCellWidth);
                const itemGridY = Math.round(item.y / workbenchProps.cellHeight);
                const itemColSpan = Math.round(item.width / totalCellWidth);
                const itemRowSpan = Math.round(item.height / workbenchProps.cellHeight);

                const itemRight = itemGridX + itemColSpan;
                const itemBottom = itemGridY + itemRowSpan;
                const newRight = newGridX + colSpan;
                const newBottom = newGridY + rowSpan;

                // **Stop left expansion if another item is in the way**
                if (newGridX < selectedItem.gridX && itemRight > newGridX && itemGridY < newBottom && itemBottom > newGridY) {
                  canExpandLeft = false;
                }

                // **Stop right expansion if another item is in the way**
                if (newRight > selectedItem.gridX + selectedItem.sizeInfo.cols && itemGridX < newRight && itemRight > newGridX && itemGridY < newBottom && itemBottom > newGridY) {
                  canExpandRight = false;
                }

                // **Stop top expansion if another item is in the way**
                if (newGridY < selectedItem.gridY && itemBottom > newGridY && itemGridX < newRight && itemRight > newGridX) {
                  canExpandTop = false;
                }

                // **Stop bottom expansion if another item is in the way**
                if (newBottom > selectedItem.gridY + selectedItem.sizeInfo.rows && itemGridY < newBottom && itemBottom > newGridY && itemGridX < newRight && itemRight > newGridX) {
                  canExpandBottom = false;
                }
              });

              // **Adjust Left Expansion**
              const adjustedX = canExpandLeft
                ? Math.max(sectionLeft, section.x + newGridX * totalCellWidth)
                : section.x + selectedItem.gridX * totalCellWidth;

              // **Adjust Top Expansion**
              const adjustedY = canExpandTop
                ? Math.max(sectionTop, section.y + newGridY * workbenchProps.cellHeight)
                : section.y + selectedItem.gridY * workbenchProps.cellHeight;

              // **Width & Height Adjustments**
              const adjustedWidth = canExpandRight
                ? Math.min(snappedWidth, sectionRight - adjustedX)
                : selectedItem.sizeInfo.cols * totalCellWidth - workbenchProps.gutterWidth;

              const adjustedHeight = canExpandBottom
                ? Math.min(snappedHeight, sectionBottom - adjustedY)
                : selectedItem.sizeInfo.rows * workbenchProps.cellHeight;

              return {
                ...oldBox,
                x: adjustedX,
                y: adjustedY,
                width: adjustedWidth,
                height: adjustedHeight,
              };
            }}
            onTransformEnd={(e) => {
              console.log("Transform End Triggered");
              workbenchProps.handleTransformEnd(e);
            }}
          />

          {/* Render snap lines */}
          {workbenchProps.snapLines.map((line, i) => (
            <Line
              key={`snapline-${i}`}
              points={line.points}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth}
              dash={line.dash}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default WorkbenchCanvas;