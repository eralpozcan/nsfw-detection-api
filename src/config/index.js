require('dotenv').config();

module.exports = {
    // Environment variables
    API_KEY: process.env.API_KEY || 'your-default-api-key',
    PREMIUM_API_KEY: process.env.PREMIUM_API_KEY,
    PORT: parseInt(process.env.PORT) || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Rate limiting
    RATE_LIMIT: {
        WINDOW_MINUTES: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15,
        MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },

    // CORS
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? 
        process.env.ALLOWED_ORIGINS.split(',') : 
        ['http://localhost:3000'],

    // File upload
    UPLOAD: {
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
    },

    // Model
    MODEL: {
        LOCAL_PATH: '../public/models/mobilenetv2/model.json',
        GITHUB_PATH: 'https://raw.githubusercontent.com/infinitered/nsfwjs/master/models/mobilenet_v2/model.json'
    },

    // NSFW Categories
    NSFW_CATEGORIES: ['Porn', 'Hentai', 'Sexy'],
    
    // Severity Levels
    SEVERITY_LEVELS: {
        'Porn': 'HIGH',
        'Hentai': 'HIGH',
        'Sexy': 'MEDIUM'
    },

    // NSFW Threshold
    NSFW_THRESHOLD: 0.7
}; 