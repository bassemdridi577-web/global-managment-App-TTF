const pvService = require('../services/pvService');
const { createLog } = require('../services/logService');
const { pvEssaiSchema } = require('../validations/pvEssaiValidation');

/**
 * @openapi
 * /pv-essai:
 *   post:
 *     summary: Create a new PvEssai record
 *     tags: [PvEssai]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PvEssai'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation failed
 */
const createPv = async (req, res) => {
    try {
        const validatedData = pvEssaiSchema.parse(req.body);
        const userId = req.headers['user-id'];
        const result = await pvService.createPv(validatedData, userId);
        res.status(201).json(result);
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        console.error('PvEssai creation error:', error);
        res.status(500).json({ error: 'Failed to create PvEssai record', details: error.message });
    }
};

const updatePv = async (req, res) => {
    try {
        const validatedData = pvEssaiSchema.partial().parse(req.body);
        const result = await pvService.updatePv(req.params.id, validatedData);
        res.status(200).json(result);
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        console.error('PvEssai update error:', error);
        res.status(500).json({ error: 'Failed to update PvEssai record', details: error.message });
    }
};

const getPvStats = async (req, res) => {
    try {
        const stats = await pvService.getPvStats(req.query || {});
        res.json(stats);
    } catch (error) {
        console.error('PvEssai stats error:', error);
        res.status(500).json({ error: 'Failed to fetch PvEssai stats', details: error.message });
    }
};

const getConformityByPower = async (req, res) => {
    try {
        const stats = await pvService.getConformityByPower(req.query);
        res.json(stats);
    } catch (error) {
        console.error('PvEssai conformity by power error:', error);
        res.status(500).json({ error: 'Failed to fetch conformity by power stats', details: error.message });
    }
};

const getConformityTrend = async (req, res) => {
    try {
        const stats = await pvService.getConformityTrend(req.query || {});
        res.json(stats);
    } catch (error) {
        console.error('PvEssai conformity trend error:', error);
        res.status(500).json({ error: 'Failed to fetch conformity trend stats', details: error.message });
    }
};

const getAvailableMonths = async (req, res) => {
    try {
        const months = await pvService.getAvailableMonths();
        res.json(months);
    } catch (error) {
        console.error('PvEssai available-months error:', error);
        res.status(500).json({ error: 'Failed to fetch available months', details: error.message });
    }
};

const listPv = async (req, res) => {
    try {
        const list = await pvService.listPv(req.query || {});
        res.json(list);
    } catch (error) {
        console.error('PvEssai list error:', error);
        res.status(500).json({ error: 'Failed to fetch PvEssai records', details: error.message });
    }
};

const enrichPv = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await pvService.enrichPv(id);
        res.json(result);
    } catch (error) {
        console.error('PvEssai enrich error:', error);
        res.status(500).json({ error: 'Failed to enrich PvEssai record', details: error.message });
    }
};

const getPvById = async (req, res) => {
    try {
        const pv = await pvService.getPvById(req.params.id);
        if (!pv) {
            return res.status(404).json({ error: 'PvEssai not found' });
        }
        res.json(pv);
    } catch (error) {
        console.error('PvEssai fetch by ID error:', error);
        res.status(500).json({ error: 'Failed to fetch PvEssai record by ID', details: error.message });
    }
};

const deletePv = async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        const pvId = req.params.id;
        const result = await pvService.deletePv(pvId);
        await createLog(userId, 'pv_supprime', { pvId: result.id, numero: result.numero, power: result.power });
        res.status(200).json(result);
    } catch (error) {
        console.error('PvEssai deletion error:', error);
        res.status(500).json({ error: 'Failed to delete PvEssai record', details: error.message });
    }
};

const refreshAllPvsConformity = async (req, res) => {
    try {
        const result = await pvService.refreshAllPvsConformity();
        res.status(200).json(result);
    } catch (error) {
        console.error('PvEssai conformity refresh error:', error);
        res.status(500).json({ error: 'Failed to refresh PvEssai conformity', details: error.message });
    }
};

module.exports = {
    createPv,
    updatePv,
    getPvStats,
    getConformityByPower,
    getConformityTrend,
    getAvailableMonths,
    listPv,
    enrichPv,
    getPvById,
    deletePv,
    refreshAllPvsConformity
};
