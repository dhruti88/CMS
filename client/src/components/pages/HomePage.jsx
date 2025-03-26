import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/atoms/navbar/NavBar";
import ProfileMenu from "../molecules/ProfileMenu";

const HomePage = () => {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  // Fetch user info from the backend
  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data); // Set the user data
      console.log("User data fetched:", response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserData();
    } else {
      console.error("No token found. Please sign in.");
    }
  }, [token]);

  return (
    <div>
      <Navbar>
        {user ? (
          <ProfileMenu user={user} token={token} />
        ) : (
          <p>Loading user data...</p>
        )}
      </Navbar>
    </div>
  );
};

export default HomePage;
