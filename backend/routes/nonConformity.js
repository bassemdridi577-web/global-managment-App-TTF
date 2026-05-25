const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all reports
router.get('/', async (req, res) => {
    try {
        const reports = await prisma.nonConformityReport.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch non-conformity reports' });
    }
});

// Create a new report
router.post('/', async (req, res) => {
    try {
        const {
            date,
            processus,
            origine,
            description,
            analyse5M,
            correction,
            suiviEfficacite,
            operateur
        } = req.body;

        const newReport = await prisma.nonConformityReport.create({
            data: {
                date: new Date(date),
                processus,
                origine,
                description,
                analyse5M,
                correction,
                suiviEfficacite,
                operateur
            }
        });
        res.status(201).json(newReport);
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ error: 'Failed to create non-conformity report' });
    }
});

// Get a single report
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const report = await prisma.nonConformityReport.findUnique({
            where: { id: parseInt(id) }
        });
        if (!report) return res.status(404).json({ error: 'Report not found' });
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});

// Update a report
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            date,
            processus,
            origine,
            description,
            analyse5M,
            correction,
            suiviEfficacite,
            operateur
        } = req.body;

        const updatedReport = await prisma.nonConformityReport.update({
            where: { id: parseInt(id) },
            data: {
                date: new Date(date),
                processus,
                origine,
                description,
                analyse5M,
                correction,
                suiviEfficacite,
                operateur
            }
        });
        res.json(updatedReport);
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({ error: 'Failed to update non-conformity report' });
    }
});

const { authorizeRoles } = require('../middleware/authMiddleware');

// Delete a report (Admin only)
router.delete('/:id', authorizeRoles(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.nonConformityReport.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ error: 'Failed to delete non-conformity report' });
    }
});

module.exports = router;
