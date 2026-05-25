const express = require('express');
const router = express.Router();
const commandeController = require('../../controllers/commandeController');
const { authMiddleware, authorizeRoles } = require('../../middleware/authMiddleware');

router.post('/', authMiddleware, authorizeRoles(['admin', 'tester']), commandeController.createCommande);
router.get('/', commandeController.listCommandes);
router.put('/:id', authMiddleware, authorizeRoles(['admin', 'tester']), commandeController.updateCommande);
router.delete('/:id', authMiddleware, authorizeRoles(['admin']), commandeController.deleteCommande);
router.get('/:id', commandeController.getCommandeById);

module.exports = router;
