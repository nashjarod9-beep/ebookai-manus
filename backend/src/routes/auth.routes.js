const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleAuth, getMe, updateUserPlan, changePassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);
router.post('/update-plan', protect, updateUserPlan);
router.post('/change-password', protect, changePassword);

module.exports = router;
