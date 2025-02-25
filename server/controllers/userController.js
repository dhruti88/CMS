import User from "../models/user.js";


//Save new user into database
export const saveUser = async (req, res) => {
  const { uid, name, email, photoURL } = req.body;

  try {
    let user = await User.findOne({ uid });

    if (!user) {
      user = new User({ uid, name, email, photoURL });
      await user.save();
      console.log("New user saved:", user);
    } else {
      console.log("User already exists:", user);
      res.status(400).json({ message: "User already exists:" });
      return;
    }

    res.status(200).json({ message: "User saved successfully into db", user });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all users from database
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    res.status(200).json(users); // Send users as JSON response
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

