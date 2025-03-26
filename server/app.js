import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { logger, errorLogger } from "./utils/logger.js"; 
import userRoutes from "./routes/userRoutes.js";
import pdfRoutes from "./controllers/pdfDownload.js";
import layoutRoutes from "./routes/layoutRoutes.js";  

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: "*",
  methods: ["*"]
}));

app.use(express.json({ limit: '50mb' }));

// Log all incoming API requests
app.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.url}`);
  next();
});

// Database Connection
const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME;
console.log("MONGO_URL:", process.env.MONGO_URL);

mongoose.connect(MONGO_URL, {
    dbName: DB_NAME
}).then(() => {
    logger.info("Connected to Database"); 
    console.log("Connected to Database");
}).catch((err) => {
    errorLogger.error(`Database Connection Error: ${err.message}`);
    console.log('Error while connecting to Database:', err);   
});

app.use("/api/users", userRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api", layoutRoutes);

export default app;
