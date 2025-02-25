import * as React from 'react';
import { SignInPage } from '@toolpad/core/SignInPage';
import { useTheme } from '@mui/material/styles';
import app, {auth} from './firebase/fireBaseConfig';
import {signInWithPopup, GoogleAuthProvider}  from "firebase/auth"
import { useNavigate } from "react-router-dom";
import { SERVER_URL } from './Urls';

const providers = [
  { id: 'google', name: 'Google' }
];

const signIn = async (provider, navigate) => {
    if (provider.id === "google") {
      try {
        const googleProvider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, googleProvider);
        console.log("User signed in:", result.user)

        // Get Firebase ID Token
        const idToken = await result.user.getIdToken();
        
        console.log("Bearer Token: ",idToken);
        
        // Send user data to backend
        const response = await fetch(`${SERVER_URL}/api/users/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            uid: result.user.uid,
            name: result.user.displayName, 
            email: result.user.email,
            photoURL: result.user.photoURL,
          }),
        });

        const data = await response.json();
        
        if (response.ok) {
          console.log("User stored in DB:", data);
        } else {
          console.error("Error storing user:", data);
        }
        // Redirect to Home Page after successful login
        navigate("/home");

        return { user: result.user };
      } catch (error) {
        console.error("Google Sign-In Error:", error);
        return { error: error.message };
      }
    }
  };
  
export default function OAuthSignInPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  return (
    <SignInPage signIn={(provider) => signIn(provider, navigate)} providers={providers} sx={{
    minHeight: '30vh',
  }}/>
  );
}  
