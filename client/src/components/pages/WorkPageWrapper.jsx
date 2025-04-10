import { useParams } from "react-router-dom";
import { WorkbenchProvider } from "../../context/WorkbenchContext";
import WorkPage from "./WorkPage";

const WorkPageWrapper = () => {
  const { layoutid } = useParams();

  return (
    <WorkbenchProvider layoutId={layoutid}>
      <WorkPage />
    </WorkbenchProvider>
  );
};

export default WorkPageWrapper;
