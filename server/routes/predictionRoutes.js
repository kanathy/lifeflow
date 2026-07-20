const express = require('express');
const { getPredictions, recalculatePredictions } = require('../controllers/predictionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getPredictions);
router.post('/recalculate', recalculatePredictions);

module.exports = router;
