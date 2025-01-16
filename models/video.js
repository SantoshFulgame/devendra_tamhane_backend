const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      unique: true, // Ensure URLs are unique
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now, 
    },
  },
  { timestamps: true } 
);

module.exports = mongoose.model('Video', videoSchema);
