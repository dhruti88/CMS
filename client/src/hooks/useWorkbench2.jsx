const handleTransformEnd = (e) => {
    console.log("end : - ");
    const node = e.target;
    if (!selectedId || !sectionId) return;
  
    const section = sections.find(sec => sec.id === sectionId);
    if (!section) return;
  
    const { snappedWidth, snappedHeight, colSpan, rowSpan } = handleTransformEndHelper(
      node,
      cellWidth,
      gutterWidth,
      cellHeight,
      stageSize
    );
  
    // Compute new gridX, gridY inside section
    const newGridX = Math.round((node.x() - section.x) / (cellWidth + gutterWidth));
    const newGridY = Math.round((node.y() - section.y) / cellHeight);
  
    // Ensure grid position doesn't exceed section boundaries
    const maxGridX = (section.width - snappedWidth) / (cellWidth + gutterWidth);
    const maxGridY = (section.height - snappedHeight) / cellHeight;
  
    setSections(prevSections =>
      prevSections.map(sec =>
        sec.id === sectionId
          ? {
              ...sec,
              items: sec.items.map(item =>
                item.id === selectedId
                  ? {
                      ...item,
                      width: snappedWidth,
                      height: snappedHeight,
                      gridX: Math.max(0, Math.min(maxGridX, newGridX)),
                      gridY: Math.max(0, Math.min(maxGridY, newGridY)),
                      sizeInfo: { cols: colSpan, rows: rowSpan },
                    }
                  : item
              ),
            }
          : sec
      )
    );
  
    // Reset transformation
    node.scaleX(1);
    node.scaleY(1);
  };

  syncToYjs(newSections);