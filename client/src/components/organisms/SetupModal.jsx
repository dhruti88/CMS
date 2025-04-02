import React from 'react';
import { TextField, MenuItem, Select, FormControl, InputLabel, Button, Typography,Grid, Box } from "@mui/material";


const SetupModal = ({
  layoutTitle,
  setLayoutTitle,
  columns,
  setColumns,
  rows,
  setRows,
  gutterWidth,
  setGutterWidth,
  setShowSetupForm,
  city,
  setCity,
  dueDate,
  setDueDate,
  taskStatus,
  setTaskStatus,
  layoutType,
  setLayoutType,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSetupForm(false);
  };


// const [city, setCity] = useState("");
// const [dueDate, setDueDate] = useState("");
// const [taskStatus, setTaskStatus] = useState("");
// const [layoutType, setLayoutType] = useState("");

  return (
    <Box 
  sx={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Optional: Dark overlay effect
  }}
>
    <Box 
      sx={{
        width: 450,
        p: 3,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <Typography variant="h6" fontWeight="bold" mb={2} textAlign="center">
        Layout Details
      </Typography>
      
      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <Grid container spacing={2}>
          {/* Layout Title */}
          <Grid item xs={12}>
            <TextField 
              label="Layout Title" 
              fullWidth 
              value={layoutTitle} 
              onChange={(e) => setLayoutTitle(e.target.value)} 
            />
          </Grid>

          {/* City & Due Date */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ background: "#ffffff", px: 0.5 }} >City</InputLabel>
              <Select value={city} onChange={(e) => setCity(e.target.value)}>
                <MenuItem value="Pune">Pune</MenuItem>
                <MenuItem value="Ahmedabad">Ahmedabad</MenuItem>
                <MenuItem value="Mumbai">Mumbai</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField 
              label="Publishing Date" 
              type="date" 
              fullWidth 
              InputLabelProps={{ shrink: true }} 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)} 
            />
          </Grid>

          {/* Task Status & Layout Type */}
          {/* <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ background: "#ffffff", px: 0.5 }} >Task Status</InputLabel>
              <Select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)}>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid> */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ background: "#ffffff", px: 0.5 }}>Layout Type</InputLabel>
              <Select value={layoutType} onChange={(e) => setLayoutType(e.target.value)}>
                <MenuItem value="Page">Page</MenuItem>
                <MenuItem value="Section">Section</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Rows & Columns */}
          <Grid item xs={6}>
            <TextField 
              label="Rows" 
              type="number" 
              fullWidth 
              inputProps={{ min: 1 }} 
              value={rows} 
              onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 12))} 
            />
          </Grid>
          <Grid item xs={6}>
            <TextField 
              label="Columns" 
              type="number" 
              fullWidth 
              inputProps={{ min: 1 }} 
              value={columns} 
              onChange={(e) => setColumns(Math.max(1, parseInt(e.target.value) || 1))} 
            />
          </Grid>

          {/* Gutter Width & Title */}
          <Grid item xs={6}>
            <TextField 
              label="Gutter Width" 
              type="number" 
              fullWidth 
              inputProps={{ min: 0 }} 
              value={gutterWidth} 
              onChange={(e) => setGutterWidth(Math.max(0, parseInt(e.target.value) || 10))} 
            />
          </Grid>
          {/* <Grid item xs={6}>
            <TextField 
              label="Title" 
              fullWidth 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            />
          </Grid> */}

          {/* Submit Button */}
          <Grid item xs={12} display="flex" justifyContent="center">
            <Button 
              type="submit" 
              variant="contained" 
              sx={{
                mt: 2,
                px: 3,
                py: 1,
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              Create Workbench
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
</Box>
  );
};

export default SetupModal;
