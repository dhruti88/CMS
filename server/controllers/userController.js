import User from "../models/user.js";
import { logger, errorLogger } from "../utils/logger.js"

//Save new user into database
export const saveUser = async (req, res) => {
  logger.info(`POST /save - Request from ${req.user.email}`);
  const { uid, name, email, photoURL } = req.body;

  try {
    let user = await User.findOne({ uid });

    if (!user) {
      user = new User({ uid, name, email, photoURL });
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

