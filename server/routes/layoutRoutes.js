import express from "express";

import { saveLayout, getLayout, getAllLayouts, deleteLayout, uploadImage  } from "../controllers/layoutController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import { logger, errorLogger } from "../utils/logger.js";

const router = express.Router();

router.post("/layout", verifyFirebaseToken, saveLayout); 
router.get("/layout", verifyFirebaseToken, getLayout);
router.get("/layouts", verifyFirebaseToken, getAllLayouts);
router.delete("/layout", verifyFirebaseToken, deleteLayout);
router.post("/upload", uploadImage);


  

export default router;
