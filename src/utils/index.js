const fs = require('fs').promises;
const path = require('path');

/**
 * Ensures a directory exists, creating it if necessary
 * @param {string} dirPath - Directory path to ensure
 */
async function ensureDirectoryExists(dirPath) {
    try {
        await fs.access(dirPath);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.mkdir(dirPath, { recursive: true });
            console.log(`Directory created: ${dirPath}`);
        } else {
            throw error;
        }
    }
}

/**
 * Formats a file size in bytes to a human-readable string
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validates a file extension against a list of allowed extensions
 * @param {string} filename - Name of the file to validate
 * @param {string[]} allowedExtensions - List of allowed file extensions
 * @returns {boolean} Whether the file extension is allowed
 */
function isValidFileExtension(filename, allowedExtensions) {
    const ext = path.extname(filename).toLowerCase();
    return allowedExtensions.includes(ext);
}

module.exports = {
    ensureDirectoryExists,
    formatFileSize,
    isValidFileExtension
}; 