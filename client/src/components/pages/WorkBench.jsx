import React, { useContext } from 'react';
import WorkbenchTemplate from '../templates/WorkbenchTemplate';
import { WorkbenchContext, WorkbenchProvider } from '../../context/WorkbenchContext';
import '../../styles/WorkBench.css'

const WorkBenchPageContent = () => {
  const workbenchProps = useContext(WorkbenchContext);
  return <WorkbenchTemplate {...workbenchProps} />;
};

const WorkBench = () => {
  return (
    <WorkbenchProvider>
      <WorkBenchPageContent />
    </WorkbenchProvider>
  );
};

export default WorkBench;
