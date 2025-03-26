import User from "../models/user.js";
import { logger, errorLogger } from "../utils/logger.js"
import fs from "fs"

//Save new user into database
export const saveUser = async (req, res) => {
  logger.info(`POST /save - Request from ${req.user.email}`);
  const { uid, name, email, photoURL } = req.body;

  try {
    let user = await User.findOne({ uid });

    if (!user) {
      const defaultUsername = email.includes("@gmail.com") 
        ? email.split("@")[0] 
        : name;

      user = new User({ 
        uid, 
        name: defaultUsername, 
        email, 
        photoURL 
      });
      
      await user.save();
      logger.info(`New user saved: ${email}`);
      console.log("New user saved:", user);
    } else {
      logger.warn(`User already exists: ${email}`);
      console.log("User already exists:", user);
      res.status(400).json({ message: "User already exists:" });
      return;
    }

    res.status(200).json({ message: "User saved successfully into db", user });
  } catch (error) {
    errorLogger.error(`Error saving user: ${error.message}`);
    console.error("Error saving user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all users from database
export const getAllUsers = async (req, res) => {
  logger.info(`GET /users - Request from ${req.user.email}`);
  try {
    const users = await User.find(); // Fetch all users
    logger.info(`Fetched ${users.length} users from database`);
    res.status(200).json(users); // Send users as JSON response
  } catch (error) {
    errorLogger.error(`Error fetching users: ${error.message}`);
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Update user profile
export const updateUserProfile = async (req, res) => {
  logger.info(`[PUT] /api/users/update - Request from ${req.user.email}`);
  
  const { username } = req.body;
  const photoBuffer = req.file ? req.file.buffer : null; // Get image buffer from multer

  try {
    const user = await User.findOne({ uid: req.user.uid });

    if (!user) {
      logger.warn(`User not found: ${req.user.email}`);
      return res.status(404).json({ error: "User not found" });
    }

    if (username) {
      user.name = username;
    }

    if (photoBuffer) {
      user.photoURL = photoBuffer;
    }

    await user.save();

    logger.info(`User profile updated: ${req.user.email}`);
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    errorLogger.error(`Error updating user: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const { uid } = req.user; // Firebase UID from the token

    const user = await User.findOne({ uid });

    if (!user) {
      logger.warn(`User not found: ${uid}`);
      return res.status(404).json({ error: "User not found" });
    }

    logger.info(`User profile fetched: ${user.email}`);
    res.status(200).json(user);
  } catch (error) {
    errorLogger.error(`Error fetching user profile: ${error.message}`);
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getProfilePicture = async (req, res) => {
    try {
      const user = await User.findOne({ uid: req.params.uid });
      console.log(user.photoURL);
      
      if (!user || !user.photoURL) {
        return res.status(404).json({ error: "Image not found" });
      }
  
      res.set("Content-Type", "image/jpeg");
      res.send(user.photoURL);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
