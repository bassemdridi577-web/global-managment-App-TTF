const prisma = require('../lib/prismaClient');
const bcrypt = require('bcryptjs');
const { createLog } = require('../services/logService');
const { userSchema } = require('../validations/userValidation');

const listUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                laboname: true,
                email: true,
                role: true
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user', details: error.message });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
        return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions.' });
    }

    try {
        const validatedData = userSchema.partial().parse(req.body);
        const dataToUpdate = { ...validatedData };

        // Only admins can change roles
        if (req.user.role !== 'admin' && dataToUpdate.role) {
            delete dataToUpdate.role;
        }

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: dataToUpdate,
        });
        await createLog(req.user.id, 'user_modified', { updatedUserId: user.id, updatedUsername: user.username, changes: dataToUpdate });
        res.json(user);
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        res.status(500).json({ error: 'Failed to update user', details: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const validatedData = userSchema.parse(req.body);
        const existingUser = await prisma.user.findFirst({ where: { username: validatedData.username } });
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }
        const user = await prisma.user.create({ data: validatedData });
        const actorId = req.user ? req.user.id : user.id;
        await createLog(actorId, 'user_created', { createdUserId: user.id, createdUsername: user.username });
        res.status(201).json(user);
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        console.error('UserController.createUser error:', error);
        res.status(500).json({ error: 'Failed to create user', details: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userToDelete = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!userToDelete) {
            return res.status(404).json({ error: 'User not found' });
        }
        await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
        await createLog(req.user.id, 'user_supprime', { deletedUserId: req.params.id, deletedUsername: userToDelete.username });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user', details: error.message });
    }
};

module.exports = {
    listUsers,
    getUserById,
    updateUser,
    createUser,
    deleteUser
};
