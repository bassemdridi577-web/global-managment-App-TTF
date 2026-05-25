const express = require('express');
const router = express.Router();
const prisma = require('../lib/prismaClient');
const { authMiddleware } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
  try {
    const user = await prisma.user.findFirst({ where: { username: { equals: username, mode: 'insensitive' } } });
    if (!user) {
      return res.status(404).json({ error: "Nom d'utilisateur invalide" });
    }
    
    if (user.password !== password) {
      return res.status(401).json({ error: "Mot de passe invalide" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'ttf-super-secret-key-2026',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, laboname: user.laboname, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: user.id, username: user.username, laboname: user.laboname, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data', details: error.message });
  }
});

module.exports = router;
