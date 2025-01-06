// main.js
// This script initializes the whiteboard and manages user interactions in real-time.

// Importing the Socket.IO client
import { io } from 'socket.io-client';

// Setting the Socket.IO server URL dynamically
const SOCKET_SERVER = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://collaborative-whiteboard-project.onrender.com';

// Establishing the socket connection
const socket = io(SOCKET_SERVER, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 3, // Reduced attempts for uniqueness
});

// Whiteboard class to handle drawing logic
class DrawingBoard {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.context = this.canvas.getContext('2d');
        this.drawing = false;
        this.previousX = 0;
        this.previousY = 0;
        this.brushColor = '#000';
        this.brushSize = 5;

        this.initializeCanvas();
        this.bindEvents();
    }

    // Adjust canvas dimensions and set default properties
    initializeCanvas() {
        // Set the actual canvas dimensions (not affected by CSS)
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Resize canvas dynamically as the window resizes
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    // Draw a line on the canvas
    drawLine(x1, y1, x2, y2, color, size) {
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.strokeStyle = color;
        this.context.lineWidth = size;
        this.context.lineCap = 'round';
        this.context.stroke();
    }

    // Bind mouse events to the canvas
    bindEvents() {
        this.canvas.addEventListener('mousedown', (event) => {
            this.drawing = true;
            const { left, top, width, height } = this.canvas.getBoundingClientRect();
            // Adjust mouse coordinates based on the canvas scaling
            const scaleX = this.canvas.width / width;
            const scaleY = this.canvas.height / height;

            // Get mouse position and scale it properly
            this.previousX = (event.clientX - left) * scaleX;
            this.previousY = (event.clientY - top) * scaleY;
        });

        this.canvas.addEventListener('mousemove', (event) => {
            if (!this.drawing) return;

            const { left, top, width, height } = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / width;
            const scaleY = this.canvas.height / height;

            // Get the current mouse position and scale it accordingly
            const currentX = (event.clientX - left) * scaleX;
            const currentY = (event.clientY - top) * scaleY;

            // Draw the line on the canvas
            this.drawLine(this.previousX, this.previousY, currentX, currentY, this.brushColor, this.brushSize);

            // Emit the drawing data to the server
            socket.emit('draw', {
                x1: this.previousX,
                y1: this.previousY,
                x2: currentX,
                y2: currentY,
                color: this.brushColor,
                size: this.brushSize
            });

            this.previousX = currentX;
            this.previousY = currentY;
        });

        this.canvas.addEventListener('mouseup', () => (this.drawing = false));
        this.canvas.addEventListener('mouseout', () => (this.drawing = false));
    }

    // Change the brush color
    setBrushColor(color) {
        this.brushColor = color;
    }

    // Change the brush size
    setBrushSize(size) {
        this.brushSize = size;
    }

    // Clear the entire canvas
    clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        socket.emit('clear');
    }
}

// Initialize the drawing board
const canvas = document.getElementById('drawingCanvas');
const drawingBoard = new DrawingBoard(canvas);

// Attach event listeners for tools
document.getElementById('colorChooser').addEventListener('input', (event) => drawingBoard.setBrushColor(event.target.value));
document.getElementById('brushSlider').addEventListener('input', (event) => drawingBoard.setBrushSize(event.target.value));
document.getElementById('resetCanvas').addEventListener('click', () => drawingBoard.clearCanvas());

// Handle socket events for real-time updates
socket.on('draw', (data) => {
    drawingBoard.drawLine(data.x1, data.y1, data.x2, data.y2, data.color, data.size);
});

socket.on('clear', () => {
    drawingBoard.clearCanvas();
});
