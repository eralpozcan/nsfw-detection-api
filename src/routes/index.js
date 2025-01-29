const express = require('express');
const router = express.Router();

const healthRoutes = require('./health');
const nsfwRoutes = require('./nsfw');

router.use('/', healthRoutes);
router.use('/', nsfwRoutes);

module.exports = router; 