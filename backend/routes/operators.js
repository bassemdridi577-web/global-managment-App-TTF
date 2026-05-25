const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all operators
router.get('/', async (req, res) => {
    try {
        const operators = await prisma.operator.findMany({
            include: { team: true },
            orderBy: { name: 'asc' },
        });
        res.json(operators);
    } catch (error) {
        console.error('Error fetching operators:', error);
        res.status(500).json({ error: 'Failed to fetch operators' });
    }
});

// Add a new operator
router.post('/', async (req, res) => {
    const { name, teamId } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Operator name is required' });
    }

    try {
        const existing = await prisma.operator.findUnique({
            where: { name: name.trim() },
        });

        if (existing) {
            return res.status(400).json({ error: 'Operator already exists' });
        }

        const operatorData = {
            name: name.trim(),
        };

        if (teamId) {
            operatorData.teamId = parseInt(teamId);
        }

        const operator = await prisma.operator.create({
            data: operatorData,
            include: { team: true }
        });
        res.status(201).json(operator);
    } catch (error) {
        console.error('Error creating operator:', error);
        res.status(500).json({ error: 'Failed to create operator' });
    }
});

// Update an operator (e.g., change team)
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { teamId, name } = req.body;

    try {
        const updateData = {};
        if (teamId !== undefined) updateData.teamId = teamId ? parseInt(teamId) : null;
        if (name) updateData.name = name;

        const operator = await prisma.operator.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: { team: true }
        });
        res.json(operator);
    } catch (error) {
        console.error('Error updating operator:', error);
        res.status(500).json({ error: 'Failed to update operator' });
    }
});

// Delete an operator
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.operator.delete({
            where: { id: parseInt(id) },
        });
        res.json({ message: 'Operator deleted successfully' });
    } catch (error) {
        console.error('Error deleting operator:', error);
        res.status(500).json({ error: 'Failed to delete operator' });
    }
});

module.exports = router;
