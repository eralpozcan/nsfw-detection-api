const multer = require('multer');
const config = require('../config');

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

module.exports = upload; 