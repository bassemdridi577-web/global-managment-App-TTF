const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all teams
router.get('/', async (req, res) => {
    try {
        const teams = await prisma.team.findMany({
            include: {
                operators: true
            },
            orderBy: { name: 'asc' },
        });
        res.json(teams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

// Add a new team
router.post('/', async (req, res) => {
    const { name } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Team name is required' });
    }

    try {
        const existing = await prisma.team.findUnique({
            where: { name: name.trim() },
        });

        if (existing) {
            return res.status(400).json({ error: 'Team already exists' });
        }

        const team = await prisma.team.create({
            data: { name: name.trim() },
        });
        res.status(201).json(team);
    } catch (error) {
        console.error('Error creating team:', error);
        res.status(500).json({ error: 'Failed to create team' });
    }
});

// Update a team
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const team = await prisma.team.update({
            where: { id: parseInt(id) },
            data: { name },
        });
        res.json(team);
    } catch (error) {
        console.error('Error updating team:', error);
        res.status(500).json({ error: 'Failed to update team' });
    }
});

// Delete a team
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Find if any operators are assigned to this team
        const operators = await prisma.operator.findMany({
            where: { teamId: parseInt(id) }
        });

        if (operators.length > 0) {
            // Unassign operators from this team instead of failing
            await prisma.operator.updateMany({
                where: { teamId: parseInt(id) },
                data: { teamId: null }
            });
        }

        await prisma.team.delete({
            where: { id: parseInt(id) },
        });
        res.json({ message: 'Team deleted successfully' });
    } catch (error) {
        console.error('Error deleting team:', error);
        res.status(500).json({ error: 'Failed to delete team' });
    }
});

module.exports = router;
