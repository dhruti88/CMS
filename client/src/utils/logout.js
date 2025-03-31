// src/utils/auth.js
import { getAuth, signOut } from "firebase/auth";

export const logout =  async () => {
    const auth = getAuth();
  try {
    console.log("Logging out...");
    await signOut(auth); // Firebase sign out
    localStorage.removeItem("token"); // Remove token from localStorage
    window.location.href = "/signin"; // Redirect to SignIn page
  } catch (error) {
    console.error("Logout failed:", error);
    
  }
};
