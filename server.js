require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');

const app = express();


const SECRET = process.env.SECRET;
const NODE_ENV = process.env.NODE_ENV;

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});


mongoose.connect('mongodb://localhost:27017/adsDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', err => console.error('Error ' + err));
db.once('open', () => {
  console.log('Connected to the database');
  
  app.use(
    session({
      secret: SECRET,
      store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/adsDB' }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: NODE_ENV === 'production',
      },
    })
  );
  
  if (NODE_ENV !== 'production') {
    app.use(
      cors({
        origin: ['http://localhost:3000'],
        credentials: true,
      })
    );
  }
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  app.use(express.static(path.join(__dirname, '/client/build')));
  app.use(express.static(path.join(__dirname, '/public')));
  
  app.use('/api', require('./routes/ads.routes'));
  app.use('/api', require('./routes/user.routes'));
  app.use('/api/auth', require('./routes/auth.routes'));
  

  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/client/build/index.html'));
  });
  
});
