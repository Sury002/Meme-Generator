const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// Simple file type validation by mimetype
const fileFilter = (req, file, cb) => {
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!validMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only JPEG, PNG, and GIF images are allowed.'), false);
  }
  cb(null, true);
};

// Multer upload middleware
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.UPLOAD_LIMIT) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter
});

// Sharp processing function
const processImage = async (filePath) => {
  try {
    const processedPath = `${filePath}.processed`;

    // Resize and compress
    await sharp(filePath)
      .resize({
        width: 800,
        height: 800,
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 })
      .toFile(processedPath);

    // Replace original with processed
    await fs.promises.rename(processedPath, filePath);

    return true;
  } catch (err) {
    console.error('Image processing failed:', err);
    // Cleanup on failure
    try {
      if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
      if (fs.existsSync(`${filePath}.processed`)) await fs.promises.unlink(`${filePath}.processed`);
    } catch (cleanupErr) {
      console.error('Cleanup failed:', cleanupErr);
    }
    return false;
  }
};

module.exports = { upload, processImage };
