
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const choresRouter = require('./routes/chores');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to mongoDB using monggose
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log(' Lets go Taku!!! Connected to MongoDB');
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server listening on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.error('OOPS! There was an error connecting to MongoDB:', err);
  });

// test route
app.get('/', (req, res) => {
  res.json({ message: 'The Fair Share API is running' });
});


//chores routes
app.use('/api/chores', choresRouter);
