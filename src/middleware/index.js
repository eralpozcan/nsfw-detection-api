const authenticateApiKey = require('./auth');
const apiKeyRateLimiter = require('./rateLimit');
const cacheControl = require('./cache');
const { errorHandler, notFoundHandler } = require('./error');
const upload = require('./upload');

module.exports = {
    authenticateApiKey,
    apiKeyRateLimiter,
    cacheControl,
    errorHandler,
    notFoundHandler,
    upload
}; 