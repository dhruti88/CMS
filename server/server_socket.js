
import http from 'http';
import { Server } from 'socket.io';
import app from "./app.js";
import { logger } from "./utils/logger.js";

const PORT = process.env.PORT || 8000;

// Create HTTP server with Express app
const server = http.createServer(app);

// Initialize Socket.IO with CORS options
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT", "FETCH"],
  }
});

// Make io available globally so that socket handlers can use it
global.io = io;

// Basic connection logging
io.on('connection', (socket) => {
  console.log(`Socket connected: with id: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Dynamically import the socket handlers AFTER global.io is set
import('./sockets/socketHandlers.js').then(() => {
  console.log("Socket handlers loaded successfully");
});

// Start the server
server.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  console.log(`Server running on http://localhost:${PORT}`);
});
