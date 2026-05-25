const express = require('express');
const router = express.Router();
const transformatorService = require('../services/transformatorService');

router.get('/', async (req, res) => {
  try {
    const transformators = await transformatorService.getTransformators();
    res.json(transformators);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { numero, puissance } = req.body;
    const newTransformator = await transformatorService.createTransformator({
      numero,
      puissance: parseFloat(puissance),
    });
    res.status(201).json(newTransformator);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { numero, puissance } = req.body;
    const updatedTransformator = await transformatorService.updateTransformator(req.params.id, {
      numero,
      puissance: parseFloat(puissance),
    });
    res.json(updatedTransformator);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await transformatorService.deleteTransformator(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
