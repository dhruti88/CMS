import express from "express";
import { cacheMiddleware } from '../redis.js';
import { saveLayout, getLayout, getAllLayouts, deleteLayout, uploadImage, getMyLayouts  } from "../controllers/layoutController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import { logger, errorLogger } from "../utils/logger.js";
import { histlayout } from "../controllers/historyController.js";

const router = express.Router();

router.post("/layout", verifyFirebaseToken, saveLayout); 
router.get("/layout", verifyFirebaseToken, cacheMiddleware('layouts', 3600),  getLayout);
router.get("/my-layouts", verifyFirebaseToken,cacheMiddleware('layouts', 3600),  getMyLayouts);
router.get("/layouts", verifyFirebaseToken,cacheMiddleware('layouts', 3600), getAllLayouts);
router.delete("/layout", verifyFirebaseToken, deleteLayout);
router.post("/upload", uploadImage);
router.post("/layout-history", histlayout);


  

export default router;
