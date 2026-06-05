const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    username: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const PostSchema = new mongoose.Schema({
    username: { type: String, required: true },
    text: { type: String },
    image: { type: String },
    likes: [{ type: String }],
    comments: [CommentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);