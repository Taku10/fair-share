// server/middleware/auth.js
const admin = require('./firebaseAdmin');
const Roommate = require('../models/Roommate');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    // decoded: { uid, email, name, ... }

    // Find or create Roommate
    let roommate = await Roommate.findOne({ firebaseUid: decoded.uid });
    if (!roommate) {
      roommate = await Roommate.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        displayName: decoded.name || decoded.email.split('@')[0],
      });
    }

    req.user = {
      firebaseUid: decoded.uid,
      roommateId: roommate._id,
      email: roommate.email,
      displayName: roommate.displayName,
    };

    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authMiddleware;
