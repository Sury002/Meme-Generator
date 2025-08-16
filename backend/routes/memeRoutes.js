const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/upload');
const memeController = require('../controllers/memeController');

// Upload meme endpoint
router.post('/upload', upload.single('image'), memeController.uploadMeme);

// Get all memes
router.get('/', memeController.getMemes);

// Delete meme
router.delete('/:id', memeController.deleteMeme);

module.exports = router;