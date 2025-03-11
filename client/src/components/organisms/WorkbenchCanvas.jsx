
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
  sections,
  setSectionId,
  handleDragStart,
  handleDragEnd,
  handleDragMove,
}) => {
  const [draggingItem, setDraggingItem] = useState(false); // Track if an item is being dragged

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
        <Layer>
          <Rect x={0} y={0} width={stageSize.width} height={stageSize.height} fill="gray" />
          {gridLines}

          {sections.map((section) => (
            <Group
              key={section.id}
              x={section.x}
              y={section.y}
              draggable={!draggingItem} // Prevent section dragging when an item is dragged
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
              <Rect width={section.width} height={section.height} fill="" stroke="red" strokeWidth={2} 
              onTap={() => setSectionId(section.id)}
              onClick={() => setSectionId(section.id)}/>

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
                  backgroundFill={item.backgroundFill}

                  textDecoration={item.textDecoration}
                  draggable
      onClick={() => {
        setSelectedId(item.id);
        setSectionId(section.id);
      }}
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
