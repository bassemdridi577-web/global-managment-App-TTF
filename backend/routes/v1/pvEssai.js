const express = require('express');
const router = express.Router();
const pvEssaiController = require('../../controllers/pvEssaiController');
const { authMiddleware, authorizeRoles } = require('../../middleware/authMiddleware');

router.post('/', authMiddleware, authorizeRoles(['admin', 'tester']), pvEssaiController.createPv);
router.put('/:id', authMiddleware, authorizeRoles(['admin', 'tester']), pvEssaiController.updatePv);
router.get('/stats', pvEssaiController.getPvStats);
router.get('/stats/conformity-by-power', pvEssaiController.getConformityByPower);
router.get('/stats/conformity-trend', pvEssaiController.getConformityTrend);
router.get('/available-months', pvEssaiController.getAvailableMonths);
router.get('/', pvEssaiController.listPv);
router.post('/:id/enrich', pvEssaiController.enrichPv);
router.get('/:id', pvEssaiController.getPvById);
router.delete('/:id', authMiddleware, authorizeRoles(['admin', 'tester']), pvEssaiController.deletePv);
router.post('/refresh-conformity', authMiddleware, authorizeRoles(['admin']), pvEssaiController.refreshAllPvsConformity);

module.exports = router;