const productionLineService = require('../services/productionLineService');
const { productionLineSchema } = require('../validations/productionLineValidation');

const createProductionLine = async (req, res) => {
    try {
        const validatedData = productionLineSchema.parse(req.body);
        const result = await productionLineService.createProductionLine(validatedData);
        res.status(201).json(result);
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        console.error('ProductionLine creation error:', error);
        res.status(500).json({ error: 'Failed to create ProductionLine record', details: error.message });
    }
};

const updateProductionLine = async (req, res) => {
    try {
        const validatedData = productionLineSchema.partial().parse(req.body);
        const result = await productionLineService.updateProductionLine(req.params.id, validatedData);
        res.status(200).json(result);
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        console.error('ProductionLine update error:', error);
        res.status(500).json({ error: 'Failed to update ProductionLine record', details: error.message });
    }
};

const listProductionLines = async (req, res) => {
    try {
        const list = await productionLineService.listProductionLine(req.query || {});
        res.json(list);
    } catch (error) {
        console.error('ProductionLine list error:', error);
        res.status(500).json({ error: 'Failed to fetch ProductionLine records', details: error.message });
    }
};

const getProductionLineById = async (req, res) => {
    try {
        const record = await productionLineService.getProductionLineById(req.params.id);
        if (!record) {
            return res.status(404).json({ error: 'ProductionLine not found' });
        }
        res.json(record);
    } catch (error) {
        console.error('ProductionLine fetch by ID error:', error);
        res.status(500).json({ error: 'Failed to fetch ProductionLine record by ID', details: error.message });
    }
};

const deleteProductionLine = async (req, res) => {
    try {
        const result = await productionLineService.deleteProductionLine(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        console.error('ProductionLine deletion error:', error);
        res.status(500).json({ error: 'Failed to delete ProductionLine record', details: error.message });
    }
};

module.exports = {
    createProductionLine,
    updateProductionLine,
    listProductionLines,
    getProductionLineById,
    deleteProductionLine
};
