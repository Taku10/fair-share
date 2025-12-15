// server/routes/rooms.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const Room = require('../models/Room');
const Roommate = require('../models/Roommate');

// Creating a new room
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const room = await Room.create({
      name,
      createdBy: req.user.roommateId,
      members: [req.user.roommateId],
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
    });
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all rooms for current user
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user.roommateId })
      .populate('members')
      .populate('createdBy')
      .sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific room
router.get('/:roomId', async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId)
      .populate('members')
      .populate('createdBy');
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Join room by code
router.post('/join/:code', async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    if (!room.members.includes(req.user.roommateId)) {
      room.members.push(req.user.roommateId);
      await room.save();
    }

    await room.populate('members').populate('createdBy');
    res.json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update room
router.put('/:roomId', async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // Only creator can update
    if (String(room.createdBy) !== String(req.user.roommateId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await Room.findByIdAndUpdate(req.params.roomId, req.body, {
      new: true,
    }).populate('members').populate('createdBy');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete room
router.delete('/:roomId', async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // Only creator can delete
    if (String(room.createdBy) !== String(req.user.roommateId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Room.findByIdAndDelete(req.params.roomId);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
