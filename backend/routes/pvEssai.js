const express = require('express');
const router = express.Router();
const pvService = require('../services/pvService');

router.post('/', async (req, res) => {
  try {
    const result = await pvService.createPv(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('PvEssai creation error:', error);
    res.status(500).json({ error: 'Failed to create PvEssai record', details: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const result = await pvService.updatePv(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('PvEssai update error:', error);
    res.status(500).json({ error: 'Failed to update PvEssai record', details: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await pvService.getPvStats(req.query || {});
    res.json(stats);
  } catch (error) {
    console.error('PvEssai stats error:', error);
    res.status(500).json({ error: 'Failed to fetch PvEssai stats', details: error.message });
  }
});

router.get('/available-months', async (req, res) => {
  try {
    const months = await pvService.getAvailableMonths();
    res.json(months);
  } catch (error) {
    console.error('PvEssai available-months error:', error);
    res.status(500).json({ error: 'Failed to fetch available months', details: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const list = await pvService.listPv(req.query || {});
    res.json(list);
  } catch (error) {
    console.error('PvEssai list error:', error);
    res.status(500).json({ error: 'Failed to fetch PvEssai records', details: error.message });
  }
});

router.post('/:id/enrich', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pvService.enrichPv(id);
    res.json(result);
  } catch (error) {
    console.error('PvEssai enrich error:', error);
    res.status(500).json({ error: 'Failed to enrich PvEssai record', details: error.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const pv = await pvService.getPvById(req.params.id);
    res.json(pv);
  } catch (error) {
    console.error('PvEssai fetch by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch PvEssai record by ID', details: error.message });
  }
});

module.exports = router;