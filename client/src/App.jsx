import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInPage from "./components/pages/SignInPage";
import HomePage from "./components/pages/HomePage"; // Create this for the main app/dashboard
import LandingPage from './components/pages/LandingPage';
import WorkBench from './components/pages/WorkBench';
import GridEditor from './components/pages/GridEditor'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage/>}/>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/workbench" element={<WorkBench/>} />
        <Route path="/grideditor" element={<GridEditor/>} />
      </Routes>
    </Router>
  );
}

export default App;
