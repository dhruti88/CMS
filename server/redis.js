import Redis from 'ioredis';
import { logger, errorLogger } from './utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis({
  host: 'redis-12330.c259.us-central1-2.gce.redns.redis-cloud.com',
  port: 12330,
  password: 'gQrXbQZFLlGpO0EdhptJBWaLeh68ZMjT',
  // password: 'abc',
  enableOfflineQueue: false,
  connectTimeout: 5000, // 5 second timeout
  retryStrategy: (times) => {
    if (times > 3) {
      logger.warn('Redis connection failed, continuing without cache');
      return null;
    }
    return Math.min(times * 1000, 3000);
  },
});

redis.on('connect', () => {
  logger.info('✅ Redis Cloud connecting');
  console.log('✅ Redis Cloud connecting');
});

redis.on('ready', () => {
  logger.info('✅ Redis Cloud ready to accept commands');
  console.log('✅ Redis Cloud ready to accept commands');
});

redis.on('error', (error) => {
  logger.error('❌ Redis Cloud error:', error.message);
  console.error('❌ Redis Cloud error:', error.message);
});

// Cache middleware with improved error handling
export const cacheMiddleware = (keyPrefix, expirationInSeconds = 3600) => {
  return async (req, res, next) => {
    // FIX: Changed from !redis.status === 'ready' to redis.status !== 'ready'
    if (redis.status !== 'ready') {
      return next();
    }

    try {
      const cacheKey = `${keyPrefix}:${req.user?.uid || 'guest'}:${req.originalUrl}`;
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        logger.info(`Cache hit: ${cacheKey}`);
        return res.json(JSON.parse(cachedData));
      }

      const originalJson = res.json;
      res.json = function(data) {
        if (redis.status === 'ready') {
          redis.setex(cacheKey, expirationInSeconds, JSON.stringify(data))
            .catch(err => logger.error('Redis caching error:', err));
        }
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

// Cache invalidation helper
export const invalidateCache = async (pattern) => {
  // FIX: Changed from !redis.status === 'ready' to redis.status !== 'ready'
  if (redis.status !== 'ready') return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length) {
      await redis.del(keys);
      logger.info(`Cache invalidated for pattern: ${pattern}`);
    }
  } catch (error) {
    logger.error('Cache invalidation error:', error);
  }
};

// Connection test helper
export const testConnection = async () => {
  try {
    const result = await redis.ping();
    return result === 'PONG';
  } catch (error) {
    logger.error('Redis connection test failed:', error);
    return false;
  }
};

export default redis;