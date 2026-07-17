const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

console.log(`[Redis] Connecting to: ${redisUrl.split('@')[1] || redisUrl}`);

const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required by BullMQ
  connectTimeout: 10000,
  tls: redisUrl.startsWith('rediss://') ? {
    rejectUnauthorized: false
  } : undefined
});

redisConnection.on('connect', () => {
  console.log('[Redis] Connected successfully.');
});

redisConnection.on('error', (err) => {
  console.error('[Redis] Error connecting to Redis:', err.message);
});

module.exports = redisConnection;
