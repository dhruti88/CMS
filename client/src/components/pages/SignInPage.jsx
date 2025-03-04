import { Typography, CardContent, Card, Box, Container } from '@mui/material'
import OAuthSignInPage from "../../SignIn.jsx"

const SignInPage = () => {
  return (
    <Container maxWidth="xs"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh"
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
