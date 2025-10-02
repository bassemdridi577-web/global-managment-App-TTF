const express = require('express');
const router = express.Router();
const commandeService = require('../services/commandeService');

router.post('/', async (req, res) => {
  try {
    const created = await commandeService.createCommande(req.body);
    res.status(201).json(created);
  } catch (err) {
    console.error('Create commande error', err);
    res.status(500).json({ error: 'Failed to create commande', details: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const list = await commandeService.listCommande(req.query || {});
    res.json(list);
  } catch (err) {
    console.error('List commande error', err);
    res.status(500).json({ error: 'Failed to list commandes', details: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  console.log('Request to delete commande id=', id);
  const parsed = Number(id);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return res.status(400).json({ error: 'Invalid id', details: `id must be a positive integer, got '${id}'` });
  }

  try {
    const deleted = await commandeService.deleteCommande(parsed);
    res.json(deleted);
  } catch (err) {
    console.error('Delete commande error for id=', id, err);
    if (err.code === 'P2025' || /not found/i.test(err.message)) {
      return res.status(404).json({ error: 'Commande not found', details: err.message });
    }
    res.status(500).json({ error: 'Failed to delete commande', details: err.message });
  }
});

module.exports = router;
