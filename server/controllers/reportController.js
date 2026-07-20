const dbResolver = require('../utils/dbResolver');

// @desc    Get generated reports list
// @route   GET /api/reports
// @access  Private
const getReports = async (req, res) => {
  try {
    const list = await dbResolver.find('Report');
    list.sort((a, b) => new Date(b.generatedOn) - new Date(a.generatedOn));
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate a new report
// @route   POST /api/reports
// @access  Private
const generateReport = async (req, res) => {
  const { type, fromDate, toDate } = req.body;

  if (!type || !fromDate || !toDate) {
    return res.status(400).json({ message: 'Please specify report type and date range' });
  }

  try {
    const reportNames = {
      Inventory: 'Blood Inventory Report',
      Usage: 'Blood Usage Analytics Report',
      Donor: 'Donor Activity Log',
      Requests: 'Emergency Requests Summary',
      Summary: 'District-wise Status Summary'
    };

    const formattedRange = `${new Date(fromDate).toLocaleDateString('en-GB')} - ${new Date(toDate).toLocaleDateString('en-GB')}`;

    const report = await dbResolver.create('Report', {
      reportName: reportNames[type] || `${type} Report`,
      type,
      dateRange: formattedRange,
      generatedOn: new Date()
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download/Export report data
// @route   GET /api/reports/:id/export
// @access  Private
const exportReport = async (req, res) => {
  const { format } = req.query; // 'pdf' or 'excel'
  
  try {
    const report = await dbResolver.findById('Report', req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Mock Excel/CSV or PDF export data structure
    // We send a JSON representing tabular data that the client can format and download directly
    let headers = [];
    let rows = [];

    if (report.type === 'Inventory') {
      const stock = await dbResolver.find('BloodInventory');
      headers = ['Blood Group', 'Rh Factor', 'District', 'Available Units', 'Expiry Days'];
      rows = stock.map(s => [s.bloodGroup, s.rhFactor, s.district, s.availableUnits, s.expiryDays]);
    } else if (report.type === 'Donor') {
      const donors = await dbResolver.find('Donor');
      headers = ['Donor Name', 'Blood Group', 'Contact', 'District', 'Status'];
      rows = donors.map(d => [d.name, d.bloodGroup, d.contact, d.district, d.status]);
    } else {
      const reqs = await dbResolver.find('EmergencyRequest');
      headers = ['Patient Name', 'Blood Group', 'Hospital', 'District', 'Status', 'Requested At'];
      rows = reqs.map(r => [r.patientName, r.bloodGroup, r.hospital, r.district, r.status, new Date(r.requestedAt).toLocaleString()]);
    }

    res.json({
      filename: `${report.reportName.replace(/\s+/g, '_')}_${format === 'pdf' ? 'pdf' : 'xlsx'}`,
      headers,
      rows,
      generatedOn: report.generatedOn,
      reportName: report.reportName,
      dateRange: report.dateRange
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getReports,
  generateReport,
  exportReport
};
