
export const defaultQueueOptions = {
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: "exponential-jitter", // Custom or custom-delay strategy
            delay: 2000, // Initial delay 2s (2s -> 4s -> 8s -> 16s + jitter)
        },
        removeOnComplete: {
            // Keep last 1,000 completed jobs or up to 24 hours to prevent memory bloat
            count: 1000,
            age: 24 * 60 * 60, // 24 hours in seconds
        },
        removeOnFail: {
            // Keep failed jobs for diagnostic inspection and replay
            count: 5000,
            age: 7 * 24 * 60 * 60, // 7 days in seconds
        },
    },
};

/*
 * Calculates exponential backoff with full jitter.
 * Prevents "thundering herd" when downstream services (e.g., email API / DB) recover.
 *
 * @param {number} attemptsMade - Number of retries already completed
 * @param {number} baseDelayMs - Base delay in milliseconds (e.g. 2000)
 * @param {number} maxDelayMs - Maximum delay cap (e.g. 60000)
 * @returns {number} Delay in milliseconds with random jitter
 */
export function calculateJitterBackoff(attemptsMade, baseDelayMs = 2000, maxDelayMs = 60000) {
    const exponential = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attemptsMade));
    // Full jitter: uniformly random between 0 and exponential delay
    return Math.floor(Math.random() * exponential);
}