import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInPage from "./components/pages/SignInPage";
import SignUp from './SignUp';
import HomePage from "./components/pages/HomePage"; // Create this for the main app/dashboard
import LandingPage from './components/pages/LandingPage';
import MyLayout from './components/pages/MyLayouts/MyLayout';
// import GridEditor from './components/pages/GridEditor';
import WorkBench from './components/pages/WorkBench';
import ProtectedRoute from './hooks/ProtectedRoute';
import PublicRoute from './hooks/PublicRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={
          <PublicRoute><LandingPage/></PublicRoute>}/>
        <Route path="/signin" element={
           <PublicRoute><SignInPage /></PublicRoute>} />
        <Route path="/signup" element={
          <PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/workbench" element={
          <ProtectedRoute><WorkBench/></ProtectedRoute>} />
        <Route path="/home" element={
          <ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path='/mylayout' element={<MyLayout />} /> 
         {/* <Route path="/grideditor" element={<GridEditor/>} /> */}
       
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
