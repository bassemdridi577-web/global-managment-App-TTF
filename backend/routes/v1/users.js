const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const { authMiddleware, authorizeRoles } = require('../../middleware/authMiddleware');

router.get('/', authMiddleware, userController.listUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', authMiddleware, userController.updateUser);
router.post('/', userController.createUser);
router.delete('/:id', authMiddleware, authorizeRoles(['admin']), userController.deleteUser);

module.exports = router;
