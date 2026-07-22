const express = require('express');
const { registerUser, authUser, getUserProfile, registerHospitalAccount } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/register-hospital', registerHospitalAccount);
router.get('/profile', protect, getUserProfile);

module.exports = router;
