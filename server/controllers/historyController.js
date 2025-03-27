import LayoutHistory from "../models/layoutHistory.js";
import User from "../models/user.js"; // Assuming you have a User model
import { logger, errorLogger } from "../utils/logger.js"

// Enhanced layout history logging function
export const logLayoutAction = async (layout, actionType, userId, previousVersion = null) => {
    try {
      // Fetch user details to include username

      // const { userId } = req.query;
      // const user = await User.findById(userId);
     
      
      await LayoutHistory.create({
        layoutId: layout._id,
        userId: userId,
        userName: userId || 'Unknown User', // Add user name
        actionType: actionType,
        metadata: {
          title: layout.title,
          city: layout.city,
          state: layout.state,
          status: layout.taskstatus,
          layoutType: layout.layouttype,
          lastEditedTime: new Date() // Add last edited time
        },
        timestamp: new Date(),
        previousVersion: previousVersion
      });
    } catch (error) {
      console.error('Error logging layout history:', error);
    }
  };

export const histlayout = async (req, res) => {
    try {
      // Destructure filter parameters
      const { userId } = req.query;
      const { 
        title, 
        city, 
        actionType, 
        dateFrom, 
        dateTo, 
        status,
        user 
      } = req.body;
  
      // Build query object
      const query = {};
  
      // Apply filters
      if (title) {
        query['metadata.title'] = { $regex: title, $options: 'i' };
      }
  
      if (city) {
        query['metadata.city'] = city;
      }
  
      if (user) {
        query.userName = { $regex: user, $options: 'i' };
      }
  
      if (actionType) {
        query.actionType = actionType;
      }
  
      if (dateFrom && dateTo) {
        query.timestamp = {
          $gte: new Date(dateFrom),
          $lte: new Date(dateTo)
        };
      }
  
      if (status) {
        query['metadata.status'] = status;
      }
  
      // Fetch history entries with applied filters
      const historyEntries = await LayoutHistory.find(query)
        .sort({ timestamp: -1 })
        .limit(100); // Limit to 100 most recent entries
  
      res.json(historyEntries);
    } catch (error) {
      console.error('Error fetching layout history:', error);
      res.status(500).json({ message: 'Error fetching layout history' });
    }
  };