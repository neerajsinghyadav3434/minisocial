require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(cors());

app.get('/api/debug-db', (req, res) => {
    res.json({
        hasMongoUri: !!process.env.MONGO_URI,
        mongoUriLength: process.env.MONGO_URI ? process.env.MONGO_URI.length : 0,
        mongoUriStart: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 15) : '',
        connectionState: mongoose.connection.readyState,
        connectionStateName: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});