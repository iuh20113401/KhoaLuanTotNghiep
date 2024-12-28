const http = require('http');
const socketio = require('socket.io');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });
const app = require('./index');

app.set('trust proxy', 1);
const Message = require('./model/ChatModel');

const server = http.createServer(app);
const allowedOrigins = [
  'http://localhost:5173',
  'https://main--khoaluantotnghiep.netlify.app',
  'https://khoaluantotnghiep.netlify.app',
];
const io = socketio(server, {
  cors: {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
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

  socket.on('joinRoom', ({ userId, partnerId }) => {
    const roomId = [userId, partnerId].sort().join('_');
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);

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

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
