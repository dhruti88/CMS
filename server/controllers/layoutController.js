import Layout from "../models/Layout.js";
import { logger, errorLogger } from "../utils/logger.js"
import fs from "fs"
import multer from "multer"
import path from 'path';
import { logLayoutAction } from "./historyController.js";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { invalidateCache } from '../redis.js';



export const saveLayout = async (req, res) => {
  try {
    const { userId, title,sections, gridSettings, layouttype, city, duedate, status } = req.body;
    console.log('Saving layout with items:', sections);
    // Try to find an existing layout for the user and title
    let layout = await Layout.findOne({ userId, title });
    if (layout) {
      // Update existing layout
      layout.sections = sections;
      layout.gridSettings = gridSettings;
      layout.updatedAt = new Date();
      await logLayoutAction(layout, 'updated', userId);
      await layout.save();

    } else {
      // Create new layout document
      layout = new Layout({ userId, title, sections, gridSettings,layouttype, city, publishingdate: duedate, taskstatus: status });

      await logLayoutAction(layout, 'created', userId);
      await layout.save();

    }

        // // Invalidate related caches
        await invalidateCache('layouts:*');
        await invalidateCache(`my-layouts:${userId}:*`);
        await invalidateCache(`single-layout:${userId}:*`);

    res.json({ success: true, layout });
  } catch (error) {
    console.error('Error saving layout:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getLayout = async (req, res) => {
    try {
      const { userId, title } = req.query;
      const layout = await Layout.findOne({ userId, title });
      console.log('Loaded layout:', layout);
      if (!layout) {
        return res.status(404).json({ error: 'Layout not found' });
      }
      res.json({ layout });
    } catch (error) {
      console.error('Error loading layout:', error);
      res.status(500).json({ error: error.message });
    }
  };

export const getAllLayouts = async (req, res) => {
    try {
      const { userId } = req.query;
      const layouts = await Layout.find();
      res.json({ layouts });
    } catch (error) {
      console.error('Error fetching layouts:', error);
      res.status(500).json({ error: error.message });
    }
  };

  export const getMyLayouts = async (req, res) => {
    try {
      // Get userId from the verified token (added by middleware)
      const userId = req.user.uid;
  
      if (!userId) {
        return res.status(400).json({ error: "User ID not provided or invalid" });
      }
  
      // Fetch layouts created by the current authenticated user
      const layouts = await Layout.find({ userId });
  
      if (!layouts || layouts.length === 0) {
        return res.status(404).json({ error: "No layouts found for this user" });
      }
  
      res.status(200).json({ layouts });
    } catch (error) {
      console.error("Error fetching layouts:", error);
      res.status(500).json({ error: error.message });
    }
  };
  

// export const deleteLayout = async (req, res) => {
//     try {
//       const { userId, title } = req.query;
//       const layout = await Layout.findOneAndDelete({title });
//       console.log('Deleted layout:', layout);
//       res.json({ success: true, layout });
//     } catch (error) {
//       console.error('Error deleting layout:', error);
//       res.status(500).json({ error: error.message });
//     }
//   };

export const deleteLayout = async (req, res) => {
    try {
      const { _id } = req.query;
      
      // Log the incoming request details for debugging
      console.log('Delete Request Received:', { 
        method: req.method, 
        _id, 
        fullQuery: req.query 
      });
      
      // Validate that title is provided
      if (!_id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Layout title is required' 
        });
      }
    
      const layout = await Layout.findOneAndDelete({ _id });
      await logLayoutAction(layout, 'deleted', req.user.uid);
      // Check if a layout was actually deleted
      if (!layout) {
        return res.status(404).json({ 
          success: false, 
          message: 'Layout not found' 
        });
      }


    //    // Invalidate related caches
    await invalidateCache('layouts:*');
    await invalidateCache(`my-layouts:${req.user.uid}:*`);
    await invalidateCache(`single-layout:${req.user.uid}:*`);

      console.log('Deleted layout:', layout);
      res.status(200).json({ success: true, layout });
    } catch (error) {
      console.error('Error deleting layout:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  };




// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'uploads'),
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

export const uploadImage = (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error('Error during file upload:', err);
            return res.status(500).json({ error: 'File upload failed' });
        }
        console.log('Upload route called, file info:', req.file);
        if (!req.file) {
            console.error('No file uploaded');
            return res.status(400).json({ error: 'No file uploaded' });
        }
        res.json({ message: 'File uploaded successfully', filePath: `/uploads/${req.file.filename}` });
    });
};    