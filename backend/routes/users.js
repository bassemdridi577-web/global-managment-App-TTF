const express = require('express');
const router = express.Router();
const prisma = require('../lib/prismaClient');

// List all users
router.get('/', async (req, res) => {
	try {
		const users = await prisma.user.findMany();
		res.json(users);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch users', details: error.message });
	}
});

// Create a new user
router.post('/', async (req, res) => {
	const { username, password, laboname } = req.body;
	if (!username || !password || !laboname) {
		return res.status(400).json({ error: 'All fields are required: username, password, laboname' });
	}
	try {
		const existingUser = await prisma.user.findFirst({ where: { username } });
		if (existingUser) {
			return res.status(409).json({ error: 'User already exists' });
		}
		const user = await prisma.user.create({ data: { username, password, laboname } });
		res.status(201).json(user);
		} catch (error) {
			console.error('POST /api/users error:', error);
			res.status(500).json({
				error: 'Failed to create user',
				details: error.message,
				stack: error.stack
			});
		}
});

module.exports = router;
