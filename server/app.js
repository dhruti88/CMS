import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(cors({
  origin: "*",
  methods: ["*"]
}));

app.use(express.json());

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME;
console.log("MONGO_URL:", process.env.MONGO_URL);

mongoose.connect(MONGO_URL,{
    dbName: DB_NAME
}).then( () => {
        console.log("Connected to Database");
}).catch((err) => {
    console.log('Error while connectiong to Database ' + err);   
})

// Import and use user routes
import userRoutes from "./routes/userRoutes.js";
app.use("/api/users", userRoutes);

// Export the configured Express app
export default app;
