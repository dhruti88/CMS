import { useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";
import CustomButton from "../atoms/button/CustomButton";
import colors from "../../theme/colors";
import "../../styles/LandingPage.css" // Import CSS file
import Navbar from "../atoms/navbar/NavBar";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
       <Navbar>
        <CustomButton onClick={() => navigate("/signin")}>Sign in</CustomButton>
      </Navbar>

      {/* Main Content */}
      <div className="content-box">
        <Typography variant="h4" fontWeight="bold" align="center">
          <span className="text-black">Page</span>
          <span style={{ color: colors.primary }}>Craft</span>
        </Typography>
        <Typography variant="h6" align="center" className="subtext">
          Fresh new way to create and manage your content!
        </Typography>

        <div className="button-container">
          <CustomButton onClick={() => navigate("/signin")}>Get Started!</CustomButton>
        </div>
      </div>

      {/* Bottom Decorative Wave */}
      <div className="wave-container">
        <svg viewBox="0 0 1440 320" className="wave-svg">
          <path
            fill="#2563EB"
            fill-opacity="1" d="M0,192L48,176C96,160,192,128,288,122.7C384,117,480,139,576,160C672,181,768,203,864,218.7C960,235,1056,245,1152,240C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default LandingPage;
