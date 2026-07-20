const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dbResolver = require('../utils/dbResolver');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'lifeflowsecretkey', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (or Admin only depending on roles)
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await dbResolver.findOne('User', { email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password if using mock database (since pre save doesn't execute on mock resolver)
    let hashedPassword = password;
    if (process.env.USE_MOCK_DB === 'true') {
      hashedPassword = bcrypt.hashSync(password, 10);
    }

    const payload = {
      name,
      email,
      password: hashedPassword,
      role: role || 'Viewer',
      status: 'Active'
    };

    const user = await dbResolver.create('User', payload);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await dbResolver.findOne('User', { email });

    if (user) {
      let isMatch = false;
      if (process.env.USE_MOCK_DB === 'true') {
        isMatch = bcrypt.compareSync(password, user.password);
      } else {
        // Mongoose instance method
        const User = require('../models/User');
        const userDoc = await User.findById(user._id);
        isMatch = await userDoc.matchPassword(password);
      }

      if (isMatch) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          token: generateToken(user._id)
        });
      }
    }

    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await dbResolver.findById('User', req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  authUser,
  getUserProfile
};
