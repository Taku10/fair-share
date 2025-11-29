// server/models/Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },        // "Apartment 3B"
  code: { type: String, unique: true },          // join code like "3B-XYZ"
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Roommate', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Roommate' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Room', roomSchema);
