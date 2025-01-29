const errorHandler = (err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Sunucu hatası',
            details: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
        }
    });
};

const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'İstenen endpoint bulunamadı',
            details: `${req.method} ${req.path} endpoint'i mevcut değil`
        }
    });
};

module.exports = {
    errorHandler,
    notFoundHandler
}; 