
const mongoose = require('mongoose');

const choreSchema = new mongoose.Schema({
  title: { type: String, required: true },
  assignedTo: { type: String }, 
  frequency: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'monthly'],
    default: 'weekly',
  },
  dueDate: Date,
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Chore', choreSchema);
