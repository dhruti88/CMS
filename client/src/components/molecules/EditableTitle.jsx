import { TextField, Typography } from "@mui/material";
import { useState } from "react";

const EditableTitle = ({ layoutTitle, setLayoutTitle }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleTitleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (layoutTitle.trim() === "") {
      setLayoutTitle("Untitled Layout");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBlur();
    }
  };

  return isEditing ? (
    <TextField
      value={layoutTitle}
      onChange={(e) => setLayoutTitle(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      variant="standard"
      autoFocus
      inputProps={{
        style: {
          fontSize: "1.5rem",
          fontWeight: "bold",
          textAlign: "left",
        },
      }}
      sx={{
        width: "150px",
        ".MuiInputBase-input": {
          color: "var(--primary-color)",
        },
      }}
    />
  ) : (
    <Typography
      variant="h5"
      onClick={handleTitleClick}
      sx={{
        width: "150px", // ✅ consistent width
        fontWeight: "bold",
        color: "var(--primary-color)",
        padding: "10px 0",
        textAlign: "left",
        cursor: "pointer",
        userSelect: "none",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis", // optional, for longer titles
      }}
    >
      {layoutTitle}
    </Typography>
  );
};

export default EditableTitle;
