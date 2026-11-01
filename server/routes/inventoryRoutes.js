const express = require('express');
const { getInventory, createStock, updateStock, deleteStock, seedInventory } = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/seed', seedInventory);

router.route('/')
  .get(getInventory)
  .post(createStock);

router.route('/:id')
  .put(updateStock)
  .delete(deleteStock);

module.exports = router;
