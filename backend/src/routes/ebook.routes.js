const express = require('express');
const router = express.Router();
const { getEbooks, getEbookById, createEbook, updateEbook, deleteEbook } = require('../controllers/ebook.controller');
const { protect } = require('../middleware/auth.middleware');

router.route('/')
  .get(protect, getEbooks)
  .post(protect, createEbook);

router.route('/:id')
  .get(protect, getEbookById)
  .put(protect, updateEbook)
  .delete(protect, deleteEbook);

module.exports = router;
