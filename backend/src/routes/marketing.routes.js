const express = require('express');
const router = express.Router();
const { 
  getMarketingAssets, 
  generateProductSheet, 
  updateProductSheet,
  exportProductSheetPdf,
  generateTikTokScripts, 
  generateWhatsAppMessages, 
  generateMockup 
} = require('../controllers/marketing.controller');
const { protect } = require('../middleware/auth.middleware');

// Protect all routes
router.use(protect);

router.get('/assets/:bookId', getMarketingAssets);
router.post('/product-sheet', generateProductSheet);
router.post('/product-sheet/update', updateProductSheet);
router.get('/product-sheet/pdf/:bookId', exportProductSheetPdf);
router.post('/tiktok-scripts', generateTikTokScripts);
router.post('/whatsapp-msgs', generateWhatsAppMessages);
router.post('/mockup', generateMockup);

module.exports = router;
