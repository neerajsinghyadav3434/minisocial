import React, { useState, useEffect, useContext } from 'react';
import { Container, Box, Button, Typography, CircularProgress } from '@mui/material';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

const Feed = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/posts');
            setPosts(res.data);
        } catch (error) {
            console.error('Error fetching posts', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostUpdated = (updatedPost) => {
        setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
    };

    const handlePostDeleted = (deletedPostId) => {
        setPosts(posts.filter(p => p._id !== deletedPostId));
    };

    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts]);
    };

    if (authLoading || loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: '#f0f2f5', minHeight: '100vh', pb: 5 }}>
            <Navbar />
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                {user && (
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                        <Button variant="contained" size="large" onClick={() => setModalOpen(true)} fullWidth sx={{ py: 1.5, borderRadius: 2 }}>
                            What's on your mind, {user.username}?
                        </Button>
                    </Box>
                )}
                
                {posts.length === 0 ? (
                    <Typography textAlign="center" color="text.secondary">No posts yet. Be the first to post!</Typography>
                ) : (
                    posts.map(post => (
                        <PostCard key={post._id} post={post} onPostUpdated={handlePostUpdated} onPostDeleted={handlePostDeleted} />
                    ))
                )}
            </Container>

            <CreatePostModal 
                open={modalOpen} 
                handleClose={() => setModalOpen(false)} 
                onPostCreated={handlePostCreated} 
            />
        </Box>
    );
};

export default Feed;