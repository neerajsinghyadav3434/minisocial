const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');

router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const { text, image } = req.body;
        if (!text && !image) return res.status(400).json({ msg: 'Post must have text or image' });

        const newPost = new Post({
            username: req.user.username,
            text,
            image
        });

        const savedPost = await newPost.save();
        res.json(savedPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:id/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        const index = post.likes.indexOf(req.user.username);
        if (index === -1) {
            post.likes.push(req.user.username);
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:id/comment', auth, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ msg: 'Comment text is required' });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        const newComment = {
            username: req.user.username,
            text
        };

        post.comments.push(newComment);
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a post
router.put('/:id', auth, async (req, res) => {
    try {
        const { text, image } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        if (post.username !== req.user.username) {
            return res.status(403).json({ msg: 'Unauthorized to modify this post' });
        }

        post.text = text;
        if (image !== undefined) {
            post.image = image;
        }
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        if (post.username !== req.user.username) {
            return res.status(403).json({ msg: 'Unauthorized to delete this post' });
        }

        await Post.deleteOne({ _id: req.params.id });
        res.json({ msg: 'Post deleted successfully', id: req.params.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a comment
router.put('/:id/comment/:commentId', auth, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ msg: 'Comment text is required' });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ msg: 'Comment not found' });

        if (comment.username !== req.user.username) {
            return res.status(403).json({ msg: 'Unauthorized to modify this comment' });
        }

        comment.text = text;
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a comment
router.delete('/:id/comment/:commentId', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ msg: 'Comment not found' });

        if (comment.username !== req.user.username) {
            return res.status(403).json({ msg: 'Unauthorized to delete this comment' });
        }

        post.comments.pull(req.params.commentId);
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;