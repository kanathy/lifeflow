const express = require('express');
const { getInventory, createStock, updateStock, deleteStock } = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.route('/')
  .get(getInventory)
  .post(createStock);

router.route('/:id')
  .put(updateStock)
  .delete(deleteStock);

module.exports = router;
