import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null, // Required by BullMQ
};

// Connection for the Queue (BullMQ)
export const connection = new IORedis(redisConfig);

// Connection for Publishing Events
export const redisPublisher = new IORedis(redisConfig);

// Connection for Subscribing to Events (Blocking)
export const redisSubscriber = new IORedis(redisConfig);

console.log(`🔌 Redis connected to ${redisConfig.host}:${redisConfig.port}`);