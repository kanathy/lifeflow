const bcrypt = require('bcryptjs');
const dbResolver = require('../utils/dbResolver');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin Only)
const getUsers = async (req, res) => {
  try {
    const list = await dbResolver.find('User');
    // Remove passwords from response
    const sanitized = list.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new user
// @route   POST /api/users
// @access  Private (Admin Only)
const createUser = async (req, res) => {
  const { name, email, password, role, status } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const userExists = await dbResolver.findOne('User', { email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await dbResolver.create('User', {
      name,
      email,
      password: hashedPassword,
      role,
      status: status || 'Active'
    });

    const { password: _, ...sanitized } = user;
    res.status(201).json(sanitized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user details & role
// @route   PUT /api/users/:id
// @access  Private (Admin Only)
const updateUser = async (req, res) => {
  const { name, email, role, status, password } = req.body;

  try {
    const updateData = { name, email, role, status };
    if (password) {
      updateData.password = bcrypt.hashSync(password, 10);
    }

    const updated = await dbResolver.findByIdAndUpdate('User', req.params.id, updateData);

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password: _, ...sanitized } = updated;
    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin Only)
const deleteUser = async (req, res) => {
  try {
    const deleted = await dbResolver.findByIdAndDelete('User', req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser
};
