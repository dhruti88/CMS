import React, { useState } from "react";
import { TextField, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import CustomButton from "./button/CustomButton";

const SelectionBar = ({ onSearch }) => {
  const [city, setCity] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taskStatus, setTaskStatus] = useState("");
  const [title, setTitle] = useState("");
  const [layoutType, setLayoutType] = useState("");
  const [rows, setRows] = useState("");
  const [cols, setCols] = useState("");


  const handleSearch = () => {
    onSearch({ city, dueDate, taskStatus, title, layoutType, rows, cols });
  };

  return (
    <div className="selection-bar">
      <FormControl>
        <InputLabel sx={{ background: "#f1f3f4", px: 0.5 }}>City</InputLabel>
        <Select value={city} onChange={(e) => setCity(e.target.value)}>
          <MenuItem value="New York">New York</MenuItem>
          <MenuItem value="Los Angeles">Los Angeles</MenuItem>
          <MenuItem value="Chicago">Chicago</MenuItem>
        </Select>
      </FormControl>

      {/* Due Date with dd-mm-yyyy conversion */}
      <TextField type="date"/>

      <FormControl>
        <InputLabel sx={{ background: "#f1f3f4", px: 0.5 }}>Status</InputLabel>
        <Select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)}>
          <MenuItem value="In Progress">In Progress</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
        </Select>
      </FormControl>

      <FormControl>
        <InputLabel sx={{ background: "#f1f3f4", px: 0.5 }}>Layout Type</InputLabel>
        <Select value={layoutType} onChange={(e) => setLayoutType(e.target.value)}>
          <MenuItem value="Page">Page</MenuItem>
          <MenuItem value="Section">Section</MenuItem>
        </Select>
      </FormControl>

{/* Rows Input */}
<TextField 
  label="Rows" 
  type="number" 
  value={rows} 
  onChange={(e) => setRows(e.target.value)} 
  sx={{ width: "50px" }} 
/>

{/* Cols Input */}
<TextField 
  label="Cols" 
  type="number" 
  value={cols} 
  onChange={(e) => setCols(e.target.value)} 
  sx={{ width: "50px" }} 
/>



      <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />

      <CustomButton onClick={handleSearch} sx={{ width: "120px" }}>Search</CustomButton>
    </div>
  );
};

export default SelectionBar;
