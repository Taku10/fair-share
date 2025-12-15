// server/models/Expense.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  // roomId is optional for now; app doesn't assign rooms yet
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: false, default: null },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Roommate', required: true },
  splitBetween: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Roommate', required: true }],
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Expense', expenseSchema);
