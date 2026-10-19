const dbResolver = require('../utils/dbResolver');

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

    // 1. Calculations for Stat Cards
    const totalBloodUnits = stock.reduce((acc, curr) => acc + curr.availableUnits, 0);
    const activeDonors = donors.filter(d => d.status === 'Active').length;
    const registeredHospitals = hospitals.length;
    const emergencyRequests = requests.filter(r => r.status === 'Pending' || r.status === 'Accepted').length;
    
    // Expiring soon: inventory items where expiryDays <= 7
    const expiringSoonUnits = stock
      .filter(item => item.expiryDays <= 7)
      .reduce((acc, curr) => acc + curr.availableUnits, 0);

    // Critical Shortages: Count of districts with sum of blood < 200 units
    const districtGroups = {};
    stock.forEach(item => {
      districtGroups[item.district] = (districtGroups[item.district] || 0) + item.availableUnits;
    });
    const criticalShortages = Object.keys(districtGroups).filter(d => districtGroups[d] < 200).length;

    // 2. Blood Stock by Blood Group chart
    const bloodGroupStock = {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'O+': 0, 'O-': 0, 'AB+': 0, 'AB-': 0
    };
    stock.forEach(item => {
      if (bloodGroupStock[item.bloodGroup] !== undefined) {
        bloodGroupStock[item.bloodGroup] += item.availableUnits;
      }
    });

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

    // Baseline fallback figures ONLY for districts that don't have records in the database yet
    const baselineDistricts = {
      'Anuradhapura': 410,
      'Trincomalee': 180,
      'Kandy': 80,
      'Batticaloa': 120,
      'Galle': 380,
      'Hambantota': 150,
      'Gampaha': 210,
      'Jaffna': 340,
      'Kurunegala': 320,
      'Badulla': 290,
      'Ratnapura': 310,
      'Kalutara': 160,
      'Matale': 140,
      'Nuwara Eliya': 90,
      'Matara': 220,
      'Kilinochchi': 110,
      'Mannar': 85,
      'Vavuniya': 130,
      'Mullaitivu': 95,
      'Ampara': 280,
      'Puttalam': 140,
      'Polonnaruwa': 175,
      'Moneragala': 115,
      'Kegalle': 190
    };

    // Function to calculate exact blood group counts for a given total
    const getBreakdown = (total) => {
      const u = Number(total) || 0;
      if (u <= 0) return { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'O+': 0, 'O-': 0, 'AB+': 0, 'AB-': 0 };
      const oPlus = Math.round(u * 0.36);
      const aPlus = Math.round(u * 0.24);
      const bPlus = Math.round(u * 0.22);
      const abPlus = Math.round(u * 0.08);
      const oMinus = Math.round(u * 0.04);
      const aMinus = Math.round(u * 0.03);
      const bMinus = Math.round(u * 0.02);
      const remainder = u - (oPlus + aPlus + bPlus + abPlus + oMinus + aMinus + bMinus);
      const abMinus = Math.max(0, remainder);
      return { 'A+': aPlus, 'A-': aMinus, 'B+': bPlus, 'B-': bMinus, 'O+': oPlus, 'O-': oMinus, 'AB+': abPlus, 'AB-': abMinus };
    };

    Object.keys(districtAvailability).forEach(dist => {
      // If the district has NO real stock records in database, apply baseline
      if (!districtAvailability[dist].hasRealStock && baselineDistricts[dist]) {
        const baseTotal = baselineDistricts[dist];
        districtAvailability[dist].totalUnits = baseTotal;
        districtAvailability[dist].bloodGroups = getBreakdown(baseTotal);
      }

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
    const recentRequests = [...requests]
      .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))
      .slice(0, 5);

    const recentDonations = [...donors]
      .sort((a, b) => new Date(b.lastDonationDate) - new Date(a.lastDonationDate))
      .slice(0, 5);

    // 6. Notifications unread count
    const unreadNotifications = notifications.filter(n => n.status === 'Unread').length;

    res.json({
      cards: {
        totalBloodUnits,
        activeDonors,
        registeredHospitals,
        emergencyRequests,
        expiringSoon: expiringSoonUnits,
        criticalShortages
      },
      bloodGroupStock,
      districtAvailability,
      predictions: predictions.slice(0, 5),
      monthlyOverview,
      recentRequests,
      recentDonations,
      unreadNotifications
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats
};
