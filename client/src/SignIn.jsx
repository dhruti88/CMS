import * as React from 'react';
import app, {auth} from './firebase/fireBaseConfig';
import {signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword }  from "firebase/auth"
import { useNavigate } from "react-router-dom";
import { SERVER_URL } from './Urls';
import { SignInPage } from '@toolpad/core/SignInPage';
import colors from './theme/colors';
import { useEffect, useState } from "react";

const providers = [
  { id: 'google', name: 'Google' },
  { id: 'credentials', name: 'Email and Password' },
];


const signIn = async (provider, navigate, email, password) => {
    if (provider.id === "google") {
      try {
        const googleProvider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, googleProvider);

        if (!result.user.email.endsWith("@searce.com")) {
          setTimeout(()=>{
            alert("Only searce.com email addresses are allowed.");
          },1000)
          await auth.signOut(); // Sign out if domain is not allowed

          setTimeout(()=>{
            navigate("/");
          },1000)
          
          return;
        }

        console.log("User signed in:", result.user)

        // Get Firebase ID Token
        const idToken = await result.user.getIdToken();
        localStorage.setItem("token", idToken);
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

        console.log("Signed in successfully:", result.user);
        
        // Redirect to Home Page after successful login
        navigate("/home");

        return { user: result.user };
      } catch (error) {
        console.error("Google Sign-In Error:", error);
        return { error: error.message };
      }
    } else if (provider.id === "credentials") {
      try {
        if (!email || !password) {
          alert("Please enter both email and password.");
          return;
        }  

     
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const idToken = await user.getIdToken();
        localStorage.setItem("token", idToken);
        console.log("Bearer Token: ",idToken);

        //Save in database while signUP only, No need to save while signIN
        
        // const response = await fetch(`${SERVER_URL}/api/users/save`, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //     "Authorization": `Bearer ${idToken}`,
        //   },
        //   body: JSON.stringify({
        //     uid: user.uid,
        //     name: user.email.split("@")[0], 
        //     email: user.email,
        //     photoURL: "", 
        //   }),
        // });

        console.log("Signed in successfully:", user);
        navigate("/home");
        return { user };

      } catch (error) {
        console.error("Email Sign-In Error:", error);
        return { error: error.message };
      }
    }
  };
  export default function SignIn() {
    const navigate = useNavigate();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
  
    return (
      <SignInPage
        signIn={(provider) => signIn(provider, navigate, email, password)}
        providers={providers}
        slotProps={{
          form: {
            noValidate: true,
            onSubmit: (e) => e.preventDefault(), // Prevent default form submission
          },
          emailField: {
            label: "Email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            required: true,
          },
          passwordField: {
            label: "Password",
            type: "password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            required: true,
          },
          submitButton: {
            children: "Sign In",
            sx: {
              backgroundColor: colors.primary,
              '&:hover': { backgroundColor: '#1444b5' },
              marginTop: '10px',
            },
          }
        }}
        sx={{
          marginTop: '5vh',
          minHeight: '30vh',
        }}
      />
    );
  }