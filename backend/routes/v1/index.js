const express = require('express');
const router = express.Router();

const pvEssaiRouter = require('./pvEssai');
const commandeRouter = require('./commande');
const usersRouter = require('./users');
const productionLineRouter = require('./productionLine');

router.use('/pv-essai', pvEssaiRouter);
router.use('/commande', commandeRouter);
router.use('/users', usersRouter);
router.use('/production-line', productionLineRouter);

module.exports = router;
