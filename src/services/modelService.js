const nsfw = require('nsfwjs');const path = require('path');
const fs = require('fs');
const config = require('../config');

let model = null;
let loadingAttempts = 0;
const MAX_ATTEMPTS = 3;

// Model loading function
async function loadModel() {
    const localModelPath = path.join(__dirname, config.MODEL.LOCAL_PATH);
    const modelDir = path.dirname(localModelPath);

    try {
        // Try loading local model first
        try {
            console.log('Loading local model...');
            model = await nsfw.load('file://' + localModelPath);
            console.log('NSFW model successfully loaded from local file');
            return;
        } catch (error) {
            console.log('Local model could not be loaded, attempting to load from GitHub...');
        }

        // Load model from GitHub
        console.log('Loading model from GitHub...');
        model = await nsfw.load(config.MODEL.GITHUB_PATH);
        console.log('NSFW model loaded from GitHub');

        // Save model locally
        try {
            if (!fs.existsSync(modelDir)) {
                fs.mkdirSync(modelDir, { recursive: true });
                console.log('Model directory created:', modelDir);
            }
            
        } catch (saveError) {
            console.warn('Model could not be saved locally:', saveError.message);
        }

    } catch (error) {
        console.error('Error loading model:', error.message);
        loadingAttempts++;
        
        if (loadingAttempts < MAX_ATTEMPTS) {
            console.log(`Retrying in 5 seconds... (Attempt ${loadingAttempts + 1}/${MAX_ATTEMPTS})`);
            setTimeout(loadModel, 5000);
        } else {
            console.error('Maximum retry attempts reached. Please check your internet connection and try again later.');
        }
    }
}

function getModel() {
    return model;
}

function isModelLoaded() {
    return model !== null;
}

module.exports = {
    loadModel,
    getModel,
    isModelLoaded
}; 