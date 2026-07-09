const express = require('express');
const router = express.Router();
const { generateOutline, generateCover, generateChapter, suggestBookTitles } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/suggest-titles', protect, suggestBookTitles);
router.post('/outline', protect, generateOutline);
router.post('/cover', protect, generateCover);
router.post('/chapter', protect, generateChapter);

module.exports = router;
