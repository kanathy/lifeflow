const dbResolver = require('../utils/dbResolver');

// @desc    Get all requests (Admin gets all, Hospital gets ONLY requests directed to their hospital)
// @route   GET /api/requests
// @access  Private
const getRequests = async (req, res) => {
  try {
    let requests = await dbResolver.find('EmergencyRequest');

    const user = req.user;
    const isAdmin = user && user.role === 'Administrator';
    const isHospitalUser = user && (user.role === 'Hospital' || user.role === 'Hospital Staff' || !!user.hospitalId);

    if (!isAdmin && isHospitalUser) {
      let hospitalName = (user.name || '').trim();
      if (user.hospitalId) {
        const hospDoc = await dbResolver.findOne('Hospital', { hospitalId: user.hospitalId });
        if (hospDoc && hospDoc.name) {
          hospitalName = hospDoc.name.trim();
        }
      }

      if (hospitalName) {
        const target = hospitalName.toLowerCase();
        requests = requests.filter(r => {
          const reqH = (r.hospital || '').trim().toLowerCase();
          return reqH === target || (reqH && (reqH.includes(target) || target.includes(reqH)));
        });
      }
    }

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new emergency request
// @route   POST /api/requests
// @access  Private
// @desc    Create new emergency request
// @route   POST /api/requests
// @access  Private
const createRequest = async (req, res) => {
  const { patientName, bloodGroup, hospital, requesterHospital, units, district, status } = req.body;

  if (!patientName || !bloodGroup || !hospital || !district) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const existing = await dbResolver.find('EmergencyRequest');
    const reqId = req.body.requestId || `REQ${String(existing.length + 1).padStart(3, '0')}`;

    const request = await dbResolver.create('EmergencyRequest', {
      requestId: reqId,
      patientName,
      bloodGroup,
      hospital,
      requesterHospital: requesterHospital || req.user?.name || 'National Blood Transfusion Service',
      units: Number(units) || 1,
      district,
      status: status || 'Pending'
    });

    // Automatically trigger notification for new alert
    await dbResolver.create('Notification', {
      message: `Emergency request ${request.requestId} (${bloodGroup}) for ${patientName} - requested by ${request.requesterHospital} to ${hospital}`,
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
  const { patientName, bloodGroup, hospital, requesterHospital, units, district, status } = req.body;

  try {
    const oldRequest = await dbResolver.findById('EmergencyRequest', req.params.id);
    const updatePayload = {};
    if (patientName !== undefined) updatePayload.patientName = patientName;
    if (bloodGroup !== undefined) updatePayload.bloodGroup = bloodGroup;
    if (hospital !== undefined) updatePayload.hospital = hospital;
    if (requesterHospital !== undefined) updatePayload.requesterHospital = requesterHospital;
    if (units !== undefined) updatePayload.units = Number(units);
    if (district !== undefined) updatePayload.district = district;
    if (status !== undefined) updatePayload.status = status;

    const updated = await dbResolver.findByIdAndUpdate('EmergencyRequest', req.params.id, updatePayload);

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
