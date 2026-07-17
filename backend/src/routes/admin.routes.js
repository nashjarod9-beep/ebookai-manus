const express = require('express');
const router = express.Router();
const { getAiUsageSummary, getAuditLogs } = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/ai-usage-summary', protect, getAiUsageSummary);
router.get('/audit-log', protect, getAuditLogs);

module.exports = router;
