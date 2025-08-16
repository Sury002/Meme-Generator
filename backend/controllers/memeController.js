const Meme = require('../models/Meme');
const { processImage } = require('../middlewares/upload');
const { generateCaptions } = require('../utils/captions');
const fs = require('fs');
const path = require('path');

exports.uploadMeme = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Process image
    const processed = await processImage(req.file.path);
    if (!processed) {
      throw new Error('Failed to process image');
    }

    // Generate captions
    const captions = generateCaptions({
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Save to database
    const newMeme = new Meme({
      imageUrl: '/uploads/' + path.basename(req.file.path),
      captions
    });

    await newMeme.save();

    res.status(201).json({ 
      success: true,
      meme: {
        ...newMeme.toObject(),
        fullImageUrl: newMeme.fullImageUrl
      }
    });
  } catch (err) {
    console.error('Upload error:', err);
    
   
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false,
      error: err.message || 'Server error during upload'
    });
  }
};

exports.getMemes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [memes, total] = await Promise.all([
      Meme.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Meme.countDocuments()
    ]);

    
    const memesWithUrls = memes.map(meme => ({
      ...meme,
      fullImageUrl: `${process.env.BASE_URL}${meme.imageUrl}`
    }));

    res.json({
      success: true,
      memes: memesWithUrls,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (err) {
    console.error('Error fetching memes:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch memes',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  }
};

exports.deleteMeme = async (req, res) => {
  try {
    const meme = await Meme.findByIdAndDelete(req.params.id);
    if (!meme) {
      return res.status(404).json({ 
        success: false,
        error: 'Meme not found' 
      });
    }

    // Delete the image file
    const imagePath = path.join(__dirname, '../', meme.imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.json({ 
      success: true,
      message: 'Meme deleted successfully',
      deletedMeme: meme
    });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message || 'Server error during deletion'
    });
  }
};