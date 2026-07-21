const express = require('express');
const { 
  getReports, 
  generateReport, 
  exportReport, 
  exportAllData,
  getAccidentCases,
  createAccidentCase,
  getDiseaseCases,
  createDiseaseCase 
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/export-all', exportAllData);
router.route('/accidents')
  .get(getAccidentCases)
  .post(createAccidentCase);

router.route('/diseases')
  .get(getDiseaseCases)
  .post(createDiseaseCase);

router.route('/')
  .get(getReports)
  .post(generateReport);

router.get('/:id/export', exportReport);

module.exports = router;
