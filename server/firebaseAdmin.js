
const admin = require('firebase-admin');

// Option 1: use service account JSON file (keep it OUT of git)
// const serviceAccount = require('./serviceAccountKey.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// Option 2: use env vars (for production); for class you can use option 1.
admin.initializeApp();

module.exports = admin;
