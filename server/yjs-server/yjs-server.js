import http from "http";
import { WebSocketServer } from "ws";
import { setupWSConnection } from "y-websocket/src/utils.cjs";
import { WebsocketProvider } from "y-websocket";
const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  setupWSConnection(ws, req);
});

const PORT = process.env.Y_PORT || 1234;
server.listen(PORT, () => {
  console.log(`✅ Yjs WebSocket server running on port ${PORT}`);
});

export default server;
