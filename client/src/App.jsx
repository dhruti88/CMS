import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInPage from "./components/pages/SignInPage";
import SignUp from './SignUp';
import HomePage from "./components/pages/HomePage"; // Create this for the main app/dashboard
import LandingPage from './components/pages/LandingPage';
import WorkBench from './components/pages/WorkBench';
import GridEditor from './components/pages/GridEditor';
import MyLayout from './components/pages/MyLayouts/MyLayout';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage/>}/>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/workbench" element={<WorkBench/>} />
        <Route path="/grideditor" element={<GridEditor/>} />
        <Route path='/mylayout' element={<MyLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
