import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, IconButton } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import api from '../api';

const CreatePostModal = ({ open, handleClose, onPostCreated }) => {
    const [text, setText] = useState('');
    const [image, setImage] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!text && !image) return;
        try {
            const res = await api.post('/posts', { text, image });
            onPostCreated(res.data);
            setText('');
            setImage('');
            handleClose();
        } catch (error) {
            console.error('Error creating post', error);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Create a Post</DialogTitle>
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
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Button variant="outlined" component="label" startIcon={<PhotoCamera />}>
                        Upload Image
                        <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                    </Button>
                    {image && (
                        <Box component="img" src={image} alt="Preview" sx={{ height: 60, ml: 2, borderRadius: 1 }} />
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={!text && !image}>Post</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreatePostModal;