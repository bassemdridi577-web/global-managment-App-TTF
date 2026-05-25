const express = require('express');
const router = express.Router();
const logService = require('../services/logService');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, authorizeRoles(['admin']), async (req, res) => {
  try {
    const logs = await logService.getLogs(req.query);
    res.json(logs);
  } catch (error) {
    console.error('Failed to fetch action logs:', error);
    res.status(500).json({ error: 'Failed to fetch action logs', details: error.message });
  }
});

module.exports = router;
