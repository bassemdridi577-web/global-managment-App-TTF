const express = require('express');
const router = express.Router();
const stockService = require('../services/stockService');

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 500, filter = '' } = req.query;
    const stock = await stockService.getStock({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      filter,
    });
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/all', async (req, res) => {
  try {
    const stock = await stockService.getAllStock();
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { articleName, nombreUnite, poid, unit } = req.body;
    const newStock = await stockService.createStock({
      articleName,
      nombreUnite: parseInt(nombreUnite),
      poid: parseFloat(poid),
      unit,
    });
    res.status(201).json(newStock);
  } catch (error) {
    if (error.code === 'P2002' || error.code === 'P2002_CUSTOM') {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  console.log('PUT /api/stock/:id', req.params.id, req.body);
  try {
    const { articleName, nombreUnite, poid, unit } = req.body;
    const updatedStock = await stockService.updateStock(req.params.id, {
      articleName,
      nombreUnite: parseInt(nombreUnite),
      poid: parseFloat(poid),
      unit,
    });
    res.json(updatedStock);
  } catch (error) {
    console.error('Error in PUT /api/stock/:id', error);
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  console.log('DELETE /api/stock/:id', req.params.id);
  try {
    await stockService.deleteStock(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error in DELETE /api/stock/:id', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
