import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInPage from "./components/pages/SignInPage";
import SignUp from './SignUp';
import HomePage from "./components/pages/HomePage"; // Create this for the main app/dashboard
import LandingPage from './components/pages/LandingPage';
import GridEditor from './components/pages/GridEditor';
import WorkBench from './components/pages/WorkBench';
import ProtectedRoute from './hooks/ProtectedRoute';
import PublicRoute from './hooks/PublicRoute';
import { AuthProvider } from './context/AuthContext';
import MyLayouts from './components/pages/MyLayouts'
import LayoutHistory from './components/pages/LayoutHistory'
import Navbar from './components/atoms/navbar/NavBar';

function App() {
  return (
    <AuthProvider>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={
          <PublicRoute><LandingPage/></PublicRoute>}/>
        <Route path="/signin" element={
           <PublicRoute><SignInPage /></PublicRoute>} />
        <Route path="/signup" element={
          <PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/page" element={
          <ProtectedRoute><WorkBench/></ProtectedRoute>} />
        <Route path="/home" element={
          <ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path='/mylayout' element={
          <ProtectedRoute><MyLayouts /></ProtectedRoute>} /> 
        <Route path='/section' element= {
          <ProtectedRoute><WorkBench/></ProtectedRoute>} />
        <Route path='/history' element={
          <ProtectedRoute><LayoutHistory /></ProtectedRoute>} /> 

         <Route path="/grideditor" element={<GridEditor/>} />

       
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
