const express = require('express');
const router = express.Router();
const Post = require('../models/post');


// Admin credentials (in production, store these in environment variables)
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin@2025';

// Middleware to check admin credentials
const isAdmin = (req, res, next) => {
  const { adminEmail, adminPassword } = req.body;
  if (adminEmail !== ADMIN_EMAIL || adminPassword !== ADMIN_PASSWORD) {
    return res.status(403).json({ message: 'Unauthorized: Invalid admin credentials' });
  }
  next();
};

// Get all posts
router.get('/', async (req, res) => {
  try {
    // console.log('Fetching all posts');
    const posts = await Post.find().sort({ createdAt: -1 });
    // console.log(`Found ${posts.length} posts`);
    res.status(200).json(posts);
  } catch (err) {
    // console.error('Error fetching all posts:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get stored posts
router.get('/stored', async (req, res) => {
  try {
    // console.log('Fetching stored posts');
    const storedPosts = await Post.find({ isStored: true }).sort({ createdAt: -1 });
    // console.log(`Found ${storedPosts.length} stored posts`);
    res.status(200).json(storedPosts);
  } catch (err) {
    // console.error('Error fetching stored posts:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get a single post by ID
router.get('/:id', async (req, res) => {
  try {
    // console.log(`Fetching post with id: ${req.params.id}`);
    const post = await Post.findById(req.params.id);
    if (!post) {
      // console.log(`Post not found for id: ${req.params.id}`);
      return res.status(404).json({ message: 'Post not found' });
    }
    // console.log('Found post:', post);
    res.status(200).json(post);
  } catch (err) {
    // console.error('Error fetching post by ID:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create a new post
router.post('/', async (req, res) => {
  const { title, description, images, date, category } = req.body;

  if (!title || !description || !images || !date || !category) {
    // console.log('Missing required fields in post creation');
    return res.status(400).json({ message: 'All fields are required' });
  }

  const newPost = new Post({
    title,
    description,
    images,
    date,
    category,
    isStored: false
  });

  try {
    // console.log('Creating new post:', newPost);
    const savedPost = await newPost.save();
    // console.log('New post created:', savedPost);
    res.status(201).json(savedPost);
  } catch (err) {
    // console.error('Error creating new post:', err);
    res.status(500).json({ message: err.message });
  }
});

// Toggle stored status of a post
router.patch('/:id/toggle-stored', async (req, res) => {
  try {
    // console.log(`Toggling stored status for post id: ${req.params.id}`);
    const post = await Post.findById(req.params.id);
    if (!post) {
      // console.log(`Post not found for id: ${req.params.id}`);
      return res.status(404).json({ message: 'Post not found' });
    }
    post.isStored = !post.isStored;
    const updatedPost = await post.save();
    // console.log('Updated post:', updatedPost);
    res.status(200).json(updatedPost);
  } catch (err) {
    // console.error('Error toggling stored status:', err);
    res.status(500).json({ message: err.message });
  }
});


// Get comments for a post
router.get("/:id/comments", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const comments = (post.comments || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a comment to a post
router.post("/:id/comments", async (req, res) => {
  try {
    const { name, email, content } = req.body;
    if (!name || !email || !content) {
      return res.status(400).json({ message: "Name, email, and content are required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = {
      _id: new Date().getTime().toString(),
      name,
      email,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      replies: []
    };

    if (!post.comments) {
      post.comments = [];
    }

    post.comments.push(newComment);
    await post.save();

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a reply to a comment (admin only)
router.post("/:id/comments/:commentId/replies", isAdmin, async (req, res) => {
  try {
    const { name, email, content } = req.body;
    if (!name || !email || !content) {
      return res.status(400).json({ message: "Name, email, and content are required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.find((c) => c._id === req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const newReply = {
      _id: new Date().getTime().toString(),
      name,
      email,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: []
    };

    if (!comment.replies) {
      comment.replies = [];
    }

    comment.replies.push(newReply);
    await post.save();

    res.status(201).json(newReply);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Like a comment
router.post("/:id/comments/:commentId/like", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required to like a comment" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.find((c) => c._id === req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.likedBy.includes(email)) {
      return res.status(400).json({ message: "You have already liked this comment" });
    }

    comment.likes = (comment.likes || 0) + 1;
    comment.likedBy.push(email);
    await post.save();

    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Like a reply
router.post("/:id/comments/:commentId/replies/:replyId/like", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required to like a reply" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.find((c) => c._id === req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const reply = comment.replies.find((r) => r._id === req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    if (reply.likedBy.includes(email)) {
      return res.status(400).json({ message: "You have already liked this reply" });
    }

    reply.likes = (reply.likes || 0) + 1;
    reply.likedBy.push(email);
    await post.save();

    res.status(200).json(reply);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a comment (admin only)
router.delete("/:id/comments/:commentId", isAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.find((c) => c._id === req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    post.comments = post.comments.filter((c) => c._id !== req.params.commentId);
    await post.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a reply (admin only)
router.delete("/:id/comments/:commentId/replies/:replyId", isAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.find((c) => c._id === req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.replies = comment.replies.filter((r) => r._id !== req.params.replyId);
    await post.save();

    res.status(200).json({ message: "Reply deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
