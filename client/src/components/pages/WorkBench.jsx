import React, { useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import SetupModal from '../organisms/SetupModal';
import { WorkbenchContext } from '../../context/WorkbenchContext';
import { Box, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled component for the container
const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  background: theme.palette.background.default,
}));

const LoadingBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 3,
  padding: 4,
  borderRadius: 2,
  backgroundColor: 'background.paper',
  boxShadow: theme.shadows[3],
}));

// Loading component
const LoadingState2 = () => (
  <LoadingContainer>
    <LoadingBox>
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h5" sx={{ fontWeight: 500 }}>
        Loading layout...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Please wait while we prepare your workspace
      </Typography>
    </LoadingBox>
  </LoadingContainer>
);

const WorkBench = () => {
  const navigate = useNavigate(); // Initialize navigate function
  const workbenchProps = useContext(WorkbenchContext);

  useEffect(() => {
    if (!workbenchProps.showSetupForm && localStorage.getItem('layoutid')) {
      console.log("sf", workbenchProps.showSetupForm);
      const layoutid = localStorage.getItem('layoutid');
      setTimeout(() => navigate(`/page/${layoutid}`), 100);
    }
  }, [workbenchProps.showSetupForm, navigate]);

  return (
    <div className="cms-container">
      {workbenchProps.showSetupForm ? (
        <SetupModal />
      ) : (
        <div>
          {LoadingState2()}
        </div>
      )}
    </div>
  );
};

export default WorkBench;
