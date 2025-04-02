// import app from "./app.js";
// import { logger } from "./utils/logger.js"; 
// import redis from './redis.js';

// const PORT = process.env.PORT || 8000;

// // app.listen(PORT, () => {
// //   logger.info(`Server running on http://localhost:${PORT}`); // Log startup
// //   console.log(`Server running on http://localhost:${PORT}`);
// // });

// const startServer = async () => {
//   try {
//     // Wait for Redis ping
//     await redis.ping();
//     logger.info('Redis connection verified');
//     console.log('Redis connection verified');

//     app.listen(PORT, () => {
//       logger.info(`Server running on http://localhost:${PORT}`);
//       console.log(`Server running on http://localhost:${PORT}`);
//     });
//   } catch (error) {
//     logger.error('Failed to start server:', error);
//     console.log('Failed to start server:', error);
//     process.exit(1);
//   }
// };

// startServer();


// import app from "./app.js";
// import { logger } from "./utils/logger.js"; 

// const PORT = process.env.PORT || 8000;

// app.listen(PORT, () => {
//   logger.info(`Server running on http://localhost:${PORT}`); // Log startup
//   console.log(`Server running on http://localhost:${PORT}`);
// });
import app from "./app.js";
import { logger } from "./utils/logger.js";
import redis, { testConnection } from './redis.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  // Try to connect to Redis but don't block server startup
  let redisConnected = false;
  
  try {
    // Add a timeout to prevent hanging if Redis connection is slow
    const connectionPromise = testConnection();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
    );
    
    redisConnected = await Promise.race([connectionPromise, timeoutPromise]);
    
    if (redisConnected) {
      logger.info('✅ Redis Cloud connection verified successfully');
      console.log('✅ Redis Cloud connection verified successfully');
    } else {
      logger.warn('⚠️ Redis Cloud ping failed, server will run without caching');
      console.log('⚠️ Redis Cloud ping failed, server will run without caching');
    }
  } catch (error) {
    logger.error('⚠️ Redis Cloud connection failed:', error.message);
    console.log('⚠️ Redis Cloud connection failed:', error.message);
    redisConnected = false;
  }

  // Start the server regardless of Redis connection status
  app.listen(PORT, () => {
    if (redisConnected) {
      logger.info(`✅ Server running with Redis caching on http://localhost:${PORT}`);
      console.log(`✅ Server running with Redis caching on http://localhost:${PORT}`);
    } else {
      logger.info(`✅ Server running without Redis caching on http://localhost:${PORT}`);
      console.log(`✅ Server running without Redis caching on http://localhost:${PORT}`);
    }
  });
};


// Improved error handling for the entire startup process
startServer().catch(error => {
  logger.error('Fatal error during server startup:', error);
  console.error('Fatal error during server startup:', error);
  process.exit(1);
});