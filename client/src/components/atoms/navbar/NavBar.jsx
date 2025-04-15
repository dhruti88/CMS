import { useLocation, useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import colors from "../../../theme/colors";
import ProfileMenu from "../../molecules/ProfileMenu";
import { SERVER_URL } from "../../../Urls";
import { logout } from "../../../utils/logout";
import CustomButton from "../button/CustomButton"; 
import { WorkbenchContext } from "../../../context/WorkbenchContext";
import "../../../styles/LandingPage.css";
import { IconButton, Tooltip } from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";



const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");
  const workbenchProps = useContext(WorkbenchContext);
  const [theme, setTheme] = useState(
    'light' || localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

  // / Function to toggle dark mode
  const toggleDarkMode = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    // Apply theme to document element
    document.documentElement.setAttribute('data-theme', theme);

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    };

    // Add event listener
    mediaQuery.addEventListener('change', handleChange);

    // Clean up
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  
  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  const handleWorkbenchClick = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    
    // If path starts with "page" and has more than one segment, it means there's an id or extra segment
    if (pathSegments[0] === "page" && pathSegments.length >= 1) {
      const confirmReload = window.confirm("Are you sure you want to create new workbench?");
      if (confirmReload) {
        localStorage.removeItem("layoutid");
        window.location.href = "/page";
      }
    } else {
      const layoutID = localStorage.getItem("layoutid");
      console.log("layoutID : -", layoutID);
      if (layoutID) {
        navigate(`/page/${layoutID}`);
      }
      else  
      {
        //workbenchProps.setShowSetupForm(true);
        navigate("/page");
      }
    }
  };

  const fetchUserData = async () => {
    try {
      console.log(SERVER_URL+"fetching user data");
      const response = await axios.get(`${SERVER_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("res : -", response.data);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      await logout();
    }
  };

  const isOnLayoutPage = /^\/page\/[^/]+$/.test(location.pathname);

  return (
    <nav className="navbar">
      <Typography
        variant="h4"
        fontWeight="bold"
        align="left"
        onClick={() => navigate("/")}
        sx={{
          cursor: "pointer",
          userSelect: "none",
          display: "inline-block",
        }}
      >
        <span style={{ color: "var(--text-color)" }}>Page</span>
        <span style={{ color: colors.primary }}>Craft</span>
      </Typography>
  
      <div className="nav-buttons">
        {!token ? (
          location.pathname === "/signin" ? (
            <CustomButton onClick={() => navigate("/signup")}>Sign Up</CustomButton>
          ) : location.pathname === "/signup" ? (
            <CustomButton onClick={() => navigate("/signin")}>Sign In</CustomButton>
          ) : null
        ) : (
          <>
            <CustomButton onClick={() => navigate("/home")}>Home</CustomButton>
            <CustomButton onClick={() => navigate("/mylayout")}>My Layouts</CustomButton>
            <CustomButton onClick={handleWorkbenchClick}>
              {isOnLayoutPage ? "New Design" : "Workbench"}
            </CustomButton>
            <CustomButton onClick={() => navigate("/history")}>History</CustomButton>
             {/* MUI Dark mode toggle */}
             <Tooltip title="Toggle dark mode">
              <IconButton onClick={toggleDarkMode} color="inherit" sx={{ marginRight : '20px'}} >
                {theme === "dark" ?  <LightMode /> :<DarkMode />}
              </IconButton>
            </Tooltip>
            <ProfileMenu user={user} token={token} />
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
