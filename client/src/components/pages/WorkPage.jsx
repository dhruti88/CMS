import React, { useEffect, useContext, useState } from 'react';
import SetupModal from '../organisms/SetupModal';
import WorkbenchActions from '../organisms/WorkbenchActions';
import WorkbenchCanvas from '../organisms/WorkbenchCanvas';
import Toolbox from '../organisms/Toolbox';
import { WorkbenchContext } from '../../context/WorkbenchContext';
import CustomButton from '../atoms/button/CustomButton';
import Navbar from '../atoms/navbar/NavBar';
import { useNavigate } from 'react-router-dom';
import LoadLayoutAndSection from '../organisms/LoadLayoutAndSection';

const WorkPage = () => {
  const navigate = useNavigate();
  const workbenchProps = useContext(WorkbenchContext);
  const [targetSectionIdForReplacement, setTargetSectionIdForReplacement] = useState(null);
  const [showReplacementPanel, setShowReplacementPanel] = useState(false);

  const openReplacementPanel = async () => {
    // Check if there are sections and a section is currently selected
    if (workbenchProps.sections &&
        workbenchProps.sections.length > 0 &&
        workbenchProps.selectedId === workbenchProps.sectionId) {
      // Save the selected section ID as the target for replacement
      setTargetSectionIdForReplacement(workbenchProps.selectedId);
      // Optionally, you might trigger a fetch here if you need to update availableLayouts:
      await workbenchProps.fetchAvailableSections(); // Uncomment if needed
      // Now open the replacement panel
      setShowReplacementPanel(true);
    } else {
      console.warn("No section selected for replacement.");
    }
  };

  const handleReplaceSection = (selectedSection) => {
    // Debug: Log the function call and inputs
    console.log('handleReplaceSection called');
    console.log('selectedSection:', selectedSection);
    console.log('targetSectionIdForReplacement:', targetSectionIdForReplacement);
    console.log('Current sections:', workbenchProps.sections);

    if (typeof workbenchProps.setSections !== 'function') {
      console.error('setSections is not a function!');
      return;
    }

    // Find the target section in the current sections array
    const targetSection = workbenchProps.sections.find(sec => sec.id === targetSectionIdForReplacement);

    if (!targetSection || !selectedSection) {
      console.warn("Invalid section replacement");
      setShowReplacementPanel(false);
      return;
    }

    // Create the replacement section
    const replacementSection = {
      ...selectedSection,
      id: targetSection.id,  // Keep original ID
      x: targetSection.x,
      y: targetSection.y,
      gridX: targetSection.gridX,
      gridY: targetSection.gridY,
      // Add any other necessary properties
    };

    // Use functional update to ensure correct state update
    workbenchProps.setSections(prevSections =>
      prevSections.map(section =>
        section.id === targetSectionIdForReplacement
          ? replacementSection
          : section
      )
    );

    // Close the replacement panel
    setShowReplacementPanel(false);

    // Update selected section
    workbenchProps.setSelectedId(replacementSection.id);

    console.log('Replacement completed', replacementSection);
  };

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
        <>
          <Navbar>
            <CustomButton onClick={() => navigate("/signup")}>Sign up</CustomButton>
          </Navbar>
          <div className="workbench-container">
            <WorkbenchActions />
            <WorkbenchCanvas />
          </div>
          <Toolbox/>
          {showReplacementPanel && (
            <LoadLayoutAndSection
              availableLayouts={workbenchProps.availableLayouts}
              targetSection={workbenchProps.sections.find(sec => sec.id === targetSectionIdForReplacement)}
              onReplaceSection={handleReplaceSection}
              setShowLayoutList={setShowReplacementPanel} // Used to close panel
              mode="section" // Handles section replacement
              selectedId={workbenchProps.selectedId}
              sectionId={workbenchProps.sectionId}
            />
          )}
        </>
      )}
    </div>
  );
};

export default WorkPage;