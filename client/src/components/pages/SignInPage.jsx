import { Typography, Card, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import navigate
import SignIn from '../../SignIn.jsx';
import CustomButton from '../atoms/button/CustomButton.jsx'; // Ensure this is imported
import colors from '../../theme/colors.jsx';

const SignInPage = () => {
  const navigate = useNavigate(); // Initialize navigate function

  return (
    <div className="landing-container">
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#ffffff",
          paddingTop: "80px",
        }}
      >

<nav className="navbar">
      <Typography variant="h4" fontWeight="bold" align="left">
          <span className="text-black">Page</span>
          <span style={{ color: colors.primary }}>Craft</span>
        </Typography>
        <div className="nav-button">
          <CustomButton onClick={() => navigate("/signup")}>Sign up</CustomButton>
        </div>
      </nav>


        <SignIn />
      </Container>
    </div>
  );
};

export default SignInPage;
