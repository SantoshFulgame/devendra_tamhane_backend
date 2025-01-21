const express = require('express');
const router = express.Router();
const Video = require('../models/video.js');
require('dotenv').config();

// Authentication route
router.post("/auth", async (req, res) => {
  const { email, password } = req.body;
  
  console.log('Received credentials:', { email });
  console.log('Admin email from env:', process.env.ADMIN_EMAIL);

  try {
    // Check if the environment variables are set
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      console.error('Missing environment variables');
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Simple email and password check
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      res.json({ message: "Authentication successful" });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new video
router.post('/', async (req, res) => {
  const { url, title, description } = req.body;

  if (!url || !title || !description) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newVideo = new Video({ url, title, description });
    const savedVideo = await newVideo.save();
    res.status(201).json(savedVideo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a video
router.delete('/:id', async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
