import React, { useContext } from 'react';
import WorkbenchTemplate from '../templates/WorkbenchTemplate';
import { WorkbenchContext, WorkbenchProvider } from '../../context/WorkbenchContext';
import '../../styles/WorkBench.css'

const WorkBench = () => {
  return (
    <WorkbenchProvider>
      <WorkbenchTemplate/>
    </WorkbenchProvider>
  );
};

export default WorkBench;
