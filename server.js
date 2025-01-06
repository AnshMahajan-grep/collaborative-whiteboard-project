// server.js - Backend server for the collaborative whiteboard

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Serve static files from the dist directory
app.use(express.static('dist'));

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`🔌 New connection: ${socket.id}`);

  // Broadcast draw events to all clients except the sender
  socket.on('draw', (payload) => {
    socket.broadcast.emit('draw', payload);
  });

  // Notify when a user disconnects
  socket.on('disconnect', () => {
    console.log(`❌ Disconnected: ${socket.id}`);
  });
});

// Start the server on the specified port
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
