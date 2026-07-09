const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleAuth, getMe, updateUserPlan } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);
router.post('/update-plan', protect, updateUserPlan);

module.exports = router;
