import React, { useContext } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import {
  Upload,
  Save,
  Search,
  PanTool,
  Mouse,
  ZoomIn,
  ZoomOut,
  PictureAsPdf,
  Refresh,
} from '@mui/icons-material';
import LoadLayoutAndSection from './LoadLayoutAndSection';
import '../../styles/WorkBench.css';
import { bufferToBase64 } from '../molecules/imageUtils.jsx';
import AvatarGroup from '@mui/material/AvatarGroup';
import Badge from '@mui/material/Badge';
import EditableTitle from '../molecules/EditableTitle.jsx';
import { WorkbenchContext } from '../../context/WorkbenchContext';

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
  },
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

const WorkbenchActions = () => {
  const workbenchProps = useContext(WorkbenchContext);

  const handleExport = () => {
    workbenchProps.setHideGrid(true);
    workbenchProps.setHideBackground(true);
    workbenchProps.setSelectedId(null);
    setTimeout(() => {
      workbenchProps.exportToCMYKPDF();
      workbenchProps.setHideGrid(false);
      workbenchProps.setHideBackground(false);
    }, 1000);
  };

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

  const profileImageSrc = workbenchProps.userProfilePic
    ? bufferToBase64(workbenchProps.userProfilePic)
    : '/default-avatar.png';

  return (
    <div className="workbench-header">
      <EditableTitle
        layoutTitle={workbenchProps.layoutTitle}
        setLayoutTitle={workbenchProps.setLayoutTitle}
      />

      {/* User Info Display */}
      <Tooltip title={`Logged in as: ${workbenchProps.userID}`}>
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
              transform: 'translateY(-1px)',
            },
          }}
        >
          <span
            style={{
              color: 'black',
              marginRight: '4px',
              fontSize: '0.9em',
            }}
          >
            You:
          </span>
          {formatUserDisplay(workbenchProps.userID)}
        </Typography>
      </Tooltip>

      <Stack direction="row" spacing={2} alignItems="center">
        <AvatarGroup max={4} sx={{ marginRight: 2 }}>
          {workbenchProps.activeEditors.map((editor) => (
            <Tooltip
              key={editor.id}
              title={
                editor.id === workbenchProps.userID
                  ? `You (${editor.id})`
                  : `Editor: ${editor.id}`
              }
            >
              <OnlineBadge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
              >
                <StyledAvatar
                  alt={editor.id}
                  src={
                    editor.profilePic
                      ? bufferToBase64(editor.profilePic)
                      : '/default-avatar.png'
                  }
                  sx={
                    editor.id === workbenchProps.userID
                      ? {
                        border: '2px solid #44b700',
                        boxShadow: '0 0 10px rgba(68, 183, 0, 0.5)',
                      }
                      : {}
                  }
                />
              </OnlineBadge>
            </Tooltip>
          ))}
        </AvatarGroup>
      </Stack>

      <div className="workbench-actions">
        {/* Toolbar Buttons */}
        <Tooltip title="Upload Canvas">
          <IconButton
            onClick={workbenchProps.uploadCanvasImage}
            className="icon-primary"
          >
            <Upload />
          </IconButton>
        </Tooltip>

        <Tooltip title="Save Layout">
          <IconButton onClick={workbenchProps.saveLayout} className="icon-primary">
            <Save />
          </IconButton>
        </Tooltip>

        <Tooltip title="Search Layout">
          <IconButton
            onClick={() => {
              workbenchProps.setShowLayoutList(true);
              workbenchProps.fetchAvailableLayouts();
            }}
            className="icon-primary"
          >
            <Search />
          </IconButton>
        </Tooltip>

        {/* Layout Selection Panel */}
        {workbenchProps.showLayoutList && (
          <LoadLayoutAndSection
            availableLayouts={workbenchProps.availableLayouts}
            loadLayoutFromSelected={workbenchProps.loadLayoutFromSelected}
            handleDeleteLayout={workbenchProps.handleDeleteLayout}
            setShowLayoutList={workbenchProps.setShowLayoutList}
            isDeleting={workbenchProps.isDeleting}
            mode="layout" // Handles layout selection
            layoutType={workbenchProps.layoutType}
          />
        )}

        <Tooltip
          title={
            workbenchProps.toolMode === 'pointer'
              ? 'Switch to Hand Tool'
              : 'Switch to Pointer Tool'
          }
        >
          <IconButton
            onClick={() =>
              workbenchProps.setToolMode(
                workbenchProps.toolMode === 'pointer' ? 'hand' : 'pointer'
              )
            }
            className="icon-primary"
          >
            {workbenchProps.toolMode === 'pointer' ? <PanTool /> : <Mouse />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Zoom In">
          <IconButton onClick={() => workbenchProps.zoomBy(1.1)} className="icon-primary">
            <ZoomIn />
          </IconButton>
        </Tooltip>

        <Tooltip title="Zoom Out">
          <IconButton onClick={() => workbenchProps.zoomBy(1 / 1.1)} className="icon-primary">
            <ZoomOut />
          </IconButton>
        </Tooltip>

        <Tooltip title="Download as PDF">
          <IconButton onClick={handleExport} className="icon-primary">
            <PictureAsPdf />
          </IconButton>
        </Tooltip>

        <Tooltip title="Reset View">
          <IconButton onClick={workbenchProps.fitStageToScreen} className="icon-primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

export default WorkbenchActions;
