const express = require('express');
const { getHospitals, createHospital, updateHospital, deleteHospital } = require('../controllers/hospitalController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.route('/')
  .get(getHospitals)
  .post(createHospital);

router.route('/:id')
  .put(updateHospital)
  .delete(deleteHospital);

module.exports = router;
