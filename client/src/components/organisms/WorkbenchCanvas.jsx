
// import React, { useState } from 'react';
// import { Stage, Layer, Rect, Text, Transformer, Group } from 'react-konva';
// import URLImage from '../atoms/URLImage';
// import { getGridLines } from '../../utils/gridHelpers';

// const WorkbenchCanvas = ({
//   stageSize,
//   stageScale,
//   toolMode,
//   handleWheel,
//   stageRef,
//   items,
//   selectedId,
//   setSelectedId,
//   handleItemDragEnd,
//   cellWidth,
//   cellHeight,
//   gutterWidth,
//   transformerRef,
//   setItems,
//   handleTransformEnd,
//   handleItemDragStart,
//   handleItemDragMove,
//   sections,
//   setSectionId,
//   handleDragStart,
//   handleDragEnd,
//   handleDragMove,
//   columns,
//   rows
// }) => {
//   const [draggingItem, setDraggingItem] = useState(false); // Track if an item is being dragged

//   const gridLines = getGridLines(
//     columns,rows,
//     stageSize.width,
//     stageSize.height,
//     gutterWidth,
//     { grays: ['#202124', '#3c4043', '#5f6368', '#dadce0', '#f1f3f4'] }
//   );

//   return (
//     <div className="workbench-container" style={{ border: '2px solid black' }}>
//       <Stage
//         ref={stageRef}
//         width={stageSize.width}
//         height={stageSize.height}
//         scaleX={stageScale}
//         scaleY={stageScale}
//         draggable={toolMode === 'hand'}
//         onWheel={handleWheel}
//         onClick={(e) => {
//           if (toolMode === 'pointer' && e.target === e.target.getStage()) {
//             setSelectedId(null);
//           }
//         }}
//         className="konva-stage"
//       >
//         <Layer>
//           <Rect x={0} y={0} width={stageSize.width} height={stageSize.height} fill="gray" />
//           {gridLines}

//           {sections.map((section) => (
//             <Group
//               key={section.id}
//               x={section.x}
//               y={section.y}
//               draggable={!draggingItem} // Prevent section dragging when an item is dragged
//               onDragStart={(e) => {
//                 if (!draggingItem) {
//                   handleDragStart(e, section.id);
//                   setSelectedId(section.id);
//                 }
//               }}
//               onDragMove={(e) => {
//                 if (!draggingItem) {
//                   handleDragMove(e, section.id);
//                 }
//               }}
//               onDragEnd={(e) => {
//                 if (!draggingItem) {
//                   handleDragEnd(e, section.id);
//                 }
//               }}
//               onTap={() => setSectionId(section.id)}
//             >
//               <Rect width={section.width} height={section.height} fill="" stroke="red" strokeWidth={2} 
//               onTap={() => setSectionId(section.id)}
//               onClick={() => setSectionId(section.id)}/>

// {section.items.map((item) =>
//   item.type === "text" ? (
//     <Text
//       key={item.id}
//                   id={item.id}
//                   x={item.x}
//                   y={item.y}
//                   width={item.width}
//                   height={item.height}
//                   text={item.text}
//                   fontSize={item.fontSize}
//                   fontStyle={item.fontStyle}
//                   fontFamily={item.fontFamily}
//                   fill={item.fill}
//                   align={item.align}
//                   padding={item.padding}
//                   backgroundFill={item.backgroundFill}

//                   textDecoration={item.textDecoration}
//                   draggable
//       onClick={() => {
//         setSelectedId(item.id);
//         setSectionId(section.id);
//       }}
//       onTap={() => setSelectedId(item.id)}
//       onDragStart={(e) => {
//         setDraggingItem(true); // Prevent section movement
//         handleItemDragStart(e, item.id, section.id);
//         setSelectedId(item.id);
//       }}
//       onDragMove={(e) => handleItemDragMove(e, item.id, section.id)}
//       onDragEnd={(e) => {
//         setDraggingItem(false); // Re-enable section movement
//         handleItemDragEnd(e, item.id, section.id);
//       }}
//       perfectDrawEnabled={false}
//     />
//   ) : item.type === "image" ? (
//     <URLImage
//       key={item.id}
//       id={item.id}
//       x={item.x}
//       y={item.y}
//       width={item.width}
//       height={item.height}
//       src={item.src}
//       draggable
//       onClick={() => setSelectedId(item.id)}
//       onTap={() => setSelectedId(item.id)}
//       onDragStart={(e) => {
//         setDraggingItem(true); // Prevent section movement
//         handleItemDragStart(e, item.id, section.id);
//         setSelectedId(item.id);
//       }}
//       onDragMove={(e) => handleItemDragMove(e, item.id, section.id)}
//       onDragEnd={(e) => {
//         setDraggingItem(false); // Re-enable section movement
//         handleItemDragEnd(e, item.id, section.id);
//       }}
//       perfectDrawEnabled={false}
//     />
//   ) : null
// )}

//             </Group>
//           ))}

//           <Transformer
//             ref={transformerRef}
//             boundBoxFunc={(oldBox, newBox) => {
//               const totalCellWidth = cellWidth + gutterWidth;
//               const colSpan = Math.round((newBox.width + gutterWidth) / totalCellWidth);
//               const snappedWidth = colSpan * cellWidth + (colSpan - 1) * gutterWidth;
//               const rowSpan = Math.round(newBox.height / cellHeight);
//               const snappedHeight = rowSpan * cellHeight;
//               const minWidth = cellWidth;
//               const minHeight = cellHeight;
//               const maxWidth = stageSize.width;
//               const maxHeight = stageSize.height;
//               return {
//                 ...newBox,
//                 width: Math.max(minWidth, Math.min(maxWidth, snappedWidth)),
//                 height: Math.max(minHeight, Math.min(maxHeight, snappedHeight)),
//               };
//             }}
//             onTransformEnd={handleTransformEnd}
//           />
//         </Layer>
//       </Stage>
//     </div>
//   );
// };

// export default WorkbenchCanvas;



// // import React from 'react';
// // import { Stage, Layer, Rect, Text, Transformer, Group } from 'react-konva';
// // import URLImage from '../atoms/URLImage';
// // import { getGridLines } from '../../utils/gridHelpers';

// // const WorkbenchCanvas = ({
// //   stageSize,
// //   stageScale,
// //   toolMode,
// //   handleWheel,
// //   stageRef,
// //   items,
// //   selectedId,
// //   setSelectedId,
// //   handleItemDragEnd,
// //   cellWidth,
// //   cellHeight,
// //   gutterWidth,
// //   transformerRef,
// //   setItems,
// //   handleTransformEnd,
// //   handleItemDragStart,
// //   handleItemDragMove,
// //   sections,
// //   setSectionId,
// //   handleDragStart,
// //   handleDragEnd,
// //   handleDragMove,
// // }) => {
// //   // Build grid lines using the helper
// //   const gridLines = getGridLines(
// //     stageSize.width,
// //     stageSize.height,
// //     cellWidth,
// //     cellHeight,
// //     gutterWidth,
// //     { grays: ['#202124', '#3c4043', '#5f6368', '#dadce0', '#f1f3f4'] }
// //   );

// //   return (
// //     <div className="workbench-container" style={{ border: '2px solid black' }}>
// //       <Stage
// //         ref={stageRef}
// //         width={stageSize.width}
// //         height={stageSize.height}
// //         scaleX={stageScale}
// //         scaleY={stageScale}
// //         draggable={toolMode === 'hand'}
// //         onWheel={handleWheel}
// //         onClick={(e) => {
// //           if (toolMode === 'pointer' && e.target === e.target.getStage()) {
// //             setSelectedId(null);
// //           }
// //         }}
// //         className="konva-stage"
// //       >
// //         <Layer>
// //           <Rect x={0} y={0} width={stageSize.width} height={stageSize.height} fill="gray" />
// //           {gridLines}


// //           {sections.map((section) => (
// //             <Group key={section.id} x={section.x} y={section.y} draggable
// //             onClick={() => setSectionId(section.id)}
// //                                onDragStart={(e) => { handleDragStart(e,section.id); setSelectedId(section.id); }}
// //                                onDragMove={(e) => handleDragMove(e,section.id)}
// //                                onDragEnd={(e) => handleDragEnd(e,section.id)}>
// //               <Rect width={section.width} height={section.height} fill="" stroke="black" strokeWidth={2} 
// //               />
// //               {section.items.map((item) => (
// //                  <Rect
// //                  key={item.id}
// //                  id={item.id}
// //                  x={item.x}
// //                  y={item.y}
// //                  width={item.width}
// //                  height={item.height}
// //                  fill={item.fill}
// //                  stroke={item.stroke}
// //                  strokeWidth={item.strokeWidth}
// //                  draggable
// //                  onClick={() => (setSelectedId(item.id) , setSectionId(section.id))}
// //                  onTap={() => setSelectedId(item.id)}
// //                  onDragStart={(e) => { handleItemDragStart(e, item.id,section.id); setSelectedId(item.id); }}
// //                  onDragMove={(e) => handleItemDragMove(e, item.id,section.id)}
// //                  onDragEnd={(e) => handleItemDragEnd(e, item.id,section.id)}
// //                  perfectDrawEnabled={false}
// //                />
// //               ))}
// //             </Group>
// //           ))}


// //           {/* {items.map((item) => {
// //             if (item.type === 'box') {
// //               return (
// //                 <Rect
// //                   key={item.id}
// //                   id={item.id}
// //                   x={item.x}
// //                   y={item.y}
// //                   width={item.width}
// //                   height={item.height}
// //                   fill={item.fill}
// //                   stroke={item.stroke}
// //                   strokeWidth={item.strokeWidth}
// //                   draggable
// //                   onClick={() => setSelectedId(item.id)}
// //                   onTap={() => setSelectedId(item.id)}
// //                  // onDragStart={(e) => { handleItemDragStart(e, item.id,sectionId); setSelectedId(item.id); }}
// //                  // onDragMove={(e) => handleItemDragMove(e, item.id,sectionId)}
// //                  // onDragEnd={(e) => handleItemDragEnd(e, item.id,sectionId)}
// //                   perfectDrawEnabled={false}
// //                 />
// //               );
// //             } 
// //             //Add to switch case
// //             else if (item.type === 'text') {
// //               return (
// //                 <Text
// //                   key={item.id}
// //                   id={item.id}
// //                   x={item.x}
// //                   y={item.y}
// //                   width={item.width}
// //                   height={item.height}
// //                   text={item.text}
// //                   fontSize={item.fontSize}
// //                   fontStyle={item.fontStyle}
// //                   fontFamily={item.fontFamily}
// //                   fill={item.fill}
// //                   align={item.align}
// //                   padding={item.padding}
// //                   backgroundFill={item.backgroundFill}
// //                   draggable
// //                   onClick={() => setSelectedId(item.id)}
// //                   onTap={() => setSelectedId(item.id)}
// //                  // onDragStart={(e) => { handleItemDragStart(e, item.id,sectionId); setSelectedId(item.id); }}
// //                  // onDragMove={(e) => handleItemDragMove(e, item.id,sectionId)}
// //                  // onDragEnd={(e) => handleItemDragEnd(e, item.id,sectionId)}
// //                   textDecoration={item.textDecoration}
// //                   perfectDrawEnabled={false}
// //                 />
// //               );
// //             } else if (item.type === 'image') {
// //               return (
// //                 <URLImage
// //                   key={item.id}
// //                   id={item.id}
// //                   x={item.x}
// //                   y={item.y}
// //                   width={item.width}
// //                   height={item.height}
// //                   src={item.src}
// //                   draggable
// //                   onClick={() => setSelectedId(item.id)}
// //                   onTap={() => setSelectedId(item.id)}
// //                  // onDragStart={(e) => { handleItemDragStart(e, item.id,sectionId); setSelectedId(item.id); }}
// //                  // onDragMove={(e) => handleItemDragMove(e, item.id,sectionId)}
// //                  // onDragEnd={(e) => handleItemDragEnd(e, item.id,sectionId)}
// //                   perfectDrawEnabled={false}
// //                 />
// //               );
// //             }
// //             return null;
// //           })} */}
// //           <Transformer
// //             ref={transformerRef}
// //             boundBoxFunc={(oldBox, newBox) => {
// //               const totalCellWidth = cellWidth + gutterWidth;
// //               const colSpan = Math.round((newBox.width + gutterWidth) / totalCellWidth);
// //               const snappedWidth = colSpan * cellWidth + (colSpan - 1) * gutterWidth;
// //               const rowSpan = Math.round(newBox.height / cellHeight);
// //               const snappedHeight = rowSpan * cellHeight;
// //               const minWidth = cellWidth;
// //               const minHeight = cellHeight;
// //               const maxWidth = stageSize.width;
// //               const maxHeight = stageSize.height;
// //               return {
// //                 ...newBox,
// //                 width: Math.max(minWidth, Math.min(maxWidth, snappedWidth)),
// //                 height: Math.max(minHeight, Math.min(maxHeight, snappedHeight)),
// //               };
// //             }}
// //             onTransformEnd={handleTransformEnd}
// //           />
// //         </Layer>
// //       </Stage>
// //     </div>
// //   );
// // };

// // export default WorkbenchCanvas;
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
  selectedId,
  setSelectedId,
  handleItemDragEnd,
  cellWidth,
  cellHeight,
  gutterWidth,
  transformerRef,
  handleTransformEnd,
  handleItemDragStart,
  handleItemDragMove,
  sections,
  setSectionId,
  handleDragStart,
  handleDragEnd,
  handleDragMove,
  sectionId,
  columns,
  rows,
  hideGrid,       // New prop to control grid visibility
  hideBackground, // New prop to control background visibility
}) => {
  const [draggingItem, setDraggingItem] = useState(false);

  const gridLines = getGridLines(
    columns,rows,
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

    for (const section of sections) {
      const item = section.items.find(i => i.id === selectedId);
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
  }, [selectedId, sections]);
  
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const container = document.querySelector('.workbench-container');
    if (!container || !stageRef.current) return;
  
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
  
    // Directly adjust the stage size using the ref
    stageRef.current.width(Math.max(stageSize.width, containerWidth));
    stageRef.current.height(Math.max(stageSize.height, containerHeight));
  }, [zoomLevel, stageSize]);
  


  return (
    <div className="workbench-container" style={{border: '2px solid black' }}>
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
        {!hideBackground && (
          <Rect x={0} y={0} width={stageSize.width} height={stageSize.height} fill="gray" 
          onClick={() => setSelectedId(null)}
          onTap={() => setSelectedId(null)} />
        )}
        {!hideGrid && gridLines}

          {sections.map((section) => (
            <Group
            key={section.id}
            id={section.id}  // ✅ Make sure this matches 'section-<timestamp>'
            x={section.x}
            y={section.y}
            draggable={!draggingItem}
            onDragStart={(e) => !draggingItem && handleDragStart(e, section.id)}
            onDragMove={(e) => !draggingItem && handleDragMove(e, section.id)}
            onDragEnd={(e) => !draggingItem && handleDragEnd(e, section.id)}
            onClick={() => setSectionId(section.id)}
            onTap={() => setSectionId(section.id)}
          >
          
              {!hideBackground && (
                 <Rect width={section.width} height={section.height} fill="" stroke="red" strokeWidth={2} 
                 onTap={(e) => {
                  transformerRef.current?.nodes([]);
                  transformerRef.current?.getLayer()?.batchDraw();
                  setSelectedId(section.id);
                }}
                onClick={(e) => {
                  transformerRef.current?.nodes([]);
                  transformerRef.current?.getLayer()?.batchDraw();
                  setSelectedId(section.id);
                }}
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
                    padding={item.padding}
                    textDecoration={item.textDecoration}
                    draggable
                    onClick={() => {
                      setSelectedId(item.id);
                      setSectionId(section.id);
                    }}
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
                      setDraggingItem(true); // Prevent section movement
                      handleItemDragStart(e, item.id, section.id);
                      setSelectedId(item.id);
                    }}
                    onDragMove={(e) => handleItemDragMove(e, item.id, section.id)}
                    onDragEnd={(e) => {
                      setDraggingItem(false); // Re-enable section movement
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
            rotateEnabled={false} 
            boundBoxFunc={(oldBox, newBox) => {
              if (!selectedId || !sectionId) return oldBox;
            
              const section = sections.find(sec => sec.id === sectionId);
              if (!section) return oldBox;
            
              const selectedItem = section.items.find(i => i.id === selectedId);
              if (!selectedItem) return oldBox;
            
              const otherItems = section.items.filter(i => i.id !== selectedId);
              console.log("section : - ",section,"new box : -",newBox, "old box : -",oldBox);
            
              // Section boundaries
              const sectionLeft = section.x;
              const sectionRight = section.x + section.width;
              const sectionTop = section.y;
              const sectionBottom = section.y + section.height;
            
              // Grid calculations
              const totalCellWidth = cellWidth + gutterWidth;
              const newGridX = Math.round((newBox.x - section.x) / totalCellWidth);
              const newGridY = Math.round((newBox.y - section.y) / cellHeight);
              const colSpan = Math.max(1, Math.round((newBox.width + gutterWidth) / totalCellWidth));
              const rowSpan = Math.max(1, Math.round(newBox.height / cellHeight));
              //console.log("colSpan : -",colSpan,"rowSpan : -",rowSpan);
              const snappedWidth = colSpan * cellWidth + (colSpan - 1) * gutterWidth;
              const snappedHeight = rowSpan * cellHeight;
            
              let canExpandLeft = true, canExpandRight = true, canExpandTop = true, canExpandBottom = true;
            
              // **Check for collisions**
              otherItems.forEach(item => {
                console.log("otheritem : -",item);
                const itemGridX = Math.round((item.x) / totalCellWidth);
                const itemGridY = Math.round((item.y) / cellHeight);
                const itemColSpan = Math.round(item.width / totalCellWidth);
                const itemRowSpan = Math.round(item.height / cellHeight);
            
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
            
              // **Adjust Left Expansion** (Move `x` position left)
              const adjustedX = canExpandLeft
                ? Math.max(sectionLeft, section.x + newGridX * totalCellWidth)
                : section.x + selectedItem.gridX * totalCellWidth;
            
              // **Adjust Top Expansion** (Move `y` position up)
              const adjustedY = canExpandTop
                ? Math.max(sectionTop, section.y + newGridY * cellHeight)
                : section.y + selectedItem.gridY * cellHeight;
            
              // **Width & Height Adjustments**
              const adjustedWidth = canExpandRight
                ? Math.min(snappedWidth, sectionRight - adjustedX)
                : selectedItem.sizeInfo.cols * totalCellWidth - gutterWidth;
            
              const adjustedHeight = canExpandBottom
                ? Math.min(snappedHeight, sectionBottom - adjustedY)
                : selectedItem.sizeInfo.rows * cellHeight;
            
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
              handleTransformEnd(e);
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default WorkbenchCanvas;




// import React from 'react';
// import { Stage, Layer, Rect, Text, Transformer, Group } from 'react-konva';
// import URLImage from '../atoms/URLImage';
// import { getGridLines } from '../../utils/gridHelpers';

// const WorkbenchCanvas = ({
//   stageSize,
//   stageScale,
//   toolMode,
//   handleWheel,
//   stageRef,
//   items,
//   selectedId,
//   setSelectedId,
//   handleItemDragEnd,
//   cellWidth,
//   cellHeight,
//   gutterWidth,
//   transformerRef,
//   setItems,
//   handleTransformEnd,
//   handleItemDragStart,
//   handleItemDragMove,
//   sections,
//   setSectionId,
//   handleDragStart,
//   handleDragEnd,
//   handleDragMove,
// }) => {
//   // Build grid lines using the helper
//   const gridLines = getGridLines(
//     stageSize.width,
//     stageSize.height,
//     cellWidth,
//     cellHeight,
//     gutterWidth,
//     { grays: ['#202124', '#3c4043', '#5f6368', '#dadce0', '#f1f3f4'] }
//   );

//   return (
//     <div className="workbench-container" style={{ border: '2px solid black' }}>
//       <Stage
//         ref={stageRef}
//         width={stageSize.width}
//         height={stageSize.height}
//         scaleX={stageScale}
//         scaleY={stageScale}
//         draggable={toolMode === 'hand'}
//         onWheel={handleWheel}
//         onClick={(e) => {
//           if (toolMode === 'pointer' && e.target === e.target.getStage()) {
//             setSelectedId(null);
//           }
//         }}
//         className="konva-stage"
//       >
//         <Layer>
//           <Rect x={0} y={0} width={stageSize.width} height={stageSize.height} fill="gray" />
//           {gridLines}


//           {sections.map((section) => (
//             <Group key={section.id} x={section.x} y={section.y} draggable
//             onClick={() => setSectionId(section.id)}
//                                onDragStart={(e) => { handleDragStart(e,section.id); setSelectedId(section.id); }}
//                                onDragMove={(e) => handleDragMove(e,section.id)}
//                                onDragEnd={(e) => handleDragEnd(e,section.id)}>
//               <Rect width={section.width} height={section.height} fill="" stroke="black" strokeWidth={2} 
//               />
//               {section.items.map((item) => (
//                  <Rect
//                  key={item.id}
//                  id={item.id}
//                  x={item.x}
//                  y={item.y}
//                  width={item.width}
//                  height={item.height}
//                  fill={item.fill}
//                  stroke={item.stroke}
//                  strokeWidth={item.strokeWidth}
//                  draggable
//                  onClick={() => (setSelectedId(item.id) , setSectionId(section.id))}
//                  onTap={() => setSelectedId(item.id)}
//                  onDragStart={(e) => { handleItemDragStart(e, item.id,section.id); setSelectedId(item.id); }}
//                  onDragMove={(e) => handleItemDragMove(e, item.id,section.id)}
//                  onDragEnd={(e) => handleItemDragEnd(e, item.id,section.id)}
//                  perfectDrawEnabled={false}
//                />
//               ))}
//             </Group>
//           ))}


//           {/* {items.map((item) => {
//             if (item.type === 'box') {
//               return (
//                 <Rect
//                   key={item.id}
//                   id={item.id}
//                   x={item.x}
//                   y={item.y}
//                   width={item.width}
//                   height={item.height}
//                   fill={item.fill}
//                   stroke={item.stroke}
//                   strokeWidth={item.strokeWidth}
//                   draggable
//                   onClick={() => setSelectedId(item.id)}
//                   onTap={() => setSelectedId(item.id)}
//                  // onDragStart={(e) => { handleItemDragStart(e, item.id,sectionId); setSelectedId(item.id); }}
//                  // onDragMove={(e) => handleItemDragMove(e, item.id,sectionId)}
//                  // onDragEnd={(e) => handleItemDragEnd(e, item.id,sectionId)}
//                   perfectDrawEnabled={false}
//                 />
//               );
//             } 
//             //Add to switch case
//             else if (item.type === 'text') {
//               return (
//                 <Text
//                   key={item.id}
//                   id={item.id}
//                   x={item.x}
//                   y={item.y}
//                   width={item.width}
//                   height={item.height}
//                   text={item.text}
//                   fontSize={item.fontSize}
//                   fontStyle={item.fontStyle}
//                   fontFamily={item.fontFamily}
//                   fill={item.fill}
//                   align={item.align}
//                   padding={item.padding}
//                   backgroundFill={item.backgroundFill}
//                   draggable
//                   onClick={() => setSelectedId(item.id)}
//                   onTap={() => setSelectedId(item.id)}
//                  // onDragStart={(e) => { handleItemDragStart(e, item.id,sectionId); setSelectedId(item.id); }}
//                  // onDragMove={(e) => handleItemDragMove(e, item.id,sectionId)}
//                  // onDragEnd={(e) => handleItemDragEnd(e, item.id,sectionId)}
//                   textDecoration={item.textDecoration}
//                   perfectDrawEnabled={false}
//                 />
//               );
//             } else if (item.type === 'image') {
//               return (
//                 <URLImage
//                   key={item.id}
//                   id={item.id}
//                   x={item.x}
//                   y={item.y}
//                   width={item.width}
//                   height={item.height}
//                   src={item.src}
//                   draggable
//                   onClick={() => setSelectedId(item.id)}
//                   onTap={() => setSelectedId(item.id)}
//                  // onDragStart={(e) => { handleItemDragStart(e, item.id,sectionId); setSelectedId(item.id); }}
//                  // onDragMove={(e) => handleItemDragMove(e, item.id,sectionId)}
//                  // onDragEnd={(e) => handleItemDragEnd(e, item.id,sectionId)}
//                   perfectDrawEnabled={false}
//                 />
//               );
//             }
//             return null;
//           })} */}
//           <Transformer
//             ref={transformerRef}
//             boundBoxFunc={(oldBox, newBox) => {
//               const totalCellWidth = cellWidth + gutterWidth;
//               const colSpan = Math.round((newBox.width + gutterWidth) / totalCellWidth);
//               const snappedWidth = colSpan * cellWidth + (colSpan - 1) * gutterWidth;
//               const rowSpan = Math.round(newBox.height / cellHeight);
//               const snappedHeight = rowSpan * cellHeight;
//               const minWidth = cellWidth;
//               const minHeight = cellHeight;
//               const maxWidth = stageSize.width;
//               const maxHeight = stageSize.height;
//               return {
//                 ...newBox,
//                 width: Math.max(minWidth, Math.min(maxWidth, snappedWidth)),
//                 height: Math.max(minHeight, Math.min(maxHeight, snappedHeight)),
//               };
//             }}
//             onTransformEnd={handleTransformEnd}
//           />
//         </Layer>
//       </Stage>
//     </div>
//   );
// };

// export default WorkbenchCanvas;
