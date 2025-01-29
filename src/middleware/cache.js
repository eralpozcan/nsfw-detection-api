const cacheControl = (req, res, next) => {
    // Short-term cache for health check endpoint
    if (req.path === '/health') {
        res.set('Cache-Control', 'public, max-age=60'); // 1 minute
    } else {
        // No cache for NSFW check
        res.set('Cache-Control', 'no-store');
    }
    next();
};

module.exports = cacheControl; 