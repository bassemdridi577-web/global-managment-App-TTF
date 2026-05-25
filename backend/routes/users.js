const express = require('express');
const router = express.Router();
const prisma = require('../lib/prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');
const { createLog } = require('../services/logService');

// Get all users' online presence status
router.get('/presence', authMiddleware, async (req, res) => {
    try {
        const whereClause = req.user.role === 'admin' ? {} : { isHidden: false };
        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                username: true,
                laboname: true,
                role: true,
                isOnline: true,
                lastSeen: true
            },
            orderBy: [
                { isOnline: 'desc' },
                { lastSeen: 'desc' }
            ]
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch presence data', details: error.message });
    }
});

// List all users
router.get('/', authMiddleware, async (req, res) => {
    try {
        const whereClause = req.user.role === 'admin' ? {} : { isHidden: false };
        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                username: true,
                laboname: true,
                email: true,
                role: true,
                isHidden: true
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
});

// Get a single user by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user', details: error.message });
    }
});

// Update a user
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    console.log('PUT /api/users/:id invoked. Headers:', req.headers);
    console.log('PUT /api/users/:id body:', req.body);
    const { laboname, email, role } = req.body;

    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
        return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions.' });
    }

    const dataToUpdate = {};

    if (req.body.hasOwnProperty('laboname')) {
        dataToUpdate.laboname = laboname;
    }

    if (req.body.hasOwnProperty('email')) {
        dataToUpdate.email = email;
    }

    if (req.body.hasOwnProperty('isHidden')) {
        dataToUpdate.isHidden = req.body.isHidden === true;
    }

    if (req.user.role === 'admin' && req.body.hasOwnProperty('role')) {
        dataToUpdate.role = role;
    }

    try {
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: dataToUpdate,
        });
        await createLog(req.user.id, 'user_modified', { updatedUserId: user.id, updatedUsername: user.username, changes: dataToUpdate });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user', details: error.message });
    }
});

// Create a new user
router.post('/', async (req, res) => {
    const { username, password, laboname, role } = req.body;
    if (!username || !password || !laboname) {
        return res.status(400).json({ error: 'Tous les champs sont obligatoires: nom, mot de passe, département' });
    }

    // Password must contain at least 4 digits
    const digitCount = (password.match(/\d/g) || []).length;
    if (digitCount < 4) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 4 chiffres.' });
    }
    try {
        const existingUser = await prisma.user.findFirst({ where: { username: { equals: username, mode: 'insensitive' } } });
        if (existingUser) {
            return res.status(409).json({ error: "L'utilisateur existe déjà" });
        }
        const user = await prisma.user.create({ data: { username, password, laboname, role: role || 'printer' } });

        // If req.user exists (admin creating user), use their ID. Otherwise (public registration), use the new user's ID.
        const actorId = req.user ? req.user.id : user.id;
        await createLog(actorId, 'user_created', { createdUserId: user.id, createdUsername: user.username });
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

// Delete a user
router.delete('/:id', authMiddleware, authorizeRoles(['admin']), async (req, res) => {
    const { id } = req.params;
    try {
        const userToDelete = await prisma.user.findUnique({ where: { id: parseInt(id) } });
        if (!userToDelete) {
            return res.status(404).json({ error: 'User not found' });
        }
        await prisma.user.delete({ where: { id: parseInt(id) } });
        await createLog(req.user.id, 'user_supprime', { deletedUserId: id, deletedUsername: userToDelete.username });
        res.status(204).send(); // No Content
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user', details: error.message });
    }
});

module.exports = router;
