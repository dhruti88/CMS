// yjs-server.js
const WebSocket = require('ws');
const http = require('http');
const { setupWSConnection } = require('y-websocket/bin/utils');

const PORT = process.env.PORT || 1234;

// Create an HTTP server
const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Yjs WebSocket server running\n');
});

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req, { 
    // Configuration options
    gc: true,              // Enable garbage collection
    pingTimeout: 30000,    // 30 seconds ping timeout
    docName: req.url.slice(1).split('?')[0] || 'default-document'
  });
  
  console.log(`Client connected: ${req.socket.remoteAddress} to document: ${req.url.slice(1).split('?')[0] || 'default-document'}`);
});

// Error handling
wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
});

server.listen(PORT, () => {
  console.log(`Yjs WebSocket server running on port ${PORT}`);
  console.log(`Try connecting to: ws://localhost:${PORT}`);
});

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  wss.close(() => {
    console.log('WebSocket server closed');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
});