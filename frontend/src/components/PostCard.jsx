import React, { useState, useContext } from 'react';
import { Card, CardHeader, CardContent, CardActions, Avatar, IconButton, Typography, CardMedia, Collapse, Box, TextField, Button, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

const PostCard = ({ post, onPostUpdated, onPostDeleted }) => {
    const { user } = useContext(AuthContext);
    const [expanded, setExpanded] = useState(false);
    const [commentText, setCommentText] = useState('');

    // Post edit/menu states
    const [anchorEl, setAnchorEl] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editText, setEditText] = useState('');
    const [editImage, setEditImage] = useState('');

    // Comment edit states
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState('');

    // Delete confirmation states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState({ type: null, id: null });

    const hasLiked = user ? post.likes.includes(user.username) : false;

    const handleLike = async () => {
        if (!user) return;
        try {
            const res = await api.post(`/posts/${post._id}/like`);
            onPostUpdated(res.data);
        } catch (error) {
            console.error('Error liking post', error);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!user || !commentText.trim()) return;
        try {
            const res = await api.post(`/posts/${post._id}/comment`, { text: commentText });
            onPostUpdated(res.data);
            setCommentText('');
        } catch (error) {
            console.error('Error commenting', error);
        }
    };

    // Post handlers
    const handleMenuOpen = (e) => {
        setAnchorEl(e.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEditPostOpen = () => {
        setEditText(post.text || '');
        setEditImage(post.image || '');
        setIsEditModalOpen(true);
        handleMenuClose();
    };

    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdatePost = async () => {
        if (!editText && !editImage) return;
        try {
            const res = await api.put(`/posts/${post._id}`, { text: editText, image: editImage });
            onPostUpdated(res.data);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Error updating post', error);
        }
    };

    const openDeletePostConfirmation = () => {
        setDeleteTarget({ type: 'post', id: post._id });
        setDeleteDialogOpen(true);
        handleMenuClose();
    };

    // Comment handlers
    const handleUpdateComment = async (commentId) => {
        if (!editingCommentText.trim()) return;
        try {
            const res = await api.put(`/posts/${post._id}/comment/${commentId}`, { text: editingCommentText });
            onPostUpdated(res.data);
            setEditingCommentId(null);
        } catch (error) {
            console.error('Error updating comment', error);
        }
    };

    const openDeleteCommentConfirmation = (commentId) => {
        setDeleteTarget({ type: 'comment', id: commentId });
        setDeleteDialogOpen(true);
    };

    // Confirm execution of delete
    const handleConfirmDelete = async () => {
        setDeleteDialogOpen(false);
        if (deleteTarget.type === 'post') {
            try {
                await api.delete(`/posts/${post._id}`);
                onPostDeleted(post._id);
            } catch (error) {
                console.error('Error deleting post', error);
            }
        } else if (deleteTarget.type === 'comment') {
            try {
                const res = await api.delete(`/posts/${post._id}/comment/${deleteTarget.id}`);
                onPostUpdated(res.data);
            } catch (error) {
                console.error('Error deleting comment', error);
            }
        }
    };

    return (
        <>
            <Card sx={{ mb: 3, width: '100%' }}>
                <CardHeader
                    avatar={
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {post.username.charAt(0).toUpperCase()}
                        </Avatar>
                    }
                    action={
                        user && user.username === post.username && (
                            <>
                                <IconButton onClick={handleMenuOpen}>
                                    <MoreVertIcon />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem onClick={handleEditPostOpen}>Edit</MenuItem>
                                    <MenuItem onClick={openDeletePostConfirmation} sx={{ color: 'error.main' }}>Delete</MenuItem>
                                </Menu>
                            </>
                        )
                    }
                    title={post.username}
                    subheader={new Date(post.createdAt).toLocaleString()}
                />
                {post.text && (
                    <CardContent>
                        <Typography variant="body1" color="text.secondary">
                            {post.text}
                        </Typography>
                    </CardContent>
                )}
                {post.image && (
                    <CardMedia
                        component="img"
                        image={post.image}
                        alt="Post image"
                        sx={{ maxHeight: 400, objectFit: 'contain', bgcolor: '#f5f5f5' }}
                    />
                )}
                <CardActions disableSpacing>
                    <IconButton onClick={handleLike} color={hasLiked ? "error" : "default"}>
                        <FavoriteIcon />
                    </IconButton>
                    <Typography variant="body2">{post.likes.length}</Typography>

                    <IconButton onClick={() => setExpanded(!expanded)} sx={{ ml: 2 }}>
                        <CommentIcon />
                    </IconButton>
                    <Typography variant="body2">{post.comments.length}</Typography>
                </CardActions>
                
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardContent>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Comments:</Typography>
                        {post.comments.map((comment, index) => {
                            const isCommentOwner = user && user.username === comment.username;
                            const isEditing = editingCommentId === comment._id;

                            return (
                                <Box key={comment._id || index} sx={{ mb: 1, p: 1, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="body2" fontWeight="bold">
                                                {comment.username}
                                            </Typography>
                                            {isEditing ? (
                                                <Box sx={{ mt: 1 }}>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={editingCommentText}
                                                        onChange={(e) => setEditingCommentText(e.target.value)}
                                                        sx={{ mb: 1 }}
                                                    />
                                                    <Button size="small" variant="contained" onClick={() => handleUpdateComment(comment._id)} sx={{ mr: 1 }}>
                                                        Save
                                                    </Button>
                                                    <Button size="small" onClick={() => setEditingCommentId(null)}>
                                                        Cancel
                                                    </Button>
                                                </Box>
                                            ) : (
                                                <Typography variant="body2">
                                                    {comment.text}
                                                </Typography>
                                            )}
                                        </Box>
                                        {!isEditing && isCommentOwner && (
                                            <Box sx={{ display: 'flex', ml: 1 }}>
                                                <IconButton size="small" onClick={() => {
                                                    setEditingCommentId(comment._id);
                                                    setEditingCommentText(comment.text);
                                                }}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => openDeleteCommentConfirmation(comment._id)} color="error">
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            );
                        })}
                        {user && (
                            <Box component="form" onSubmit={handleComment} sx={{ display: 'flex', mt: 2 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Write a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                />
                                <Button type="submit" variant="contained" sx={{ ml: 1 }}>
                                    Post
                                </Button>
                            </Box>
                        )}
                    </CardContent>
                </Collapse>
            </Card>

            {/* Post Edit Dialog */}
            <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Edit Post</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="What's on your mind?"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        sx={{ mt: 1 }}
                    />
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                        <Button variant="outlined" component="label" startIcon={<PhotoCamera />}>
                            Upload Image
                            <input type="file" hidden accept="image/*" onChange={handleEditImageChange} />
                        </Button>
                        {editImage && (
                            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                                <Box component="img" src={editImage} alt="Preview" sx={{ height: 60, borderRadius: 1 }} />
                                <Button color="error" size="small" onClick={() => setEditImage('')} sx={{ ml: 1 }}>
                                    Remove
                                </Button>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdatePost} variant="contained" disabled={!editText && !editImage}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this {deleteTarget.type}? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PostCard;