const rateLimit = require('express-rate-limit');
const config = require('../config');

const apiKeyRateLimiter = rateLimit({
    windowMs: (config.RATE_LIMIT.WINDOW_MINUTES || 15) * 60 * 1000,
    max: (req) => {
        const baseLimit = config.RATE_LIMIT.MAX_REQUESTS || 100;
        // Multiple rate limit for Premium API Key
        return req.isPremiumUser ? baseLimit * 2 : baseLimit;
    },
    keyGenerator: (req) => req.header('X-API-Key') || req.ip || 'anonymous',
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests, please try again later',
                details: `Rate limit is ${config.RATE_LIMIT.MAX_REQUESTS || 100} requests per ${config.RATE_LIMIT.WINDOW_MINUTES || 15} minutes`
            }
        });
    },
    standardHeaders: 'draft-6', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

module.exports = apiKeyRateLimiter; 