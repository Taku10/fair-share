// server/models/Chore.js
const mongoose = require('mongoose');

const choreSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  title: { type: String, required: true },
  description: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Roommate' },
  dueDate: Date,
  completed: { type: Boolean, default: false },
  completedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Chore', choreSchema);
