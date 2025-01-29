const express = require('express');
const router = express.Router();
const modelService = require('../services/modelService');
const config = require('../config');
const { authenticateApiKey } = require('../middleware');

router.get('/health', authenticateApiKey, (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            modelStatus: modelService.isModelLoaded() ? 'loaded' : 'not_loaded',
            supportedFormats: config.SUPPORTED_FORMATS,
            timestamp: new Date().toISOString()
        }
    });
});

module.exports = router; 