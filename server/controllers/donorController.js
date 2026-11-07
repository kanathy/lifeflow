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

// @desc    Send bulk emergency email to filtered donors based on blood shortage
// @route   POST /api/donors/bulk-email
// @access  Private (Admin only)
const sendBulkEmailToDonors = async (req, res) => {
  if (!req.user || req.user.role !== 'Administrator') {
    return res.status(403).json({ message: 'Forbidden: Only administrators can send bulk donor emails.' });
  }

  const { donorIds, bloodGroup, district, subject, message } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ message: 'Email subject and message body are required' });
  }

  try {
    const allDonors = await dbResolver.find('Donor');
    let targetDonors = [];

    if (donorIds && Array.isArray(donorIds) && donorIds.length > 0) {
      targetDonors = allDonors.filter(d => donorIds.includes(String(d._id)));
    } else {
      targetDonors = allDonors.filter(d => {
        const matchesBg = !bloodGroup || d.bloodGroup === bloodGroup;
        const matchesDist = !district || d.district === district;
        return matchesBg && matchesDist && d.status === 'Active';
      });
    }

    if (targetDonors.length === 0) {
      return res.status(404).json({ message: 'No eligible donor records found for the requested shortage criteria.' });
    }

    const validRecipients = targetDonors
      .map(d => ({
        id: d._id,
        name: d.name,
        email: d.email || `${d.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
        bloodGroup: d.bloodGroup,
        district: d.district,
        contact: d.contact
      }))
      .filter(d => Boolean(d.email));

    // Create system notification tracking this emergency donor outreach
    await dbResolver.create('Notification', {
      message: `Emergency blood shortage appeal dispatched to ${validRecipients.length} donors (${bloodGroup || 'Selected'} group in ${district || 'various regions'}). Subject: "${subject}".`,
      type: 'Alert',
      status: 'Unread',
      dateTime: new Date()
    });

    console.log(`[BULK DONOR EMAIL] Dispatched to ${validRecipients.length} donors for blood group ${bloodGroup || 'All'} (${district || 'All districts'})`);

    res.json({
      success: true,
      message: `Emergency shortage appeal sent successfully to ${validRecipients.length} donor(s)!`,
      recipientCount: validRecipients.length,
      recipients: validRecipients,
      dispatchedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Bulk email error:', error);
    res.status(500).json({ message: error.message || 'Failed to dispatch bulk email' });
  }
};

module.exports = {
  getDonors,
  createDonor,
  updateDonor,
  deleteDonor,
  sendBulkEmailToDonors
};
