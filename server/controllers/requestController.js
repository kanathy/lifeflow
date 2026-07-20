const dbResolver = require('../utils/dbResolver');

// @desc    Get all requests
// @route   GET /api/requests
// @access  Private
const getRequests = async (req, res) => {
  try {
    const requests = await dbResolver.find('EmergencyRequest');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new emergency request
// @route   POST /api/requests
// @access  Private
const createRequest = async (req, res) => {
  const { patientName, bloodGroup, hospital, district, status } = req.body;

  if (!patientName || !bloodGroup || !hospital || !district) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const request = await dbResolver.create('EmergencyRequest', {
      patientName,
      bloodGroup,
      hospital,
      district,
      status: status || 'Pending'
    });

    // Automatically trigger notification for new alert
    await dbResolver.create('Notification', {
      message: `Emergency request ${request.requestId} (${bloodGroup}) created by ${hospital}`,
      type: 'Alert',
      status: 'Unread'
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update request status
// @route   PUT /api/requests/:id
// @access  Private
const updateRequest = async (req, res) => {
  const { patientName, bloodGroup, hospital, district, status } = req.body;

  try {
    const oldRequest = await dbResolver.findById('EmergencyRequest', req.params.id);
    const updated = await dbResolver.findByIdAndUpdate('EmergencyRequest', req.params.id, {
      patientName,
      bloodGroup,
      hospital,
      district,
      status
    });

    if (!updated) {
      return res.status(404).json({ message: 'Emergency request not found' });
    }

    // Trigger notification if status changes to Accepted or Completed
    if (status && oldRequest && oldRequest.status !== status) {
      await dbResolver.create('Notification', {
        message: `Emergency request ${updated.requestId} status changed to ${status}`,
        type: 'System',
        status: 'Unread'
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete request
// @route   DELETE /api/requests/:id
// @access  Private
const deleteRequest = async (req, res) => {
  try {
    const deleted = await dbResolver.findByIdAndDelete('EmergencyRequest', req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json({ message: 'Emergency request removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRequests,
  createRequest,
  updateRequest,
  deleteRequest
};
