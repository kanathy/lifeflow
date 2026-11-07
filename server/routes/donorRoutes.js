const express = require('express');
const { getDonors, createDonor, updateDonor, deleteDonor, sendBulkEmailToDonors } = require('../controllers/donorController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/bulk-email', sendBulkEmailToDonors);

router.route('/')
  .get(getDonors)
  .post(createDonor);

router.route('/:id')
  .put(updateDonor)
  .delete(deleteDonor);

module.exports = router;
