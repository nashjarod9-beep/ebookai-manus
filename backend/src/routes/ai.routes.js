const express = require('express');
const router = express.Router();
const { generateBookOutline, generateFullBookFromOutline, getAiTaskStatus } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/outline', protect, generateBookOutline);
router.post('/full-ebook', protect, generateFullBookFromOutline);
router.get('/task-status/:taskId', protect, getAiTaskStatus);

module.exports = router;
