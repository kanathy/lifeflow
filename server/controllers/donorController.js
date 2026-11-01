const dbResolver = require('../utils/dbResolver');

// @desc    Get all donors
// @route   GET /api/donors
// @access  Private
const getDonors = async (req, res) => {
  try {
    const donors = await dbResolver.find('Donor');
    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create donor
// @route   POST /api/donors
// @access  Private (Admin and Hospital users)
const createDonor = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const { name, bloodGroup, contact, email, status, district, lastDonationDate } = req.body;

  if (!name || !bloodGroup || !contact || !district) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  try {
    const donorId = `DON${Date.now()}`;
    const donor = await dbResolver.create('Donor', {
      donorId,
      name,
      bloodGroup,
      contact,
      email,
      status: status || 'Active',
      district,
      lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null
    });
    res.status(201).json(donor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update donor
// @route   PUT /api/donors/:id
// @access  Private (Admin only)
const updateDonor = async (req, res) => {
  if (!req.user || req.user.role !== 'Administrator') {
    return res.status(403).json({ message: 'Forbidden: Only administrators can edit donor records.' });
  }

  const { name, bloodGroup, contact, email, status, district, lastDonationDate } = req.body;

  try {
    const updated = await dbResolver.findByIdAndUpdate('Donor', req.params.id, {
      name,
      bloodGroup,
      contact,
      email,
      status,
      district,
      lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : undefined
    });

    if (!updated) {
      return res.status(404).json({ message: 'Donor not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete donor
// @route   DELETE /api/donors/:id
// @access  Private (Admin only)
const deleteDonor = async (req, res) => {
  if (!req.user || req.user.role !== 'Administrator') {
    return res.status(403).json({ message: 'Forbidden: Only administrators can remove donor records.' });
  }

  try {
    const deleted = await dbResolver.findByIdAndDelete('Donor', req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Donor not found' });
    }
    res.json({ message: 'Donor removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDonors,
  createDonor,
  updateDonor,
  deleteDonor
};
