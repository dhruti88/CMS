import express from "express";
import { saveUser, getAllUsers, updateUserProfile, getUserProfile, getProfilePicture} from "../controllers/userController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import upload from  "../middleware/uploadMiddleware.js";
import { logger, errorLogger } from "../utils/logger.js";

const router = express.Router();

router.post("/save", verifyFirebaseToken, saveUser); // Protect save user route
router.get("/users", verifyFirebaseToken, getAllUsers); // Protect get users route
router.put("/update", verifyFirebaseToken, upload.single("photo"), updateUserProfile);//update user profile
router.get("/me", verifyFirebaseToken,getUserProfile);//get user profile
router.get("/profile-image/:uid",verifyFirebaseToken,getProfilePicture);//get user profile picture
  

export default router;
