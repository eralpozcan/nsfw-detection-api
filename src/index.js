require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const config = require('./config');
const routes = require('./routes');
const middleware = require('./middleware');
const modelService = require('./services/modelService');

const app = express();

// Security Middleware
app.use(helmet());
app.use(compression());

// CORS settings
app.use(cors({
    origin: function(origin, callback) {
        if (!origin || config.ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy violation'));
        }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'X-API-Key']
}));

// Cache and Rate Limit
app.use(middleware.cacheControl);
app.use(middleware.apiKeyRateLimiter);

// Static file serving
app.use(express.static(path.join(__dirname, '../public'), {
    maxAge: '1d',
    etag: true
}));

// API Routes
app.use('/', routes);

// Error Handlers
app.use(middleware.errorHandler);
app.use(middleware.notFoundHandler);

// Root route for Vercel
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'NSFW Detection API is running',
        version: '1.0.0',
        docs: '/docs'
    });
});

// Start server
if (process.env.NODE_ENV !== 'production') {
    const PORT = config.PORT;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        modelService.loadModel();
    });
}

// For Vercel
module.exports = app; 