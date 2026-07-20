const express = require('express');
const { getDonors, createDonor, updateDonor, deleteDonor } = require('../controllers/donorController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.route('/')
  .get(getDonors)
  .post(createDonor);

router.route('/:id')
  .put(updateDonor)
  .delete(deleteDonor);

module.exports = router;
