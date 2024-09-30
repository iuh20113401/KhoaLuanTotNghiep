const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });
const app = require('./index');

app.set('trust proxy', 1);
const Message = require('./model/ChatModel'); // Assuming chat model is saved in models/chatModel.js

const server = http.createServer(app); // Create HTTP server
const io = socketio(server, {
  cors: {
    origin: 'http://localhost:5173', // Allow your frontend URL
    methods: ['GET', 'POST'],
    credentials: true, // If you're using cookies for sessions
  },
});

const DB = process.env.DATABASE;
mongoose.connect(DB).then(() => {
  console.log('DB connection successful');
});

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`App   on port ${port}`);
});

// Socket.io logic for handling real-time chat
io.on('connection', (socket) => {
  console.log('New connection established');

  // Listen for a join event from the client to create or join a chat room
  socket.on('joinRoom', ({ userId, partnerId }) => {
    // Create a unique room for the two users
    const roomId = [userId, partnerId].sort().join('_');
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);

    // Send a welcome message or existing messages
    Message.find({ chatRoom: roomId }).then((messages) => {
      socket.emit('loadMessages', messages);
    });
  });

  // Listen for new messages
  socket.on('chatMessage', ({ content, userId, partnerId }) => {
    const roomId = [userId, partnerId].sort().join('_');

    const newMessage = new Message({
      sender: userId,
      content,
      chatRoom: roomId,
    });

    newMessage.save().then((message) => {
      io.to(roomId).emit('message', message); // Emit message to the room
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
