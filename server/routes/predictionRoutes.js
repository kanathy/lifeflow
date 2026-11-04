const express = require('express');
const {
  getPredictions,
  recalculatePredictions,
  predictDisease,
  predictAccident,
  predictRainfall,
  predictShortage,
  getAllDistrictsNextMonthShortage
} = require('../controllers/predictionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ML Model forecasts (rainfall & shortage models)
router.post('/rainfall', predictRainfall);
router.post('/shortage', predictShortage);
router.get('/shortage/all-districts', getAllDistrictsNextMonthShortage);
router.post('/shortage/all-districts', getAllDistrictsNextMonthShortage);

router.use(protect);
router.get('/', getPredictions);
router.post('/recalculate', recalculatePredictions);
router.post('/disease', predictDisease);
router.post('/accident', predictAccident);

module.exports = router;
