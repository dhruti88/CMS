import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInPage from "./pages/SignInPage";
import HomePage from "./pages/HomePage"; // Create this for the main app/dashboard
import LandingPage from './pages/LandingPage';
import WorkBench from './pages/workbench/WorkBench';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage/>}/>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/workbench" element={<WorkBench/>} />
      </Routes>
    </Router>
  );
}

export default App;
