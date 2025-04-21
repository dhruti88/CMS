import React, { useContext } from 'react';
import { TextField, MenuItem, Select, FormControl, InputLabel, Button, Typography, Grid, Box } from "@mui/material";
import { WorkbenchContext } from '../../context/WorkbenchContext';
import { useNavigate } from "react-router-dom";

const SetupModal = () => {
  const workbenchProps = useContext(WorkbenchContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    workbenchProps.setShowSetupForm(false);
    // if(localStorage.getItem("layoutid")) localStorage.removeItem("layoutid");
    const data = await workbenchProps.saveLayout({ e: 0 });
    console.log("workbend data", data);
    // workbenchProps.setlayoutid(data.layout._id);
    navigate(`/page/${data.layout._id}`);
    
  };

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
                value={workbenchProps.layoutTitle}
                onChange={(e) => workbenchProps.setLayoutTitle(e.target.value)}
              />
            </Grid>

            {/* City & Publishing Date */}
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ background: "#ffffff", px: 0.5 }}>City</InputLabel>
                <Select
                  value={workbenchProps.city}
                  onChange={(e) => workbenchProps.setCity(e.target.value)}
                >
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
                value={workbenchProps.dueDate}
                onChange={(e) => workbenchProps.setDueDate(e.target.value)}
              />
            </Grid>

            {/* Layout Type */}
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ background: "#ffffff", px: 0.5 }}>Layout Type</InputLabel>
                <Select
                  value={workbenchProps.layoutType}
                  onChange={(e) => workbenchProps.setLayoutType(e.target.value)}
                >
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
                value={workbenchProps.rows}
                onChange={(e) => workbenchProps.setRows(Math.max(1, parseInt(e.target.value) || 12))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Columns"
                type="number"
                fullWidth
                inputProps={{ min: 1 }}
                value={workbenchProps.columns}
                onChange={(e) => workbenchProps.setColumns(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </Grid>

            {/* Gutter Width */}
            <Grid item xs={6}>
              <TextField
                label="Gutter Width"
                type="number"
                fullWidth
                inputProps={{ min: 0 }}
                value={workbenchProps.gutterWidth}
                onChange={(e) => workbenchProps.setGutterWidth(Math.max(0, parseInt(e.target.value) || 10))}
              />
            </Grid>

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
