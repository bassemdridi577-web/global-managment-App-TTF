const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('GET /api/test');
});

router.put('/:id', (req, res) => {
  res.send(`PUT /api/test/${req.params.id}`);
});

router.delete('/:id', (req, res) => {
  res.send(`DELETE /api/test/${req.params.id}`);
});

module.exports = router;
