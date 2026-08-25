const express = require('express');
const { getPredictions, recalculatePredictions, predictDisease, predictAccident } = require('../controllers/predictionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getPredictions);
router.post('/recalculate', recalculatePredictions);
router.post('/disease', predictDisease);
router.post('/accident', predictAccident);

module.exports = router;
