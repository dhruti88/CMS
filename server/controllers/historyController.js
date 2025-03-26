
import LayoutHistory from "../models/layoutHistory.js";
import { logger, errorLogger } from "../utils/logger.js"


// Enhanced layout history logging function
export const logLayoutAction = async (layout, actionType, userId, previousVersion = null) => {
    try {
      await LayoutHistory.create({
        layoutId: layout._id,
        userId: userId,
        actionType: actionType,
        metadata: {
          title: layout.title,
          city: layout.city,
          state: layout.state,
          status: layout.taskstatus,
          layoutType: layout.layouttype
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
      // Assuming you have user authentication and can get the user ID
    //   const userId = "123456";
    const { userId } = req.query;
      // Destructure filter parameters
      const { 
        title, 
        city, 
        actionType, 
        dateFrom, 
        dateTo, 
        status,
        // userId 
      } = req.body;
  console.log("userId",userId);
      // Build query object
      const query = { userId };
  
      // Apply filters
      if (title) {
        query['metadata.title'] = { $regex: title, $options: 'i' };
      }
  
      if (city) {
        query['metadata.city'] = city;
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
  