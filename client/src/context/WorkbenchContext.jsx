import React, { createContext } from 'react';
import useWorkbench from '../hooks/useWorkbench';

export const WorkbenchContext = createContext();

export const WorkbenchProvider = ({ children }) => {
  const workbenchState = useWorkbench();
  return (
    <WorkbenchContext.Provider value={workbenchState}>
      {children}
    </WorkbenchContext.Provider>
  );
};