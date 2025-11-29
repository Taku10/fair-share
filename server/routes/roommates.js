// server/routes/roommates.js
const express = require('express');
const router = express.Router();
const Roommate = require('../models/Roommate');

// CRUD operations for roommates

// Creating a new roommate
router.post('/', async (req, res) => {
  try {
    const roommate = await Roommate.create(req.body);
    res.status(201).json(roommate);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reading all roommates
router.get('/', async (req, res) => {
  try {
    const roommates = await Roommate.find().sort({ createdAt: -1 });
    res.json(roommates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Updating a roommate
router.put('/:id', async (req, res) => {
  try {
    const updated = await Roommate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Deleting a roommate
router.delete('/:id', async (req, res) => {
  try {
    await Roommate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Roommate deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
