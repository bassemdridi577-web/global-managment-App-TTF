
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4500;

// CORS options to allow all origins and methods
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Routers
const authRouter = require('./routes/auth');
const pvRouter = require('./routes/pvEssai');
const commandeRouter = require('./routes/commande');
const usersRouter = require('./routes/users');

app.use('/api', authRouter);
app.use('/api/pv-essai', pvRouter);
app.use('/api/commande', commandeRouter);
app.use('/api/users', usersRouter);

app.get('/', (req, res) => res.send('ye5dem el backend ch3andek fih'));

app.listen(PORT, '0.0.0.0', () => console.log(`Server is running on port ${PORT} and accessible on your local network.`));
