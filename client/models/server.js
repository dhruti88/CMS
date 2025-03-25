// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Layout from './Layout.js';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('combined'));

// Connect to MongoDB
mongoose
  .connect('mongodb+srv://manavpandya:Manav1234@cluster0.f4e2s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Layout endpoints

// Save or update a layout
app.post('/api/layout', async (req, res) => {
  try {
    const { userId, title,sections, gridSettings } = req.body;
    console.log('Saving layout with items:', sections);
    // Try to find an existing layout for the user and title
    let layout = await Layout.findOne({ userId, title });
    if (layout) {
      // Update existing layout
      layout.sections = sections;
      layout.gridSettings = gridSettings;
      layout.updatedAt = new Date();
      await layout.save();
    } else {
      // Create new layout document
      layout = new Layout({ userId, title, sections, gridSettings });
      await layout.save();
    }
    res.json({ success: true, layout });
  } catch (error) {
    console.error('Error saving layout:', error);
    res.status(500).json({ error: error.message });
  }
});

// Load a layout by userId and title (passed as query parameters)
app.get('/api/layout', async (req, res) => {
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
});

// List all layouts for a given user
app.get('/api/layouts', async (req, res) => {
  try {
    const { userId } = req.query;
    const layouts = await Layout.find({ userId });
    res.json({ layouts });
  } catch (error) {
    console.error('Error fetching layouts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'uploads'),
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Upload endpoint for canvas images
app.post('/upload', upload.single('image'), (req, res) => {
  console.log('Upload route called, file info:', req.file);
  if (!req.file) {
    console.error('No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ message: 'File uploaded successfully', filePath: `/uploads/${req.file.filename}` });
});

// Serve static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});