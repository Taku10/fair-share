
const mongoose = require('mongoose');

const roommateSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  displayName: String,
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Roommate', roommateSchema);
