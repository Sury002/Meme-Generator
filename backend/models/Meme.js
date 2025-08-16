const mongoose = require('mongoose');

const memeSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  captions: {
    type: [String],
    required: true,
    validate: {
      validator: function(captions) {
        return captions && captions.length > 0;
      },
      message: 'At least one caption is required'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for full image URL
memeSchema.virtual('fullImageUrl').get(function() {
  return `${process.env.BASE_URL}${this.imageUrl}`;
});

// Text index for searching captions
memeSchema.index({ captions: 'text' });

// Update timestamp on save
memeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Meme', memeSchema);