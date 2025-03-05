// Optional helpers for handling transformation and drag events

export const handleTransformEndHelper = (node, cellWidth, gutterWidth, cellHeight, stageSize) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const newWidth = node.width() * scaleX;
    const newHeight = node.height() * scaleY;
    const totalCellWidth = cellWidth + gutterWidth;
    const colSpan = Math.round((newWidth + gutterWidth) / totalCellWidth);
    const snappedWidth = colSpan * cellWidth + (colSpan - 1) * gutterWidth;
    const rowSpan = Math.round(newHeight / cellHeight);
    const snappedHeight = rowSpan * cellHeight;
    return { snappedWidth, snappedHeight, colSpan, rowSpan };
  };
  
  export const handleDragEndHelper = (shape, cellWidth, gutterWidth, cellHeight, columns, rows, sizeInfo) => {
    const totalCellWidth = cellWidth + gutterWidth;
    const colIndex = Math.round(shape.x() / totalCellWidth);
    const rowIndex = Math.round(shape.y() / cellHeight);
    const maxColIndex = columns - (sizeInfo?.cols || 1);
    const boundedColIndex = Math.min(Math.max(0, colIndex), maxColIndex);
    const boundedX = boundedColIndex * totalCellWidth;
    const maxRowIndex = rows - (sizeInfo?.rows || 1);
    const boundedRowIndex = Math.min(Math.max(0, rowIndex), maxRowIndex);
    const boundedY = boundedRowIndex * cellHeight;
    return { boundedX, boundedY };
  };
  