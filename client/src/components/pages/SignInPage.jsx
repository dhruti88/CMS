import { Typography, Card, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import navigate
import SignIn from '../../SignIn.jsx';
import CustomButton from '../atoms/button/CustomButton.jsx'; // Ensure this is imported
import colors from '../../theme/colors.jsx';
import Navbar from '../atoms/navbar/NavBar.jsx';

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

        <SignIn />
      </Container>
    </div>
  );
};

export default SignInPage;
