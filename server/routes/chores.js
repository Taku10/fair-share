
const express = require('express');
const router = express.Router();
const Chore = require('../models/Chore');

//So this is where all all the CRUD operations will go for chores


//Creating a new chore
router.post('/', async (req, res) => {
  try {
    const chore = await Chore.create(req.body);
    res.status(201).json(chore);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// View or read all chores
router.get('/', async (req, res) => {
  try {
    const chores = await Chore.find().sort({ createdAt: -1 });
    res.json(chores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a chore by id
router.put('/:id', async (req, res) => {
  try {
    const updated = await Chore.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove or delete a chore by id
router.delete('/:id', async (req, res) => {
  try {
    await Chore.findByIdAndDelete(req.params.id);
    res.json({ message: 'Chore deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
