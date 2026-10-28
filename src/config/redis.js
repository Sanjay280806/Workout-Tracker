import "dotenv/config";
import IORedis from "ioredis";

// Shared connection configuration options for BullMQ
export const redisConfig = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    // BullMQ requires maxRetriesPerRequest: null on worker connections
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
        // Exponential backoff for Redis reconnection (capped at 5 seconds)
        const delay = Math.min(times * 100, 5000);
        return delay;
    },
};

// Create a standalone IORedis client for caching or atomic locking if needed
export const createRedisClient = () => {
    const client = new IORedis(redisConfig);
    client.on("error", (err) => {
        console.error("[Redis Client Error]:", err.message);
    });
    return client;
};

export default redisConfig;

// maxRetriesPerRequest: null: Mandatory for BullMQ workers. 
// BullMQ handles its own retry logic and blocking commands (like BRPOPLPUSH). 
// If ioredis has a limit on retries, blocking commands will fail during transient network drops.

// retryStrategy: Ensures if Redis restarts or drops, the process attempts reconnections incrementally up to 5 seconds instead of crashing immediately.