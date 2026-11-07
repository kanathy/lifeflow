const dbResolver = require('../utils/dbResolver');

const ML_BASE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Helper: POST to the Python ML service with timeout
const callML = async (endpoint, body) => {
  const response = await fetch(`${ML_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(3500)
  });
  if (!response.ok) throw new Error(`ML service error: ${response.status}`);
  return response.json();
};

// @desc    Get all dashboard details in one go
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const stock = await dbResolver.find('BloodInventory');
    const donors = await dbResolver.find('Donor');
    const hospitals = await dbResolver.find('Hospital');
    const requests = await dbResolver.find('EmergencyRequest');
    const notifications = await dbResolver.find('Notification');
    const predictions = await dbResolver.find('Prediction');

    // 0. Detect user role: Administrator sees national data, Hospital user sees their own hospital's data
    let isHospitalUser = false;
    let userHospitalName = '';
    let userHospitalDistrict = '';
    let userHospitalType = 'Government';

    if (req.user && req.user.role !== 'Administrator') {
      isHospitalUser = true;

      let hospitalDoc = null;
      if (req.user.hospitalId) {
        hospitalDoc = await dbResolver.findOne('Hospital', { hospitalId: req.user.hospitalId });
      }
      if (!hospitalDoc && req.user.name) {
        hospitalDoc = await dbResolver.findOne('Hospital', { name: new RegExp(`^${req.user.name.trim()}$`, 'i') });
      }
      if (!hospitalDoc && req.user.name) {
        const cleanName = req.user.name.replace(/hospital/i, '').trim();
        if (cleanName) {
          hospitalDoc = await dbResolver.findOne('Hospital', { name: new RegExp(cleanName, 'i') });
        }
      }

      userHospitalName = hospitalDoc ? hospitalDoc.name : (req.user.hospitalName || req.user.name || '');
      userHospitalDistrict = hospitalDoc ? hospitalDoc.district : (req.user.hospitalDistrict || '');
      userHospitalType = hospitalDoc ? hospitalDoc.type : 'Government';

      // Fallback if district not found: search stock for matching hospital
      if (!userHospitalDistrict && userHospitalName) {
        const sMatch = stock.find(s => s.hospitalName && s.hospitalName.toLowerCase() === userHospitalName.toLowerCase());
        if (sMatch && sMatch.district) {
          userHospitalDistrict = sMatch.district;
        }
      }
    }

    // Helper to match an item to the current hospital user
    const matchesHospital = (item, hospName) => {
      if (!hospName) return false;
      const h = (item.hospitalName || item.hospital || '').trim().toLowerCase();
      const target = hospName.toLowerCase();
      return h === target || (h && (h.includes(target) || target.includes(h)));
    };

    let hospitalStock = [];
    if (isHospitalUser) {
      hospitalStock = stock.filter(item => {
        if (matchesHospital(item, userHospitalName)) return true;
        if (userHospitalDistrict && item.district && item.district.toLowerCase() === userHospitalDistrict.toLowerCase()) {
          const h = (item.hospitalName || item.hospital || '').trim();
          if (!h || matchesHospital(item, userHospitalName)) return true;
        }
        return false;
      });

      // If no inventory found by name, fallback to district stock
      if (hospitalStock.length === 0 && userHospitalDistrict) {
        hospitalStock = stock.filter(item => item.district && item.district.toLowerCase() === userHospitalDistrict.toLowerCase());
      }
    }

    const currentStock = isHospitalUser ? hospitalStock : stock;

    // 1. Calculations for Stat Cards
    const totalBloodUnits = currentStock.reduce((acc, curr) => acc + (Number(curr.availableUnits) || 0), 0);

    // Active donors: for hospital user, count active donors in hospital's district
    let activeDonors = 0;
    if (isHospitalUser && userHospitalDistrict) {
      const distDonors = donors.filter(d =>
        d.district && d.district.toLowerCase() === userHospitalDistrict.toLowerCase() && d.status === 'Active'
      );
      activeDonors = distDonors.length;
    } else {
      activeDonors = donors.filter(d => d.status === 'Active').length;
    }

    // Registered Hospitals card: for hospital user, show their facility info
    const registeredHospitals = isHospitalUser ? 1 : hospitals.length;
    const hospitalFacility = isHospitalUser
      ? (userHospitalType ? `${userHospitalType} Center` : 'Active Center')
      : `${hospitals.length} Centers`;

    // Emergency requests: for hospital user, show requests involving their hospital or district
    let emergencyRequests = 0;
    if (isHospitalUser) {
      const hospRequests = requests.filter(r => {
        const isPendingOrAccepted = r.status === 'Pending' || r.status === 'Accepted';
        if (!isPendingOrAccepted) return false;
        const hTarget = (userHospitalName || '').toLowerCase();
        const rHosp = (r.hospital || '').toLowerCase();
        const rReqHosp = (r.requesterHospital || '').toLowerCase();
        const matchName = hTarget && (rHosp.includes(hTarget) || hTarget.includes(rHosp) || rReqHosp.includes(hTarget) || hTarget.includes(rReqHosp));
        const matchDist = userHospitalDistrict && r.district && r.district.toLowerCase() === userHospitalDistrict.toLowerCase();
        return matchName || matchDist;
      });
      emergencyRequests = hospRequests.length;
    } else {
      emergencyRequests = requests.filter(r => r.status === 'Pending' || r.status === 'Accepted').length;
    }

    // Expiring soon: inventory items where expiryDays <= 7 (hospital stock or national stock)
    const expiringSoonUnits = currentStock
      .filter(item => item.expiryDays <= 7)
      .reduce((acc, curr) => acc + (Number(curr.availableUnits) || 0), 0);

    // 2. Blood Stock by Blood Group chart
    const bloodGroupStock = {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'O+': 0, 'O-': 0, 'AB+': 0, 'AB-': 0
    };
    currentStock.forEach(item => {
      if (bloodGroupStock[item.bloodGroup] !== undefined) {
        bloodGroupStock[item.bloodGroup] += (Number(item.availableUnits) || 0);
      }
    });

    // Critical Shortages: For hospital, count blood groups with < 30 units; for admin, count districts with < 200 units
    let criticalShortages = 0;
    if (isHospitalUser) {
      criticalShortages = Object.keys(bloodGroupStock).filter(bg => bloodGroupStock[bg] < 30).length;
    } else {
      const districtGroups = {};
      stock.forEach(item => {
        districtGroups[item.district] = (districtGroups[item.district] || 0) + item.availableUnits;
      });
      criticalShortages = Object.keys(districtGroups).filter(d => districtGroups[d] < 200).length;
    }

    // 3. District-wise Availability for Map & Monitoring
    // We categorize each district: Good (>300 units), Low (100 - 300 units), Critical (<100 units)
    const districtAvailability = {};
    const defaultDistricts = [
      'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
      'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
      'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
      'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
      'Moneragala', 'Ratnapura', 'Kegalle'
    ];

    defaultDistricts.forEach(d => {
      districtAvailability[d] = {
        totalUnits: 0,
        status: 'Critical',
        bloodGroups: {
          'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'O+': 0, 'O-': 0, 'AB+': 0, 'AB-': 0
        },
        hasRealStock: false
      };
    });

    // Populate actual stock data from BloodInventory database
    stock.forEach(item => {
      const dist = item.district;
      if (!dist) return;

      if (!districtAvailability[dist]) {
        districtAvailability[dist] = {
          totalUnits: 0,
          status: 'Critical',
          bloodGroups: {
            'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'O+': 0, 'O-': 0, 'AB+': 0, 'AB-': 0
          },
          hasRealStock: true
        };
      } else {
        districtAvailability[dist].hasRealStock = true;
      }

      const units = Number(item.availableUnits) || 0;
      districtAvailability[dist].totalUnits += units;
      if (item.bloodGroup && districtAvailability[dist].bloodGroups[item.bloodGroup] !== undefined) {
        districtAvailability[dist].bloodGroups[item.bloodGroup] += units;
      }
    });

    Object.keys(districtAvailability).forEach(dist => {
      const units = districtAvailability[dist].totalUnits;
      if (units > 300) {
        districtAvailability[dist].status = 'Good';
      } else if (units >= 100) {
        districtAvailability[dist].status = 'Low';
      } else {
        districtAvailability[dist].status = 'Critical';
      }
      delete districtAvailability[dist].hasRealStock;
    });

    // 4. Monthly Overview (Donations vs Usage Chart)
    const monthlyOverview = [
      { month: 'Jan', donations: 1500, usage: 800 },
      { month: 'Feb', donations: 2200, usage: 1400 },
      { month: 'Mar', donations: 2100, usage: 1300 },
      { month: 'Apr', donations: 1400, usage: 900 },
      { month: 'May', donations: 1500, usage: 1100 },
      { month: 'Jun', donations: 1900, usage: 1200 }
    ];

    // 5. Recent lists (sorted, sliced)
    const hospitalRequestsList = isHospitalUser
      ? requests.filter(r => {
          const hTarget = (userHospitalName || '').toLowerCase();
          const rHosp = (r.hospital || '').toLowerCase();
          const rReqHosp = (r.requesterHospital || '').toLowerCase();
          const matchName = hTarget && (rHosp.includes(hTarget) || hTarget.includes(rHosp) || rReqHosp.includes(hTarget) || hTarget.includes(rReqHosp));
          const matchDist = userHospitalDistrict && r.district && r.district.toLowerCase() === userHospitalDistrict.toLowerCase();
          return matchName || matchDist;
        })
      : requests;

    const recentRequests = [...(hospitalRequestsList.length > 0 ? hospitalRequestsList : requests)]
      .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))
      .slice(0, 5);

    const hospitalDonationsList = (isHospitalUser && userHospitalDistrict)
      ? donors.filter(d => d.district && d.district.toLowerCase() === userHospitalDistrict.toLowerCase())
      : donors;

    const recentDonations = [...(hospitalDonationsList.length > 0 ? hospitalDonationsList : donors)]
      .sort((a, b) => new Date(b.lastDonationDate) - new Date(a.lastDonationDate))
      .slice(0, 5);

    // 6. Notifications unread count
    const unreadNotifications = notifications.filter(n => n.status === 'Unread').length;

    // 7. Next Month Blood Shortage Prediction using Model 3 ML Service
    const now = new Date();
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthNum = nextMonthDate.getMonth() + 1;
    const nextYearNum = nextMonthDate.getFullYear();
    const nextMonthName = nextMonthDate.toLocaleString('en-US', { month: 'short' });
    const nextMonthFullName = nextMonthDate.toLocaleString('en-US', { month: 'long' });

    const priorityDistricts = ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Gampaha', 'Kurunegala', 'Kalutara'];
    let nextMonthPredictions = [];

    try {
      nextMonthPredictions = await Promise.all(
        priorityDistricts.map(async (dist) => {
          try {
            const mlRes = await callML('/api/predict/shortage', {
              district: dist,
              month: nextMonthNum,
              monthNumber: nextMonthNum,
              year: nextYearNum,
              bloodGroup: 'All'
            });
            const units = mlRes.totalEstimatedUnits || mlRes.estimatedUnits || 150;
            const topBgs = (mlRes.breakdown || []).slice(0, 3).map(b => `${b.bg} (${b.units} U)`).join(', ');
            return {
              district: dist,
              month: nextMonthNum,
              year: nextYearNum,
              monthName: nextMonthName,
              shortageExpected: mlRes.shortageExpected || 'Yes',
              shortageRisk: mlRes.shortageRisk || 70,
              riskLevel: mlRes.riskLevel || 'Medium Risk',
              estimatedUnits: units,
              topCriticalGroups: topBgs || 'O+ (148 U), A+ (119 U), B- (85 U)',
              breakdown: mlRes.breakdown || []
            };
          } catch (e) {
            const currentStock = districtAvailability[dist]?.totalUnits || 100;
            const estimatedShortage = Math.max(30, 380 - currentStock);
            const risk = estimatedShortage > 250 ? 'High Risk' : estimatedShortage >= 120 ? 'Medium Risk' : 'Low Risk';
            const riskPct = estimatedShortage > 250 ? 88 : estimatedShortage >= 120 ? 63 : 42;
            const fallbackShares = [
              { bg: 'O+', pct: 35.0 },
              { bg: 'A+', pct: 28.0 },
              { bg: 'B+', pct: 18.0 }
            ];
            const topBgs = fallbackShares.map(s => `${s.bg} (${Math.round(estimatedShortage * (s.pct / 100))} U)`).join(', ');
            return {
              district: dist,
              month: nextMonthNum,
              year: nextYearNum,
              monthName: nextMonthName,
              shortageExpected: 'Yes',
              shortageRisk: riskPct,
              riskLevel: risk,
              estimatedUnits: estimatedShortage,
              topCriticalGroups: topBgs,
              breakdown: []
            };
          }
        })
      );
    } catch (err) {
      console.warn('Dashboard ML prediction call failed, using fallback:', err.message);
    }

    if (!nextMonthPredictions.length) {
      nextMonthPredictions = priorityDistricts.map(dist => {
        const currentStock = districtAvailability[dist]?.totalUnits || 100;
        const estimatedShortage = Math.max(30, 380 - currentStock);
        const risk = estimatedShortage > 250 ? 'High Risk' : estimatedShortage >= 120 ? 'Medium Risk' : 'Low Risk';
        const riskPct = estimatedShortage > 250 ? 88 : estimatedShortage >= 120 ? 63 : 42;
        return {
          district: dist,
          month: nextMonthNum,
          year: nextYearNum,
          monthName: nextMonthName,
          shortageExpected: 'Yes',
          shortageRisk: riskPct,
          riskLevel: risk,
          estimatedUnits: estimatedShortage,
          topCriticalGroups: 'O+, A+, B-',
          breakdown: []
        };
      });
    }

    // Sort by highest estimated shortage first
    nextMonthPredictions.sort((a, b) => b.estimatedUnits - a.estimatedUnits);

    // If hospital user, ensure their district appears at the top of the prediction card
    if (isHospitalUser && userHospitalDistrict) {
      const distIdx = nextMonthPredictions.findIndex(
        p => p.district && p.district.toLowerCase() === userHospitalDistrict.toLowerCase()
      );
      if (distIdx > 0) {
        const [targetDistPred] = nextMonthPredictions.splice(distIdx, 1);
        nextMonthPredictions.unshift(targetDistPred);
      }
    }

    res.json({
      cards: {
        totalBloodUnits,
        activeDonors,
        registeredHospitals,
        hospitalFacility,
        emergencyRequests,
        expiringSoon: expiringSoonUnits,
        criticalShortages
      },
      bloodGroupStock,
      districtAvailability,
      predictions: nextMonthPredictions.slice(0, 5),
      nextMonthInfo: {
        month: nextMonthNum,
        year: nextYearNum,
        name: nextMonthName,
        fullName: nextMonthFullName
      },
      monthlyOverview,
      recentRequests,
      recentDonations,
      unreadNotifications,
      isHospitalView: isHospitalUser,
      hospitalName: userHospitalName,
      hospitalDistrict: userHospitalDistrict,
      hospitalType: userHospitalType
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats
};
