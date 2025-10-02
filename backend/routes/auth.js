const express = require('express');
const router = express.Router();
const prisma = require('../lib/prismaClient');

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
  try {
    const user = await prisma.user.findFirst({ where: { username: { equals: username } } });
    if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid username or password' });
    res.json({ username: user.username, laboname: user.laboname });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Create user
router.post('/users', async (req, res) => {
  const { username, password, laboname } = req.body;
  if (!username || !password || !laboname) return res.status(400).json({ error: 'All fields are required: username, password, laboname' });
  try {
    const existingUser = await prisma.user.findFirst({ where: { OR: [{ username }, { password }] } });
    if (existingUser) return res.status(409).json({ error: 'le compte deja existe' });
    const user = await prisma.user.create({ data: { username, password, laboname } });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
});

module.exports = router;
