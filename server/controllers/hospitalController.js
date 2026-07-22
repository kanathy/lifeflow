const dbResolver = require('../utils/dbResolver');

// @desc    Get all hospitals
// @route   GET /api/hospitals
// @access  Private
const getHospitals = async (req, res) => {
  try {
    const hospitals = await dbResolver.find('Hospital');
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new hospital
// @route   POST /api/hospitals
// @access  Private
const createHospital = async (req, res) => {
  const { name, district, type, contact, status } = req.body;

  // allow client-provided hospitalId, otherwise generate one
  const hospitalId = req.body.hospitalId || `HSP${Date.now()}`;

  if (!name || !district || !contact) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  try {
    const hospital = await dbResolver.create('Hospital', {
      hospitalId,
      name,
      district,
      type: type || 'Government',
      contact,
      status: status || 'Active'
    });
    res.status(201).json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update hospital
// @route   PUT /api/hospitals/:id
// @access  Private
const updateHospital = async (req, res) => {
  const { name, district, type, contact, status } = req.body;

  try {
    const updated = await dbResolver.findByIdAndUpdate('Hospital', req.params.id, {
      name,
      district,
      type,
      contact,
      status
    });

    if (!updated) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete hospital
// @route   DELETE /api/hospitals/:id
// @access  Private
const deleteHospital = async (req, res) => {
  try {
    const deleted = await dbResolver.findByIdAndDelete('Hospital', req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    res.json({ message: 'Hospital removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHospitals,
  createHospital,
  updateHospital,
  deleteHospital
};
