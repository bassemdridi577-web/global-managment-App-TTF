const express = require('express');
const router = express.Router();
const { getEuroRateForDate } = require('../services/bctExchangeService');

router.get('/euro-rate', async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Query parameter "date" is required (YYYY-MM-DD).' });
    }

    const result = await getEuroRateForDate(date);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch BCT exchange rate.' });
  }
});

module.exports = router;
