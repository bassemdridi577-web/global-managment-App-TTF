const commandeService = require('../services/commandeService');
const { commandeSchema } = require('../validations/commandeValidation');

const createCommande = async (req, res) => {
    try {
        const validatedData = commandeSchema.parse(req.body);
        const result = await commandeService.createCommande(validatedData);
        res.status(201).json(result);
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        console.error('Commande creation error:', error);
        res.status(500).json({ error: 'Failed to create Commande record', details: error.message });
    }
};

const updateCommande = async (req, res) => {
    try {
        const validatedData = commandeSchema.partial().parse(req.body);
        const result = await commandeService.updateCommande(req.params.id, validatedData);
        res.status(200).json(result);
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        console.error('Commande update error:', error);
        res.status(500).json({ error: 'Failed to update Commande record', details: error.message });
    }
};

const listCommandes = async (req, res) => {
    try {
        const result = await commandeService.listCommandes(req.query);
        res.json(result);
    } catch (error) {
        console.error('Commande list error:', error);
        res.status(500).json({ error: 'Failed to fetch Commande records', details: error.message });
    }
};

const getCommandeById = async (req, res) => {
    try {
        const commande = await commandeService.getCommandeById(req.params.id);
        if (!commande) {
            return res.status(404).json({ error: 'Commande not found' });
        }
        res.json(commande);
    } catch (error) {
        console.error('Commande fetch by ID error:', error);
        res.status(500).json({ error: 'Failed to fetch Commande record by ID', details: error.message });
    }
};

const deleteCommande = async (req, res) => {
    try {
        const result = await commandeService.deleteCommande(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        console.error('Commande deletion error:', error);
        res.status(500).json({ error: 'Failed to delete Commande record', details: error.message });
    }
};

module.exports = {
    createCommande,
    updateCommande,
    listCommandes,
    getCommandeById,
    deleteCommande
};
