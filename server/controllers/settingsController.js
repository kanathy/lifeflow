const dbResolver = require('../utils/dbResolver');

// @desc    Get global settings
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    const settings = await dbResolver.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update global settings
// @route   PUT /api/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const updated = await dbResolver.updateSettings(req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
