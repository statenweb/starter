const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');

router.post('/generate', themeController.generateTheme);

module.exports = router;
