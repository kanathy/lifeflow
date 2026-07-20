const express = require('express');
const { getReports, generateReport, exportReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.route('/')
  .get(getReports)
  .post(generateReport);

router.get('/:id/export', exportReport);

module.exports = router;
