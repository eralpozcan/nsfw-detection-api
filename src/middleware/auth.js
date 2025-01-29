const config = require('../config');

const authenticateApiKey = (req, res, next) => {
    const apiKey = req.header('X-API-Key');
    
    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'AUTHENTICATION_ERROR',
                message: 'Missing API key',
                details: 'Please provide a valid API key in the X-API-Key header'
            }
        });
    }

    if (apiKey !== config.API_KEY && apiKey !== config.PREMIUM_API_KEY) {
        return res.status(403).json({
            success: false,
            error: {
                code: 'AUTHORIZATION_ERROR',
                message: 'Invalid API key',
                details: 'The provided API key is not valid'
            }
        });
    }

    // Check for Premium API Key
    req.isPremiumUser = apiKey === config.PREMIUM_API_KEY;
    next();
};

module.exports = authenticateApiKey; 