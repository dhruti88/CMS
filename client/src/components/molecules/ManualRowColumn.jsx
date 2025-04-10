import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "../atoms/Button";

const ManualRowColumn = ({
  buttonText = "Add",
  title,
  sectionId = null,
  type = "",
  handleClick,
}) => {

  const [manualRows, setManualRows] = useState(1);
  const [manualCols, setManualCols] = useState(1);

  const handleAddManualSection = () => {
    if (manualRows > 0 && manualCols > 0) {
      const size = {
        cols: manualCols,
        rows: manualRows,
        label: `${manualCols}×${manualRows}`
      };
      if (sectionId === null)
        handleClick(size);
      else
        handleClick(sectionId, size, type);
    }
  };



  return (
    <div>
      <h4>{title}</h4>
      <div className="manual-section" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <TextField
          label="Rows"
          type="number"
          value={manualRows || 1}
          onChange={(e) => setManualRows(Math.max(1, parseInt(e.target.value) || 1))}
          size="small"
        />
        <TextField
          label="Columns"
          type="number"
          value={manualCols || 1}
          onChange={(e) => setManualCols(Math.max(1, parseInt(e.target.value) || 1))}
          size="small"
        />
        <Button
          onClick={handleAddManualSection}
          className="size-button"
          sx={{
            width: "100px",
            cursor: "pointer",
            borderRadius: "5px",
            fontSize: "16px"
          }}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default ManualRowColumn;
