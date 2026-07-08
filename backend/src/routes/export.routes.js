const express = require('express');
const router = express.Router();
const { exportToPdf, exportToZip } = require('../controllers/export.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/pdf/:bookId', protect, exportToPdf);
router.post('/zip/:bookId', protect, exportToZip);

module.exports = router;
