import React, { useState, useEffect } from "react";
import { Avatar, Popover, Typography, Button, Box, TextField } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ProfileIcon from "../atoms/Profile/ProfileIcon";
import axios from "axios";
import { getAuth, signOut } from "firebase/auth";
import { logout } from "../../utils/logout";
import { SERVER_URL } from "../../Urls";
const ProfileMenu = ({ user, token }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.name || "Username",
    email: user?.email || "user@example.com",
    photoURL: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch Profile Image
  const fetchProfileImage = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/users/profile-image/${user.uid}`, {
        responseType: 'blob', // Get image as blob
        headers: {
            Authorization: `Bearer ${token}`
          },
      });

      const imageURL = URL.createObjectURL(response.data); // Convert blob to URL
      setProfileData((prev) => ({ ...prev, photoURL: imageURL }));
    } catch (error) {
      console.error("Error fetching profile image:", error);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchProfileImage();
    }
  }, [user?.uid]);

  // Handle Popover Open/Close
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => {
    setAnchorEl(null);
    setEditMode(false);
  };

  const open = Boolean(anchorEl);

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    const imageURL = URL.createObjectURL(file);
    setProfileData((prev) => ({ ...prev, photoURL: imageURL }));
  };

  // Handle Username Change
  const handleUsernameChange = (e) => {
    setProfileData((prev) => ({ ...prev, username: e.target.value }));
  };

  // Handle Profile Update API
  const handleSave = async () => {
    const formData = new FormData();
    formData.append("username", profileData.username);
    if (selectedFile) {
      formData.append("photo", selectedFile);
    }

    try {
      await axios.put(`${SERVER_URL}/api/users/update`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Profile updated successfully!");
      fetchProfileImage(); // Fetch updated image
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error?.response?.data?.error || "Failed to update profile.");
    }
  };

const auth = getAuth();

const handleLogout = async () => {
  try {
    await logout(); // Firebase sign out
    alert("Successfully logged out!");
  } catch (error) {
    alert("Failed to log out. Please try again.");
  }
};

  return (
    <>
      <ProfileIcon size={50} src={profileData.photoURL} onClick={handleClick} />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { mt: 1, width: 320, borderRadius: 4, p: 3 } } }}
      >
        <Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar src={profileData.photoURL} sx={{ width: 60, height: 60 }}>
              {!profileData.photoURL && <AccountCircleIcon />}
            </Avatar>
            <Box>
              {editMode ? (
                <TextField
                  value={profileData.username}
                  onChange={handleUsernameChange}
                  size="small"
                  label="Username"
                />
              ) : (
                <Typography variant="h6">{profileData.username}</Typography>
              )}
              <Typography color="text.secondary">{profileData.email}</Typography>
            </Box>
          </Box>

          {editMode && (
            <>
              <input
                accept="image/*"
                type="file"
                id="profile-image-upload"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
              <label htmlFor="profile-image-upload">
                <Button component="span" sx={{ mt: 2 }}>
                  Upload New Photo
                </Button>
              </label>
            </>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            {editMode ? (
              <>
                <Button variant="contained" onClick={handleSave}>Save</Button>
                <Button variant="text" onClick={() => setEditMode(false)}>Cancel</Button>
              </>
            ) : (
              <Button variant="outlined" onClick={() => setEditMode(true)}>Edit Profile</Button>
            )}
            <Button variant="text" color="error" onClick={handleLogout}>Logout</Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default ProfileMenu;
