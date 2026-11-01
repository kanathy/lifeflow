const express = require('express');
const { getPredictions, recalculatePredictions, predictDisease, predictAccident, predictRainfall } = require('../controllers/predictionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Rainfall does not require auth (Prophet model — public forecast)
router.post('/rainfall', predictRainfall);

router.use(protect);
router.get('/', getPredictions);
router.post('/recalculate', recalculatePredictions);
router.post('/disease', predictDisease);
router.post('/accident', predictAccident);

module.exports = router;
