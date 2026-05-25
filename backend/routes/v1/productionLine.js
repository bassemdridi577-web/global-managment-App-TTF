const express = require('express');
const router = express.Router();
const productionLineController = require('../../controllers/productionLineController');
const { authMiddleware, authorizeRoles } = require('../../middleware/authMiddleware');

router.get('/', productionLineController.listProductionLines);
router.get('/:id(\\d+)', productionLineController.getProductionLineById);
router.post('/', authMiddleware, authorizeRoles(['admin', 'tester']), productionLineController.createProductionLine);
router.put('/:id', authMiddleware, authorizeRoles(['admin', 'tester']), productionLineController.updateProductionLine);
router.delete('/:id', authMiddleware, authorizeRoles(['admin']), productionLineController.deleteProductionLine);

module.exports = router;
