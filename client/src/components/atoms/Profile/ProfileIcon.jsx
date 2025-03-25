import React from "react";
import { Avatar, IconButton } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const ProfileIcon = ({ src, size = 40, onClick }) => {
  return (
    <IconButton onClick={onClick} sx={{ padding: 0 }}>
      <Avatar
        src={src}
        sx={{
          width: size,
          height: size,
          backgroundColor: "#f0f0f0",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
        }}
      >
        {!src && <AccountCircleIcon fontSize="large" sx={{ color: "#777" }} />}
      </Avatar>
    </IconButton>
  );
};

export default ProfileIcon;
