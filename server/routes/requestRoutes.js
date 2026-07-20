const express = require('express');
const { getRequests, createRequest, updateRequest, deleteRequest } = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.route('/')
  .get(getRequests)
  .post(createRequest);

router.route('/:id')
  .put(updateRequest)
  .delete(deleteRequest);

module.exports = router;
