import React, { useContext } from 'react';
import WorkbenchTemplate from '../templates/WorkbenchTemplate';
import { WorkbenchContext, WorkbenchProvider } from '../../context/WorkbenchContext';
import '../../styles/WorkBench.css'
import ErrorBoundary from './ErrorBoundry.jsx';
const WorkBench = () => {
  return (
    // <ErrorBoundary>
    // <WorkbenchProvider>
      <WorkbenchTemplate/>
    // </WorkbenchProvider>
    // </ErrorBoundary>
  );
};

export default WorkBench;