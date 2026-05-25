const express = require('express');
const router = express.Router();
const productionLineService = require('../services/productionLineService');

// GET /api/production-line
router.get('/', async (req, res) => {
  try {
    const productionLines = await productionLineService.getAllProductionLines(req.query);
    res.json(productionLines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/production-line/:id
router.get('/:id(\\d+)', async (req, res) => {
  try {
    const { id } = req.params;
    const productionLine = await productionLineService.getProductionLineById(id);
    if (!productionLine) {
      return res.status(404).json({ message: 'Production line not found' });
    }
    res.json(productionLine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/production-line/commande/:commandeId
router.get('/commande/:commandeId(\\d+)', async (req, res) => {
  try {
    const { commandeId } = req.params;
    const productionLines = await productionLineService.getProductionLinesByCommandeId(parseInt(commandeId));
    res.json(productionLines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/production-line
router.post('/', async (req, res) => {
  try {
    const newProductionLine = await productionLineService.createProductionLine(req.body);
    res.status(201).json(newProductionLine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/production-line/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProductionLine = await productionLineService.updateProductionLine(id, req.body);
    res.json(updatedProductionLine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/production-line/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProductionLine = await productionLineService.deleteProductionLine(id);
    res.json({ message: 'Production line deleted successfully', data: deletedProductionLine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
