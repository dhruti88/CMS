import express from "express";
import { saveUser, getAllUsers } from "../controllers/userController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import { logger, errorLogger } from "../utils/logger.js"

const router = express.Router();

router.post("/save", verifyFirebaseToken, saveUser); // Protect save user route
router.get("/users", verifyFirebaseToken, getAllUsers); // Protect get users route

export default router;
