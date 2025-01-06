// counter.js - A secondary server setup for testing

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Initialize environment configuration
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Serve static files
app.use(express.static('public')); // Changed folder to public

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log(`⚡ User joined: ${socket.id}`);

  socket.on('draw', (data) => {
    socket.broadcast.emit('draw', data);
  });

  socket.on('disconnect', () => {
    console.log(`🔒 User left: ${socket.id}`);
  });
});

// Start server on a different port for testing
const TEST_PORT = process.env.TEST_PORT || 8000;
server.listen(TEST_PORT, () => {
  console.log(`✅ Test server running on http://localhost:${TEST_PORT}`);
});
