const express = require('express');
const router = express.Router();
const { 
  getMarketingAssets, 
  generateProductSheet, 
  generateTikTokScripts, 
  generateWhatsAppMessages, 
  generateMockup 
} = require('../controllers/marketing.controller');
const { protect } = require('../middleware/auth.middleware');

// Protect all routes
router.use(protect);

router.get('/assets/:bookId', getMarketingAssets);
router.post('/product-sheet', generateProductSheet);
router.post('/tiktok-scripts', generateTikTokScripts);
router.post('/whatsapp-msgs', generateWhatsAppMessages);
router.post('/mockup', generateMockup);

module.exports = router;
