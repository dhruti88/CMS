import { useNavigate } from "react-router-dom";
import { Typography, CardContent, Card, Box, Container } from '@mui/material'
import CustomButton from "../components/button/CustomButton";
import "tailwindcss";
import colors from "../theme/colors";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center text-white relative">
       <nav className="absolute top-0 right-0 w-full flex justify-between items-center p-5 px-10">

      <div className="ml-auto">
            <CustomButton onClick={() => navigate("/signin")}>Sign in</CustomButton>
        </div>
       </nav>

      <div className="text-center mt-10 bg-gray-100 p-30 mb-50 w-200">
        <Typography
            variant="h4"
            fontWeight="bold"
            align="center"
        >
            <span style={{ color: "black" }}>Page</span>
            <span style={{ color:  colors.primary  }}>Craft</span>
            </Typography>
        <Typography
            variant="h6"
            align="center"
        >
            <p className="text-black mt-2">Fresh new way to create and manage your content!</p>
      
        </Typography>

        <div className="mt-3">
      
         <CustomButton onClick={() => navigate("/signin")}>Get Started!</CustomButton>

        </div>
       
      </div>

      <div className="absolute bottom-0 left-0 w-full mt-5" style={{ backgroundColor: colors.primary }}>
        <svg viewBox="0 0 1440 320" className="w-full">
          <path
            fill="#ffffff"
            d="M0,160L48,149.3C96,139,192,117,288,106.7C384,96,480,96,576,117.3C672,139,768,181,864,192C960,203,1056,181,1152,165.3C1248,149,1344,139,1392,133.3L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>

   

    </div>
  );
};

export default LandingPage;
