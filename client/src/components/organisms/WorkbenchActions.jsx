import React from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { 
  Upload, Save, Search, PanTool, Mouse, ZoomIn, 
  ZoomOut, PictureAsPdf, Refresh, Delete, Edit, Close 
} from '@mui/icons-material';
import LoadLayoutAndSection from './LoadLayoutAndSection';
import '../../styles/WorkBench.css';
import { bufferToBase64 } from '../molecules/imageUtils.jsx';
import AvatarGroup from '@mui/material/AvatarGroup';
import Badge from '@mui/material/Badge';


// Update the StyledAvatar component
const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 35,
  height: 35,
  border: '2px solid var(--primary-color)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    opacity: 0.8,
    transform: 'scale(1.1)',
  }
}));

// Add new styled component for online badge
const OnlineBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));



const WorkbenchActions = ({
  uploadCanvasImage,
  saveLayout,
  fetchAvailableLayouts,
  toolMode,
  setToolMode,
  zoomBy,
  layoutTitle,
  showLayoutList,
  setShowLayoutList,
  availableLayouts,
  loadLayoutFromSelected, 
  exportToCMYKPDF,
  fitStageToScreen,
  setHideGrid,
  setHideBackground,
  setSelectedId,
  handleDeleteLayout,
  isDeleting,
  userID,
  userProfilePic,
  activeEditors,
}) => {

  const handleExport = () => {
    setHideGrid(true);
    setHideBackground(true);
    setSelectedId(null);
    setTimeout(() => {
      exportToCMYKPDF();
      setHideGrid(false);
      setHideBackground(false);
    }, 1000);
  };
  // Helper function to extract initials from a user ID string.
  
  const formatUserDisplay = (userID) => {
    // First try to extract initials if there are spaces
    const initials = userID
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  
    // If no spaces found, take first 3 chars and add ellipsis
    if (initials.length <= 1) {
      return userID.slice(0, 3) + '...';
    }
    
    return initials;
  };

  const profileImageSrc = userProfilePic ? bufferToBase64(userProfilePic) : '/default-avatar.png';
  return (
    <div className="workbench-header">
      {/* Title with better UI */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: "bold",
          color: "var(--primary-color)",
          padding: "10px 0",
          textAlign: "center",
        }}
      >
        {layoutTitle}
      </Typography>

     
    {/* Add user info display with enhanced styling */}
<Tooltip title={`Logged in as: ${userID}`}>
  <Typography
    variant="subtitle1"
    sx={{
      color: 'var(--primary-color)',
      padding: '8px 12px',
      textAlign: 'right',
      cursor: 'default',
      fontWeight: 600,
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
      borderRadius: '16px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
        transform: 'translateY(-1px)'
      }
    }}
  >
    <span style={{ 
      color: 'black', 
      marginRight: '4px',
      fontSize: '0.9em' 
    }}>
      You:
    </span>
    {formatUserDisplay(userID)}
  </Typography>
</Tooltip>

<Stack direction="row" spacing={2} alignItems="center">
        <AvatarGroup max={4} sx={{ marginRight: 2 }}>
          {activeEditors.map((editor) => (
            <Tooltip 
              key={editor.id} 
              title={editor.id === userID ? `You (${editor.id})` : `Editor: ${editor.id}`}
            >
              <OnlineBadge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
              >
                <StyledAvatar
                  alt={editor.id}
                  src={editor.profilePic ? bufferToBase64(editor.profilePic) : '/default-avatar.png'}
                  sx={editor.id === userID ? { 
                    border: '2px solid #44b700',
                    boxShadow: '0 0 10px rgba(68, 183, 0, 0.5)'
                  } : {}}
                />
              </OnlineBadge>
            </Tooltip>
          ))}
        </AvatarGroup>
      </Stack>

      <div className="workbench-actions">
        {/* Toolbar Buttons */}
        <Tooltip title="Upload Canvas">
          <IconButton onClick={uploadCanvasImage} className="icon-primary">
            <Upload />
          </IconButton>
        </Tooltip>

        <Tooltip title="Save Layout">
          <IconButton onClick={saveLayout} className="icon-primary">
            <Save />
          </IconButton>
        </Tooltip>

        <Tooltip title="Search Layout">
          <IconButton onClick={() => {setShowLayoutList(true),fetchAvailableLayouts()}} className="icon-primary">
            <Search />
          </IconButton>
        </Tooltip>

        {/* Layout Selection Panel */}
        {showLayoutList && (
  <LoadLayoutAndSection 
    availableLayouts={availableLayouts}
    loadLayoutFromSelected={loadLayoutFromSelected}
    handleDeleteLayout={handleDeleteLayout}
    setShowLayoutList={setShowLayoutList}
    isDeleting={isDeleting}
    mode="layout" // Handles layout selection
  />
)}

        <Tooltip title={toolMode === 'pointer' ? "Switch to Hand Tool" : "Switch to Pointer Tool"}>
          <IconButton onClick={() => setToolMode(toolMode === 'pointer' ? 'hand' : 'pointer')} className="icon-primary">
            {toolMode === 'pointer' ? <PanTool /> : <Mouse />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Zoom In">
          <IconButton onClick={() => zoomBy(1.1)} className="icon-primary">
            <ZoomIn />
          </IconButton>
        </Tooltip>

        <Tooltip title="Zoom Out">
          <IconButton onClick={() => zoomBy(1 / 1.1)} className="icon-primary">
            <ZoomOut />
          </IconButton>
        </Tooltip>

        <Tooltip title="Download as PDF">
          <IconButton onClick={handleExport} className="icon-primary">
            <PictureAsPdf />
          </IconButton>
        </Tooltip>

        <Tooltip title="Reset View">
          <IconButton onClick={fitStageToScreen} className="icon-primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

export default WorkbenchActions;
