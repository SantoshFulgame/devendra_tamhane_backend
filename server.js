const express = require('express');
const mongoose = require('mongoose');
const postsRouter = require('./routes/posts');
const videoRouter = require('./routes/videos');
const contactRouter = require('./routes/contact');
require('dotenv').config();
const db = require('./db/conn');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

// Use routes
app.use('/api/posts', postsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/videos', videoRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});
// Start server
app.listen(PORT, () => {
    db(); // Connect to the database
    console.log(`Server running at http://localhost:${PORT}`);
});
