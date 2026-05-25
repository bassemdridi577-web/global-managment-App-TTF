const express = require('express');
const router = express.Router();
const factureRevisionService = require('../services/factureRevisionService');
const factureService = require('../services/factureService');

// REVISIONS ENDPOINTS
router.get('/revisions/:date', async (req, res) => {
  try {
    const revision = await factureRevisionService.getRevisionByDate(req.params.date);
    if (!revision) {
      return res.status(404).json({ message: 'No saved revision for this date.' });
    }
    res.json(revision);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load revision.' });
  }
});

router.post('/revisions', async (req, res) => {
  try {
    const { bctDate, euroRate, rows } = req.body;

    if (!bctDate) {
      return res.status(400).json({ message: 'Field "bctDate" is required.' });
    }

    if (!Array.isArray(rows)) {
      return res.status(400).json({ message: 'Field "rows" must be an array.' });
    }

    const saved = await factureRevisionService.saveRevision({ bctDate, euroRate, rows });
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to save revision.' });
  }
});

// INVOICES (FACTURES) ENDPOINTS
router.get('/', async (req, res) => {
  try {
    const factures = await factureService.getAllFactures();
    res.json(factures);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load factures.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const facture = await factureService.getFactureById(req.params.id);
    if (!facture) {
      return res.status(404).json({ message: 'Facture non trouvée.' });
    }
    res.json(facture);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load facture.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    if (!data.invoiceNumber) {
      return res.status(400).json({ message: 'Le numéro de facture est obligatoire.' });
    }
    const saved = await factureService.saveFacture(data);
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to save facture.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await factureService.deleteFacture(req.params.id);
    res.json({ success: true, message: 'Facture supprimée.' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete facture.' });
  }
});

module.exports = router;
