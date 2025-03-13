import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Layout from './Layout.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('combined'));

mongoose
  .connect('mongodb+srv://manavpandya:Manav1234@cluster0.f4e2s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.post('/api/layout', async (req, res) => {
  try {
    const { userId, title, items, gridSettings, previousLayouts } = req.body;
    console.log('[SERVER] Saving layout:', { title, gridSettings, previousLayouts });
    let layout = await Layout.findOne({ userId, title });
    if (layout) {
      layout.items = items;
      layout.gridSettings = gridSettings;
      layout.previousLayouts = previousLayouts;
      layout.updatedAt = new Date();
      await layout.save();
      console.log('[SERVER] Updated existing layout');
    } else {
      layout = new Layout({ userId, title, items, gridSettings, previousLayouts });
      await layout.save();
      console.log('[SERVER] Saved new layout');
    }
    res.json({ success: true, layout });
  } catch (error) {
    console.error('[SERVER] Error saving layout:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/layout', async (req, res) => {
  try {
    const { userId, title } = req.query;
    const layout = await Layout.findOne({ userId, title });
    console.log('[SERVER] Loaded layout:', layout);
    if (!layout) {
      return res.status(404).json({ error: 'Layout not found' });
    }
    res.json({ layout });
  } catch (error) {
    console.error('[SERVER] Error loading layout:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/layouts', async (req, res) => {
  try {
    const { userId } = req.query;
    const layouts = await Layout.find({ userId });
    console.log('[SERVER] Fetched layouts:', layouts.length);
    res.json({ layouts });
  } catch (error) {
    console.error('[SERVER] Error fetching layouts:', error);
    res.status(500).json({ error: error.message });
  }
});

const storage = multer.diskStorage({
  destination: path.join(__dirname, 'uploads'),
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.post('/upload', upload.single('image'), (req, res) => {
  console.log('[SERVER] Upload route called, file info:', req.file);
  if (!req.file) {
    console.error('[SERVER] No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ message: 'File uploaded successfully', filePath: `/uploads/${req.file.filename}` });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[SERVER] Server running on port ${PORT}`);
});
