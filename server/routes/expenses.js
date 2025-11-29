// server/routes/expenses.js
const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Roommate = require('../models/Roommate');

// CREATE expense
router.post('/', async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all expenses (populated)
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense
      .find()
      .sort({ date: -1 })
      .populate('paidBy')
      .populate('splitBetween');
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE expense
router.put('/:id', async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE expense
router.delete('/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ balances (who owes who)
router.get('/balances/summary', async (req, res) => {
  try {
    const expenses = await Expense.find().populate('paidBy').populate('splitBetween');

    // balances[roommateId] = net money (positive: they should receive)
    const balances = {};

    for (const exp of expenses) {
      const share = exp.amount / exp.splitBetween.length;
      const payerId = String(exp.paidBy._id);

      // make sure payer exists in balances
      balances[payerId] = (balances[payerId] || 0);

      // each participant owes "share"
      for (const rm of exp.splitBetween) {
        const rmId = String(rm._id);
        balances[rmId] = (balances[rmId] || 0);

        if (rmId === payerId) {
          // they paid and owe their own share: net 0 for this share
          continue;
        }

        // participant owes payer
        balances[rmId] -= share;
        balances[payerId] += share;
      }
    }

    // return with roommate names
    const roommates = await Roommate.find();
    const result = roommates.map((rm) => ({
      roommateId: rm._id,
      name: rm.name,
      balance: balances[String(rm._id)] || 0,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
    