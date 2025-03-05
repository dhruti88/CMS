import React from "react";
import { Rect } from "react-konva"; // Import Rect properly

// Compute grid cell dimensions
export const getCellDimensions = (stageWidth, stageHeight, columns, rows, gutterWidth) => {
  const cellWidth = (stageWidth - (columns - 1) * gutterWidth) / columns;
  const cellHeight = stageHeight / rows;
  return { cellWidth, cellHeight };
};

// Create grid lines for the Konva stage
export const getGridLines = (stageWidth, stageHeight, cellWidth, cellHeight, gutterWidth, colors) => {
  const lines = [];
  
  // Get column and row count
  const columns = columnsFromWidth(stageWidth, cellWidth, gutterWidth);
  const rows = rowsFromHeight(stageHeight, cellHeight);
  
  // Vertical grid lines (gutters)
  for (let i = 1; i <= columns; i++) {
    const x = i * cellWidth + (i - 1) * gutterWidth;
    lines.push(
      <Rect
        key={`v-gutter-${i}`}
        x={x}
        y={0}
        width={gutterWidth}
        height={stageHeight}
        fill={colors?.grays?.[3] || "#ccc"}
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
        fill={colors?.grays?.[4] || "#ddd"}
      />
    );
  }
  return lines;
};

// Helpers to calculate number of columns and rows from dimensions
const columnsFromWidth = (width, cellWidth, gutterWidth) => {
  return Math.floor(width / (cellWidth + gutterWidth)); // Adjust for gutters
};

const rowsFromHeight = (height, cellHeight) => {
  return Math.floor(height / cellHeight);
};
