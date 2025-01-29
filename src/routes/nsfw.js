const express = require('express');
const router = express.Router();
const { authenticateApiKey, upload } = require('../middleware');
const imageService = require('../services/imageService');
const modelService = require('../services/modelService');

router.post('/check', authenticateApiKey, upload.single('image'), async (req, res) => {
    try {
        if (!modelService.isModelLoaded()) {
            return res.status(503).json({
                success: false,
                error: {
                    code: 'SERVICE_UNAVAILABLE',
                    message: 'Model henüz yüklenmedi, lütfen biraz bekleyin',
                    details: 'Model initialization is in progress'
                }
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'Lütfen bir görsel yükleyin',
                    details: 'Request must include an image file'
                }
            });
        }

        const result = await imageService.analyzeImage(
            req.file.buffer,
            req.file.mimetype,
            req.file.originalname
        );

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error during image analysis:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'PROCESSING_ERROR',
                message: 'Görsel işlenirken bir hata oluştu',
                details: error.message || 'An unexpected error occurred during image processing'
            }
        });
    }
});

module.exports = router; 