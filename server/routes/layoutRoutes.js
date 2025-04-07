import express from "express";
import { cacheMiddleware } from '../redis.js';
import { saveLayout, getLayout, getAllLayouts, deleteLayout, uploadImage, getMyLayouts, getLayoutById  } from "../controllers/layoutController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import { logger, errorLogger } from "../utils/logger.js";
import { histlayout } from "../controllers/historyController.js";

const router = express.Router();

router.post("/layout", verifyFirebaseToken, saveLayout); 
router.get("/layout", verifyFirebaseToken, cacheMiddleware('layouts', 3600),  getLayout);
router.get("/my-layouts", verifyFirebaseToken,cacheMiddleware('layouts', 3600),  getMyLayouts);
router.get("/layouts", verifyFirebaseToken,cacheMiddleware('layouts', 3600), getAllLayouts);
router.delete("/layout", verifyFirebaseToken, deleteLayout);
router.post("/upload", verifyFirebaseToken, uploadImage);
router.post("/layout-history", verifyFirebaseToken, histlayout);
router.get('/layouts/:layoutId', verifyFirebaseToken,cacheMiddleware('layouts', 3600), getLayoutById);
// In your backend routes
router.get('/layouts/image/:id', async (req, res) => {
    try {
      const layout = await Layout.findById(req.params.id);
      if (!layout || !layout.stageImage || !layout.stageImage.data) {
        return res.status(404).send('Image not found');
      }
      
      res.set('Content-Type', layout.stageImage.contentType);
      return res.send(layout.stageImage.data);
    } catch (err) {
      return res.status(500).send(err.message);
    }
  });

export default router;
