// server/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const admin = require('./firebaseAdmin');
const Roommate = require('./models/Roommate');
const Room = require('./models/Room');
const ChatMessage = require('./models/ChatMessage');

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// --- Your existing routers here ---
const roomsRouter = require('./routes/rooms');
const choresRouter = require('./routes/chores');
const expensesRouter = require('./routes/expenses');
const chatRouter = require('./routes/chat'); // for history REST

const authMiddleware = require('./middleware/auth');

// Protect API routes with Firebase Auth
app.use('/api', authMiddleware);
app.use('/api/rooms', roomsRouter);
app.use('/api/rooms', choresRouter);
app.use('/api/rooms', expensesRouter);
app.use('/api/rooms', chatRouter);

// --- HTTP server + socket.io ---
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// socket.io auth using Firebase token
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));

    const decoded = await admin.auth().verifyIdToken(token);

    let roommate = await Roommate.findOne({ firebaseUid: decoded.uid });
    if (!roommate) {
      roommate = await Roommate.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        displayName: decoded.name || decoded.email.split('@')[0],
      });
    }

    socket.user = {
      roommateId: roommate._id,
      email: roommate.email,
      displayName: roommate.displayName,
    };

    next();
  } catch (err) {
    console.error('Socket auth error:', err);
    next(new Error('Unauthorized'));
  }
});

// helper to check room membership
async function ensureSocketRoomMember(socket, roomId) {
  const room = await Room.findById(roomId);
  if (!room) throw new Error('Room not found');
  const isMember = room.members.some(
    (m) => String(m) === String(socket.user.roommateId)
  );
  if (!isMember) throw new Error('Not a member of this room');
}

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.user.displayName);

  // join a room
  socket.on('joinRoom', async (roomId) => {
    try {
      await ensureSocketRoomMember(socket, roomId);
      socket.join(roomId);
      console.log(`${socket.user.displayName} joined room ${roomId}`);
    } catch (err) {
      console.error('joinRoom error:', err.message);
      socket.emit('errorMessage', err.message);
    }
  });

  // send a message
  socket.on('sendMessage', async (payload) => {
    try {
      const { roomId, text, relatedType, relatedId } = payload;
      if (!text || !roomId) return;

      await ensureSocketRoomMember(socket, roomId);

      const msg = await ChatMessage.create({
        roomId,
        sender: socket.user.roommateId,
        text,
        relatedType: relatedType || null,
        relatedId: relatedId || null,
      });

      const populated = await msg.populate('sender');

      // broadcast to everyone in the room
      io.to(roomId).emit('chatMessage', populated);
    } catch (err) {
      console.error('sendMessage error:', err.message);
      socket.emit('errorMessage', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected:', socket.user?.displayName);
  });
});

// --- Mongo + server start ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server + Socket listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

  const token = await currentUser.getIdToken();
axios.get(url, { headers: { Authorization: `Bearer ${token}` }});

axios.post(`/api/rooms/${roomId}/chat`, {
  text: "Talking about this chore",
  relatedType: "chore",
  relatedId: chore._id
});