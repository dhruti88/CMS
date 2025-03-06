import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { logger, errorLogger } from "./utils/logger.js"; 
// Import and use user routes
import userRoutes from "./routes/userRoutes.js";


dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(cors({
  origin: "*",
  methods: ["*"]
}));

app.use(express.json());

// Log all incoming API requests
app.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.url}`);
  next();
});

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME;
console.log("MONGO_URL:", process.env.MONGO_URL);

mongoose.connect(MONGO_URL,{
    dbName: DB_NAME
}).then( () => {
        logger.info("Connected to Database"); 
        console.log("Connected to Database");
}).catch((err) => {
    errorLogger.error(`Database Connection Error: ${err.message}`);
    console.log('Error while connectiong to Database ' + err);   
})

app.use("/api/users", userRoutes);

// Export the configured Express app
export default app;
