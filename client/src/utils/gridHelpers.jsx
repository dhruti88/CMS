import React from "react";
import { Rect } from "react-konva"; // Import Rect properly

// Compute grid cell dimensions
const cellWidth = 100;
const cellHeight = 50;
export const getCellDimensions = () => {
  return { cellWidth, cellHeight };
};

// Create grid lines for the Konva stage
export const getGridLines = (columns, rows,stageWidth,stageHeight, gutterWidth, colors) => {
  const lines = [];
  
  // Vertical grid lines (gutters)
  for (let i = 1; i < columns; i++) {
    const x = i * cellWidth + (i - 1) * gutterWidth;
    lines.push(
      <Rect
        key={`v-gutter-${i}`}
        x={x}
        y={0}
        width={gutterWidth}
        height={stageHeight}
        fill="white"
        stroke="black"
        strokeWidth={1}
      />
    );
  }

  // Horizontal grid lines
  for (let i = 1; i < rows; i++) {
    lines.push(
      <Rect
        key={`hline-${i}`}
        x={0}
        y={i * cellHeight}
        width={stageWidth}
        height={1}
        fill="white"
      />
    );
  }
  return lines;
};