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
// @access  Private (Admin only)
const createHospital = async (req, res) => {
  if (req.user && req.user.role !== 'Administrator') {
    return res.status(403).json({ message: 'Forbidden: Only administrators can add new hospitals.' });
  }

  const { name, district, type, contact, email, address, status } = req.body;

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
      email: email || '',
      address: address || '',
      status: status || 'Active'
    });
    res.status(201).json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update hospital
// @route   PUT /api/hospitals/:id
// @access  Private (Admin or own hospital staff)
const updateHospital = async (req, res) => {
  const { name, district, type, contact, email, address, status } = req.body;

  try {
    const existing = await dbResolver.findById('Hospital', req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Role check: non-admin hospital users can only update their own hospital details
    if (req.user && req.user.role !== 'Administrator') {
      const myHospitalName = (req.user.name || '').trim().toLowerCase();
      const myHospId = req.user.hospitalId;
      const isMatch = (myHospId && existing.hospitalId === myHospId) ||
        (existing.name && myHospitalName && (existing.name.toLowerCase().includes(myHospitalName) || myHospitalName.includes(existing.name.toLowerCase())));

      if (!isMatch) {
        return res.status(403).json({ message: 'Forbidden: You can only update details for your own hospital.' });
      }
    }

    const updated = await dbResolver.findByIdAndUpdate('Hospital', req.params.id, {
      name: (req.user && req.user.role !== 'Administrator') ? existing.name : (name || existing.name), // Non-admin cannot rename the hospital
      district: (req.user && req.user.role !== 'Administrator') ? existing.district : (district || existing.district),
      type: (req.user && req.user.role !== 'Administrator') ? existing.type : (type || existing.type),
      contact,
      email: email !== undefined ? email : existing.email,
      address: address !== undefined ? address : existing.address,
      status: (req.user && req.user.role !== 'Administrator') ? existing.status : (status || existing.status)
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete hospital
// @route   DELETE /api/hospitals/:id
// @access  Private (Admin only)
const deleteHospital = async (req, res) => {
  if (req.user && req.user.role !== 'Administrator') {
    return res.status(403).json({ message: 'Forbidden: Only administrators can delete hospitals.' });
  }

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
