require('dotenv').config();

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const tf = require('@tensorflow/tfjs-node');
const nsfw = require('nsfwjs');
const path = require('path');
const sharp = require('sharp');
const rateLimit = require('express-rate-limit');

const app = express();

// Environment variables
const API_KEY = process.env.API_KEY || 'your-default-api-key';
const RATE_LIMIT_WINDOW_MINUTES = parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15; // Default: 15 min
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100; // Default: 100 requests

// Rate limiter ayarları
const limiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
    max: RATE_LIMIT_MAX_REQUESTS,
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin',
            details: `Rate limit is ${RATE_LIMIT_MAX_REQUESTS} requests per ${RATE_LIMIT_WINDOW_MINUTES} minutes`
        }
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));
app.use(limiter); // Global rate limiter

// Desteklenen görsel formatları
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

// API Key kontrolü middleware
const authenticateApiKey = (req, res, next) => {
    const apiKey = req.header('X-API-Key');
    
    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'AUTHENTICATION_ERROR',
                message: 'API anahtarı eksik',
                details: 'Lütfen X-API-Key header\'ı ile geçerli bir API anahtarı gönderin'
            }
        });
    }

    if (apiKey !== API_KEY) {
        return res.status(403).json({
            success: false,
            error: {
                code: 'AUTHORIZATION_ERROR',
                message: 'Geçersiz API anahtarı',
                details: 'Sağlanan API anahtarı geçerli değil'
            }
        });
    }
    next();
};

// Multer ayarları
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (!SUPPORTED_FORMATS.includes(file.mimetype)) {
            return cb(new Error('Desteklenmeyen dosya formatı. Desteklenen formatlar: JPEG, PNG, WebP, AVIF'), false);
        }
        cb(null, true);
    }
});

// Görsel işleme yardımcı fonksiyonu
async function processImage(buffer, mimetype) {
    try {
        // Görseli işle ve PNG formatına dönüştür
        const processedImageBuffer = await sharp(buffer)
            .toFormat('png')
            .toBuffer();

        // PNG formatındaki görseli tensor'a dönüştür
        const image = await tf.node.decodeImage(processedImageBuffer, 3);
        return image;
    } catch (error) {
        throw new Error(`Görsel işlenirken hata oluştu: ${error.message}`);
    }
}

let model = null;

async function loadModel() {
    try {
        model = await nsfw.load('file://' + path.join(__dirname, '../public/models/mobilenetv2/model.json'));
        console.log('NSFW model başarıyla yüklendi');
    } catch (error) {
        try {
            model = await nsfw.load('https://raw.githubusercontent.com/infinitered/nsfwjs/refs/heads/master/models/mobilenet_v2/model.json');
            console.log('NSFW model GitHub\'dan yüklendi');
        } catch (err) {
            console.error('Model yüklenirken hata:', err);
            setTimeout(loadModel, 5000);
        }
    }
}

// API Routes
app.get('/health', authenticateApiKey, (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            modelStatus: model ? 'loaded' : 'not_loaded',
            supportedFormats: SUPPORTED_FORMATS,
            timestamp: new Date().toISOString()
        }
    });
});

app.post('/check', authenticateApiKey, upload.single('image'), async (req, res) => {
    try {
        if (!model) {
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

        // Görseli işle
        const image = await processImage(req.file.buffer, req.file.mimetype);
        const predictions = await model.classify(image);
        image.dispose();

        const topPrediction = predictions.reduce((prev, current) => 
            (prev.probability > current.probability) ? prev : current
        );

        const isNSFW = isNSFWContent(topPrediction);

        res.json({
            success: true,
            data: {
                analysis: {
                    isNSFW,
                    severity: getSeverityLevel(topPrediction),
                    primaryClassification: {
                        category: topPrediction.className,
                        confidence: formatProbability(topPrediction.probability)
                    }
                },
                details: formatPredictions(predictions),
                metadata: {
                    filename: req.file.originalname,
                    filesize: req.file.size,
                    originalFormat: req.file.mimetype,
                    processedFormat: 'image/png',
                    analyzedAt: new Date().toISOString()
                }
            }
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

function isNSFWContent(prediction) {
    return ['Porn', 'Hentai', 'Sexy'].includes(prediction.className) && 
           prediction.probability > 0.5;
}

function formatProbability(probability) {
    return Math.round(probability * 100) / 100;
}

function formatPredictions(predictions) {
    return predictions.map(p => ({
        category: p.className,
        confidence: formatProbability(p.probability),
        isNSFWCategory: ['Porn', 'Hentai', 'Sexy'].includes(p.className)
    }));
}

function getSeverityLevel(prediction) {
    if (!isNSFWContent(prediction)) return 'SAFE';
    
    const severity = {
        'Porn': 'HIGH',
        'Hentai': 'HIGH',
        'Sexy': 'MEDIUM'
    };
    
    return severity[prediction.className] || 'LOW';
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    loadModel();
}); 