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
  const { bloodGroup, rhFactor, district, availableUnits, expiryDays, hospitalName } = req.body;

  if (!bloodGroup || !rhFactor || !district || availableUnits === undefined) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    let finalHospitalName = hospitalName || '';
    if (req.user && req.user.role !== 'Administrator') {
      finalHospitalName = await getUserHospitalName(req.user);
    }

    const newStock = await dbResolver.create('BloodInventory', {
      bloodGroup,
      rhFactor,
      district,
      hospitalName: finalHospitalName,
      availableUnits: Number(availableUnits),
      expiryDays: Number(expiryDays || 35)
    });
    res.status(201).json(newStock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper to resolve user's hospital name
const getUserHospitalName = async (user) => {
  if (!user) return '';
  if (user.hospitalId) {
    const hospDoc = await dbResolver.findOne('Hospital', { hospitalId: user.hospitalId });
    if (hospDoc && hospDoc.name) return hospDoc.name.trim();
  }
  return (user.name || '').trim();
};

const matchesHospital = (item, hospName) => {
  if (!hospName) return false;
  const h = (item.hospitalName || item.hospital || '').trim().toLowerCase();
  const target = hospName.toLowerCase();
  return h === target || (h && (h.includes(target) || target.includes(h)));
};

// @desc    Update blood stock
// @route   PUT /api/inventory/:id
// @access  Private
const updateStock = async (req, res) => {
  const { availableUnits, expiryDays, district, bloodGroup, rhFactor, hospitalName } = req.body;

  try {
    const existing = await dbResolver.findById('BloodInventory', req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Stock entry not found' });
    }

    // Role check: non-admin hospital users can only update their own hospital's stock
    if (req.user && req.user.role !== 'Administrator') {
      const myHospitalName = await getUserHospitalName(req.user);
      if (!matchesHospital(existing, myHospitalName)) {
        return res.status(403).json({ message: 'Forbidden: You are only permitted to update stock for your own hospital.' });
      }
    }

    const updated = await dbResolver.findByIdAndUpdate('BloodInventory', req.params.id, {
      availableUnits: availableUnits !== undefined ? Number(availableUnits) : undefined,
      expiryDays: expiryDays !== undefined ? Number(expiryDays) : undefined,
      district,
      bloodGroup,
      rhFactor,
      hospitalName: hospitalName || existing.hospitalName
    });

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
    const existing = await dbResolver.findById('BloodInventory', req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Stock entry not found' });
    }

    // Role check: non-admin hospital users can only delete their own hospital's stock
    if (req.user && req.user.role !== 'Administrator') {
      const myHospitalName = await getUserHospitalName(req.user);
      if (!matchesHospital(existing, myHospitalName)) {
        return res.status(403).json({ message: 'Forbidden: You are only permitted to delete stock for your own hospital.' });
      }
    }

    await dbResolver.findByIdAndDelete('BloodInventory', req.params.id);
    res.json({ message: 'Stock entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed or generate blood inventory for all 25 districts with all 8 blood groups
// @route   POST /api/inventory/seed
// @access  Private
const seedInventory = async (req, res) => {
  try {
    const { clearExisting } = req.body;
    const { seedAllDistrictsInventory } = require('../seedBloodInventory');
    const inserted = await seedAllDistrictsInventory(clearExisting !== false);
    res.status(201).json({
      message: `Successfully seeded ${inserted.length} blood stock records for all 25 districts!`,
      count: inserted.length,
      data: inserted
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInventory,
  createStock,
  updateStock,
  deleteStock,
  seedInventory
};
