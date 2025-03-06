import { Typography, CardContent, Card, Box, Container, colors } from '@mui/material'
import OAuthSignInPage from "../../SignIn.jsx"
import { blue } from '@mui/material/colors'

const SignInPage = () => {
  return (
    <Container maxWidth={false}
        sx={{
          width:"800px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#fffff",
        }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        align="center"
      >
        <span style={{ color: "black" }}>Page</span>
        <span style={{ color: "#2563EB" }}>Craft</span>
      </Typography>

      <OAuthSignInPage />
    </Container>
  );
};

export default SignInPage;
