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
      Summary: 'District-wise Status Summary',
      Accident: 'Accident Cases Blood Report',
      Disease: 'Disease Cases Blood Report'
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

    // Build tabular data based on report type
    let headers = [];
    let rows = [];

    if (report.type === 'Inventory') {
      const stock = await dbResolver.find('BloodInventory');
      headers = ['Blood Group', 'Rh Factor', 'District', 'Available Units', 'Expiry Days'];
      rows = stock.map(s => [s.bloodGroup, s.rhFactor, s.district, s.availableUnits, s.expiryDays]);

    } else if (report.type === 'Donor') {
      const donors = await dbResolver.find('Donor');
      headers = ['Donor Name', 'Blood Group', 'Contact', 'District', 'Status', 'Last Donation'];
      rows = donors.map(d => [
        d.name, d.bloodGroup, d.contact, d.district, d.status,
        d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString('en-GB') : 'N/A'
      ]);

    } else if (report.type === 'Accident') {
      const cases = await dbResolver.find('AccidentCase');
      headers = ['Case ID', 'Patient Name', 'Age', 'Gender', 'Accident Type', 'Severity', 'Blood Group', 'Units Required', 'Hospital', 'District', 'Status', 'Admitted On', 'Notes'];
      rows = cases.map(c => [
        c.caseId, c.patientName, c.age, c.gender, c.accidentType, c.severity,
        c.bloodGroup, c.unitsRequired, c.hospital, c.district, c.status,
        c.admittedOn ? new Date(c.admittedOn).toLocaleDateString('en-GB') : 'N/A',
        c.notes || ''
      ]);

    } else if (report.type === 'Disease') {
      const cases = await dbResolver.find('DiseaseCase');
      headers = ['Case ID', 'Patient Name', 'Age', 'Gender', 'Disease Type', 'Severity', 'Blood Group', 'Units Required', 'Hospital', 'District', 'Status', 'Diagnosed On', 'Notes'];
      rows = cases.map(c => [
        c.caseId, c.patientName, c.age, c.gender, c.diseaseType, c.severity,
        c.bloodGroup, c.unitsRequired, c.hospital, c.district, c.status,
        c.diagnosedOn ? new Date(c.diagnosedOn).toLocaleDateString('en-GB') : 'N/A',
        c.notes || ''
      ]);

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

// @desc    Export ALL data as Excel (bulk export)
// @route   GET /api/reports/export-all
// @access  Private
const exportAllData = async (req, res) => {
  try {
    const [inventory, donors, requests, accidentCases, diseaseCases] = await Promise.all([
      dbResolver.find('BloodInventory'),
      dbResolver.find('Donor'),
      dbResolver.find('EmergencyRequest'),
      dbResolver.find('AccidentCase'),
      dbResolver.find('DiseaseCase')
    ]);

    res.json({
      exportedOn: new Date(),
      sheets: {
        inventory: {
          headers: ['Blood Group', 'Rh Factor', 'District', 'Available Units', 'Expiry Days'],
          rows: inventory.map(s => [s.bloodGroup, s.rhFactor, s.district, s.availableUnits, s.expiryDays])
        },
        donors: {
          headers: ['Donor Name', 'Blood Group', 'Contact', 'Email', 'District', 'Status', 'Last Donation'],
          rows: donors.map(d => [d.name, d.bloodGroup, d.contact, d.email || '', d.district, d.status,
            d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString('en-GB') : 'N/A'])
        },
        requests: {
          headers: ['Patient Name', 'Blood Group', 'Hospital', 'District', 'Status', 'Requested At'],
          rows: requests.map(r => [r.patientName, r.bloodGroup, r.hospital, r.district, r.status,
            new Date(r.requestedAt).toLocaleDateString('en-GB')])
        },
        accidentCases: {
          headers: ['Case ID', 'Patient Name', 'Age', 'Gender', 'Accident Type', 'Severity', 'Blood Group', 'Units Required', 'Hospital', 'District', 'Status', 'Admitted On'],
          rows: accidentCases.map(c => [c.caseId, c.patientName, c.age, c.gender, c.accidentType,
            c.severity, c.bloodGroup, c.unitsRequired, c.hospital, c.district, c.status,
            c.admittedOn ? new Date(c.admittedOn).toLocaleDateString('en-GB') : 'N/A'])
        },
        diseaseCases: {
          headers: ['Case ID', 'Patient Name', 'Age', 'Gender', 'Disease Type', 'Severity', 'Blood Group', 'Units Required', 'Hospital', 'District', 'Status', 'Diagnosed On'],
          rows: diseaseCases.map(c => [c.caseId, c.patientName, c.age, c.gender, c.diseaseType,
            c.severity, c.bloodGroup, c.unitsRequired, c.hospital, c.district, c.status,
            c.diagnosedOn ? new Date(c.diagnosedOn).toLocaleDateString('en-GB') : 'N/A'])
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get accident cases
// @route   GET /api/reports/accidents
// @access  Private
const getAccidentCases = async (req, res) => {
  try {
    const cases = await dbResolver.find('AccidentCase');
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create accident case
// @route   POST /api/reports/accidents
// @access  Private
const createAccidentCase = async (req, res) => {
  try {
    const cases = await dbResolver.find('AccidentCase');
    const count = cases.length + 1;
    const caseId = req.body.caseId || `ACC-2025-${String(count).padStart(3, '0')}`;
    const newCase = await dbResolver.create('AccidentCase', {
      ...req.body,
      caseId,
      date: req.body.date || 'May 31, 2025'
    });
    res.status(201).json(newCase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get disease cases
// @route   GET /api/reports/diseases
// @access  Private
const getDiseaseCases = async (req, res) => {
  try {
    const cases = await dbResolver.find('DiseaseCase');
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create disease case
// @route   POST /api/reports/diseases
// @access  Private
const createDiseaseCase = async (req, res) => {
  try {
    const cases = await dbResolver.find('DiseaseCase');
    const count = cases.length + 1;
    const caseId = req.body.caseId || `DIS-2025-${String(count).padStart(3, '0')}`;
    const newCase = await dbResolver.create('DiseaseCase', {
      ...req.body,
      caseId,
      date: req.body.date || 'May 30, 2025'
    });
    res.status(201).json(newCase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getReports,
  generateReport,
  exportReport,
  exportAllData,
  getAccidentCases,
  createAccidentCase,
  getDiseaseCases,
  createDiseaseCase
};
