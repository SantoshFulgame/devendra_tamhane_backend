const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: [{
    type: String,
    required: true,
  }],
  date: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  isStored: {
    type: Boolean,
    default: false,
  },
  comments: [{
    _id: String,
    name: String,
    email: String,
    content: String,
    createdAt: String,
    likes: {
      type: Number,
      default: 0
    },
    replies: [{
      _id: String,
      name: String,
      email: String,
      content: String,
      createdAt: String,
      likes: {
        type: Number,
        default: 0
      }
    }]
  }]
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
