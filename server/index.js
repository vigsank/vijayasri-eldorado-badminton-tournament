const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDb, readData } = require('./db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for now, tighten for prod if needed
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve static files from the React app in production
if (isProduction) {
    app.use(express.static(path.join(__dirname, '../client/dist')));
}

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Middleware to inject io
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Import Routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Serve React app for any other routes in production (SPA fallback)
if (isProduction) {
    app.get('/{*splat}', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
}

server.listen(PORT, async () => {
    console.log(`Server listening on port ${PORT}`);
    if (isProduction) {
        console.log('Running in production mode - serving static files');
    }
    if (!process.env.MONGODB_URI) {
        console.warn('MONGODB_URI is not set. Persistence will not work.');
    } else {
        try {
            await initDb();
            console.log('Connected to MongoDB');
            // Ensure tournament data exists; seeds from local JSON if missing
            const data = await readData();
            if (data) {
                console.log('Tournament data is initialized. Players:', data.players?.length || 0, 'Matches:', data.matches?.length || 0);
            }
        } catch (e) {
            console.error('MongoDB connection failed:', e);
        }
    }
});
