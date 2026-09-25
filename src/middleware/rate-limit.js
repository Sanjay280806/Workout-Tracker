export function createRateLimiter({
    keyPrefix,
    limit,
    windowSeconds,
    keyGenerator
}) {
    return async (req, res, next) => {
        try {
            const identifier = keyGenerator(req);

            const key = `${keyPrefix}:${identifier}`;

            const count = await redisClient.incr(key);

            if (count === 1) {
                await redisClient.expire(
                    key,
                    windowSeconds
                );
            }

            if (count > limit) {
                return res.status(429).json({
                    error: {
                        code: "RATE_LIMIT_EXCEEDED",
                        message: "Too many requests"
                    }
                });
            }

            next();

        } catch (error) {
            next(error);
        }
    };
}