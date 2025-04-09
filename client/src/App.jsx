import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInPage from "./components/pages/SignInPage";
import SignUp from './SignUp';
import HomePage from "./components/pages/HomePage"; // Create this for the main app/dashboard
import LandingPage from './components/pages/LandingPage';
import WorkBench from './components/pages/WorkBench';
import WorkPage from './components/pages/WorkPage';
import ProtectedRoute from './hooks/ProtectedRoute';
import PublicRoute from './hooks/PublicRoute';
import { AuthProvider } from './context/AuthContext';
import MyLayouts from './components/pages/MyLayouts'
import LayoutHistory from './components/pages/LayoutHistory'
import Navbar from './components/atoms/navbar/NavBar';
import ErrorBoundary from './components/pages/ErrorBoundry';
import { WorkbenchProvider } from './context/WorkbenchContext';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
      <WorkbenchProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={
              <PublicRoute>
                <ErrorBoundary>
                  <LandingPage/>
                </ErrorBoundary>
              </PublicRoute>
            }/>
            <Route path="/signin" element={
              <PublicRoute>
                <ErrorBoundary>
                  <SignInPage />
                </ErrorBoundary>
              </PublicRoute>
            }/>
            <Route path="/signup" element={
              <ErrorBoundary>
                <SignUp />
              </ErrorBoundary>
            }/>
            <Route path="/page" element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <WorkBench/>
                </ErrorBoundary>
              </ProtectedRoute>
               }/>
               <Route path="/page/:layoutid" element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <WorkPage/>
                </ErrorBoundary>
              </ProtectedRoute>
               }/>
               <Route path="/home" element={
                 <ProtectedRoute>
                   <ErrorBoundary>
                     <HomePage />
                   </ErrorBoundary>
                 </ProtectedRoute>
               }/>
               <Route path='/mylayout' element={
                 <ProtectedRoute>
                   <ErrorBoundary>
                     <MyLayouts />
                   </ErrorBoundary>
                 </ProtectedRoute>
               }/> 
               <Route path='/section' element={
                 <ProtectedRoute>
                   <ErrorBoundary>
                     <WorkBench/>
                   </ErrorBoundary>
                 </ProtectedRoute>
               }/>
               <Route path='/history' element={
                 <ProtectedRoute>
                   <ErrorBoundary>
                     <LayoutHistory />
                   </ErrorBoundary>
                 </ProtectedRoute>
               }/> 
             </Routes>
           </Router>
           </WorkbenchProvider>
         </AuthProvider>
       </ErrorBoundary>
     );

    }

    export default App;