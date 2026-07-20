const dbResolver = require('../utils/dbResolver');

// @desc    Get all blood inventory
// @route   GET /api/inventory
// @access  Private
const getInventory = async (req, res) => {
  try {
    const stock = await dbResolver.find('BloodInventory');
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new blood stock
// @route   POST /api/inventory
// @access  Private
const createStock = async (req, res) => {
  const { bloodGroup, rhFactor, district, availableUnits, expiryDays } = req.body;

  if (!bloodGroup || !rhFactor || !district || availableUnits === undefined) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const newStock = await dbResolver.create('BloodInventory', {
      bloodGroup,
      rhFactor,
      district,
      availableUnits: Number(availableUnits),
      expiryDays: Number(expiryDays || 35)
    });
    res.status(201).json(newStock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update blood stock
// @route   PUT /api/inventory/:id
// @access  Private
const updateStock = async (req, res) => {
  const { availableUnits, expiryDays, district, bloodGroup, rhFactor } = req.body;

  try {
    const updated = await dbResolver.findByIdAndUpdate('BloodInventory', req.params.id, {
      availableUnits: availableUnits !== undefined ? Number(availableUnits) : undefined,
      expiryDays: expiryDays !== undefined ? Number(expiryDays) : undefined,
      district,
      bloodGroup,
      rhFactor
    });

    if (!updated) {
      return res.status(404).json({ message: 'Stock entry not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete blood stock
// @route   DELETE /api/inventory/:id
// @access  Private
const deleteStock = async (req, res) => {
  try {
    const deleted = await dbResolver.findByIdAndDelete('BloodInventory', req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Stock entry not found' });
    }
    res.json({ message: 'Stock entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInventory,
  createStock,
  updateStock,
  deleteStock
};
