// server/routes/chat.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const ChatMessage = require('../models/ChatMessage');
const Room = require('../models/Room');

async function ensureRoomMember(req, res, next) {
  const roomId = req.params.roomId;
  const room = await Room.findById(roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });

  const isMember = room.members.some(
    (m) => String(m) === String(req.user.roommateId)
  );
  if (!isMember) return res.status(403).json({ error: 'Not a member of this room' });

  next();
}

// GET messages for a room
router.get('/:roomId/chat', ensureRoomMember, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ roomId: req.params.roomId })
      .sort({ createdAt: 1 })
      .populate('sender')
      .lean();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new message
router.post('/:roomId/chat', ensureRoomMember, async (req, res) => {
  try {
    const { text, relatedType, relatedId } = req.body;
    const msg = await ChatMessage.create({
      roomId: req.params.roomId,
      sender: req.user.roommateId,
      text,
      relatedType: relatedType || null,
      relatedId: relatedId || null,
    });
    const populated = await msg.populate('sender');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
