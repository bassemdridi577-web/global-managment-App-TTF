const express = require('express');
const router = express.Router();
const productionStepService = require('../services/productionStepService');

// GET /api/production-steps/:productionLineId
router.get('/:productionLineId', async (req, res) => {
  try {
    const { productionLineId } = req.params;
    const steps = await productionStepService.getProductionSteps(productionLineId);
    res.json(steps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/production-steps
router.post('/', async (req, res) => {
  try {
    const { productionLineId, stepName, data } = req.body;
    const newStep = await productionStepService.createOrUpdateProductionStep(productionLineId, stepName, data);
    res.status(201).json(newStep);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
