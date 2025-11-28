// server/models/Roommate.js
const mongoose = require('mongoose');

const roommateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Roommate', roommateSchema);
