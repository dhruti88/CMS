import { WorkbenchProvider } from "../../context/WorkbenchContext";
import WorkBench from "./WorkBench";

const WorkBenchWrapper = () => {

  return (
    <WorkbenchProvider>
      <WorkBench />
    </WorkbenchProvider>
  );
};

export default WorkBenchWrapper;
