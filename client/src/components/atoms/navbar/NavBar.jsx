import { useLocation, useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import colors from "../../../theme/colors";
import ProfileMenu from "../../molecules/ProfileMenu";
import { SERVER_URL } from "../../../Urls";
import { logout } from "../../../utils/logout";
import CustomButton from "../button/CustomButton"; // Import your custom button

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  const handleWorkbenchClick = () => {
    if (location.pathname === "/page") {
      const confirmReload = window.confirm("Are you sure you want to reload the page?");
      if (confirmReload) {
        window.location.reload();
      }
    } else {
      navigate("/page");
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("res : -", response.data);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      await logout();
      // navigate("/signin"); // Redirect to Sign-In page if token is invalid
    }
  };

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
            {/* Only call handleWorkbenchClick here */}
            <CustomButton onClick={handleWorkbenchClick}>Workbench</CustomButton>
            <CustomButton onClick={() => navigate("/history")}>History</CustomButton>
            <ProfileMenu user={user} token={token} /> {/* Pass user and token to ProfileMenu */}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
