const express = require('express');
const router = express.Router();
const { createChapter, updateChapter, deleteChapter } = require('../controllers/chapter.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, createChapter);

router.route('/:id')
  .put(protect, updateChapter)
  .delete(protect, deleteChapter);

module.exports = router;
