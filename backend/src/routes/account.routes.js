const express = require('express');
const router = express.Router();
const { exportUserData, deleteAccount } = require('../controllers/account.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/export-data', protect, exportUserData);
router.delete('/', protect, deleteAccount);

module.exports = router;
