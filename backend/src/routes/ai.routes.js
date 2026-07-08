const express = require('express');
const router = express.Router();
const { generateBookOutline, generateFullBookFromOutline } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/outline', protect, generateBookOutline);
router.post('/full-ebook', protect, generateFullBookFromOutline);

module.exports = router;
