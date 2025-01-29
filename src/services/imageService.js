const sharp = require('sharp');
const tf = require('@tensorflow/tfjs-node');
const config = require('../config');
const multer = require('multer');
const modelService = require('./modelService');

// Multer configuration
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.UPLOAD.MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        if (!config.UPLOAD.SUPPORTED_FORMATS.includes(file.mimetype)) {
            return cb(new Error('Unsupported file format. Supported formats: JPEG, PNG, WebP, AVIF'), false);
        }
        cb(null, true);
    }
});

async function processImage(buffer) {
    try {
        const processedImageBuffer = await sharp(buffer)
            .toFormat('png')
            .toBuffer();

        const image = await tf.node.decodeImage(processedImageBuffer, 3);
        return image;
    } catch (error) {
        throw new Error(`Error processing image: ${error.message}`);
    }
}

async function analyzeImage(imageBuffer, mimetype, originalFilename) {
    const model = modelService.getModel();
    if (!model) {
        throw new Error('Model not loaded yet');
    }

    // Process image
    const image = await processImage(imageBuffer, mimetype);
    const predictions = await model.classify(image);
    image.dispose();

    const topPrediction = predictions.reduce((prev, current) => 
        (prev.probability > current.probability) ? prev : current
    );

    const isNSFW = isNSFWContent(topPrediction);

    return {
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
            filename: originalFilename,
            filesize: imageBuffer.length,
            originalFormat: mimetype,
            processedFormat: 'image/png',
            analyzedAt: new Date().toISOString()
        }
    };
}

function formatProbability(probability) {
    return Math.round(probability * 100) / 100;
}

function formatPredictions(predictions) {
    return predictions.map(p => ({
        category: p.className,
        confidence: formatProbability(p.probability),
        isNSFWCategory: config.NSFW_CATEGORIES.includes(p.className)
    }));
}

function isNSFWContent(prediction) {
    return config.NSFW_CATEGORIES.includes(prediction.className) && 
           prediction.probability > config.NSFW_THRESHOLD;
}

function getSeverityLevel(prediction) {
    if (!isNSFWContent(prediction)) return 'SAFE';
    return config.SEVERITY_LEVELS[prediction.className] || 'LOW';
}

module.exports = {
    upload,
    processImage,
    formatPredictions,
    isNSFWContent,
    getSeverityLevel,
    analyzeImage
}; 