import { logLayoutAction } from "../controllers/historyController.js";
import LayoutHistory from "../models/layoutHistory.js";

// Attach Socket.IO event handlers
global.io.on('connection', (socket) => {
  console.log(`SocketHandler: New connection - ${socket.id}`);

  // Log layout action event
  socket.on('logLayoutAction', async (data) => {
    console.log("SocketHandler: Received logLayoutAction event:", data);
    const { layout, actionType, userId, previousVersion } = data;
    try {
      await logLayoutAction(layout, actionType, userId, previousVersion);
      console.log(`SocketHandler: Layout action logged for user ${userId}`);
      socket.emit('logLayoutActionResponse', { success: true });
    } catch (error) {
      console.error("SocketHandler: Error logging layout action:", error);
      socket.emit('logLayoutActionResponse', { success: false, error: error.message });
    }
  });

  // Get history event
  socket.on('getHistory', async (query) => {
    console.log("SocketHandler: Received getHistory event with query:", query);

    // Build filter similar to your REST controller
    const { title, city, actionType, dateFrom, dateTo, status, user } = query;
    const filter = {};
    if (title) filter['metadata.title'] = { $regex: title, $options: 'i' };
    if (city) filter['metadata.city'] = city;
    if (user) filter.userName = { $regex: user, $options: 'i' };
    if (actionType) filter.actionType = actionType;
    if (dateFrom && dateTo) {
      filter.timestamp = { $gte: new Date(dateFrom), $lte: new Date(dateTo) };
    }
    if (status) filter['metadata.status'] = status;

    try {
      const historyEntries = await LayoutHistory.find(filter)
        .sort({ timestamp: -1 })
        .limit(100);
      console.log(`SocketHandler: Fetched ${historyEntries.length} history entries`);
      socket.emit('getHistoryResponse', { success: true, data: historyEntries });
    } catch (error) {
      console.error("SocketHandler: Error fetching history:", error);
      socket.emit('getHistoryResponse', { success: false, error: error.message });
    }
  });
});
