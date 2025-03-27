import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/atoms/navbar/NavBar";
import ProfileMenu from "../molecules/ProfileMenu";
import { useNavigate } from "react-router-dom";
import { SERVER_URL } from "../../Urls";
import { logout } from "../../utils/logout";

const HomePage = () => {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if(token) {
      fetchUserData();
    }
  }, [token]);

  // Fetch user info from the backend
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
      console.log("User data fetched:", response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      await logout(); // Logout on error
      // if (error.response?.status === 403) {
      //   console.warn("Token expired or invalid. Logging out...");
      //   localStorage.removeItem("token");
      //   navigate("/signin"); // Redirect to Sign-In page
      // }
    }
  };

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
