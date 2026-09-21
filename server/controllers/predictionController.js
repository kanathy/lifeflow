const dbResolver = require('../utils/dbResolver');

const ML_BASE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Helper: POST to the Python ML service
const callML = async (endpoint, body) => {
  const response = await fetch(`${ML_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000)
  });
  if (!response.ok) throw new Error(`ML service error: ${response.status}`);
  return response.json();
};

// ---------------------------------------------------------------
// GET /api/predictions  →  blood shortage predictions (district list)
// ---------------------------------------------------------------
const getPredictions = async (req, res) => {
  try {
    const list = await dbResolver.find('Prediction');
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------
// POST /api/predictions/recalculate  →  recalculate blood shortage
// ---------------------------------------------------------------
const recalculatePredictions = async (req, res) => {
  try {
    const factors = req.body || {};
    let mlResult = null;

    try {
      mlResult = await callML('/api/predict/shortage', {
        accidentRate:    factors.accidentRate    ?? true,
        outbreaks:       factors.outbreaks       ?? true,
        weather:         factors.weather         ?? true,
        publicEvents:    factors.publicEvents    ?? false,
        historicalUsage: factors.historicalUsage ?? true
      });
    } catch (mlErr) {
      console.warn('ML service unavailable, using fallback logic:', mlErr.message);
    }

    const list = await dbResolver.find('Prediction');
    const updatedPredictions = [];

    for (let item of list) {
      let risk;
      if (mlResult) {
        // Apply ML result risk with district-level variation
        const variation = Math.floor(Math.random() * 21) - 10;
        risk = Math.max(5, Math.min(98, mlResult.shortageRisk + variation));
      } else {
        const fluctuation = Math.floor(Math.random() * 11) - 5;
        risk = Math.max(5, Math.min(98, item.shortageRisk + fluctuation));
      }

      let level = 'Low Risk';
      if (risk > 70) level = 'High Risk';
      else if (risk >= 30) level = 'Medium Risk';

      const trend = mlResult
        ? mlResult.trend.map(v => Math.max(5, Math.min(98, v + Math.floor(Math.random() * 11) - 5)))
        : [...item.trend.slice(1), risk];

      const updated = await dbResolver.findByIdAndUpdate('Prediction', item._id, {
        shortageRisk: risk,
        riskLevel: level,
        trend
      });
      updatedPredictions.push(updated);
    }

    res.json(updatedPredictions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ---------------------------------------------------------------
// POST /api/predictions/disease  →  disease case prediction (ML pkl)
// ---------------------------------------------------------------
const predictDisease = async (req, res) => {
  try {
    const { year, months, monthNumber, month, district, bloodGroup, rainfall, festival } = req.body;
    const monthNum = Number(monthNumber) || Number(month) || 1;
    const monthStr = months || MONTH_NAMES[monthNum] || 'Jan';

    const payload = {
      year: Number(year) || new Date().getFullYear(),
      months: monthStr,
      monthNumber: monthNum,
      district: district || 'Colombo',
      bloodGroup: bloodGroup || 'A+',
      rainfall: Number(rainfall) || 0,
      festival: Number(festival) || 0
    };

    let result = null;
    try {
      result = await callML('/api/predict/disease', payload);
    } catch (mlErr) {
      console.warn('ML service offline for disease prediction, applying fallback heuristic:', mlErr.message);
      const baseCases = 45;
      const rainBonus = Math.min(35, Math.round((Number(rainfall) || 0) * 0.22));
      const festBonus = Number(festival) === 1 ? 14 : 0;
      const districtBonus = (district === 'Colombo' || district === 'Gampaha') ? 10 : 4;
      const estCases = baseCases + rainBonus + festBonus + districtBonus;
      result = {
        predictedCases: estCases,
        predictedUsage: estCases,
        trend: [
          Math.round(estCases * 0.92),
          Math.round(estCases * 0.95),
          estCases,
          Math.round(estCases * 1.04),
          Math.round(estCases * 0.98),
          Math.round(estCases * 1.02),
          Math.round(estCases * 1.06)
        ]
      };
    }
    const diseaseRecords = await dbResolver.find('DiseaseCase');

    const SRI_LANKA_DISTRICTS = [
      'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
      'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
      'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
      'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
      'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
    ];

    let topHotspots = [];
    if (diseaseRecords && diseaseRecords.length > 0) {
      const hotspotCounts = {};
      for (const record of diseaseRecords) {
        const rawLocation = record.district || record.location || '';
        if (!rawLocation) continue;

        const matched = SRI_LANKA_DISTRICTS.find(d =>
          rawLocation.toLowerCase().includes(d.toLowerCase())
        ) || rawLocation;

        const injuredCount = Number(record.injured) > 0 ? Number(record.injured) : 1;
        hotspotCounts[matched] = (hotspotCounts[matched] || 0) + injuredCount;
      }

      const totalCases = Object.values(hotspotCounts).reduce((sum, count) => sum + count, 0);
      topHotspots = Object.entries(hotspotCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({
          name,
          count,
          percentage: totalCases > 0 ? Number(((count / totalCases) * 100).toFixed(1)) : 0
        }));
    }

    if (topHotspots.length === 0) {
      topHotspots = [
        { name: 'Colombo', count: 8, percentage: 42.1 },
        { name: 'Galle', count: 4, percentage: 21.1 },
        { name: 'Kandy', count: 3, percentage: 15.8 },
        { name: 'Batticaloa', count: 2, percentage: 10.5 },
        { name: 'Jaffna', count: 2, percentage: 10.5 }
      ];
    }

    const predictedCases = result?.predictedCases ?? result?.predictedUsage ?? 50;
    const trend = result?.trend || [
      Math.max(0, Math.round(predictedCases * 0.92)),
      Math.max(0, Math.round(predictedCases * 0.96)),
      predictedCases,
      Math.max(0, Math.round(predictedCases * 1.04)),
      Math.max(0, Math.round(predictedCases * 0.97)),
      Math.max(0, Math.round(predictedCases * 1.02)),
      Math.max(0, Math.round(predictedCases * 1.05))
    ];

    res.json({ ...result, predictedCases, trend, topHotspots });
  } catch (error) {
    console.error('Disease prediction error:', error.message);
    res.status(500).json({ message: error.message || 'Disease prediction failed' });
  }
};

// ---------------------------------------------------------------
// POST /api/predictions/accident  →  accident prediction (ML pkl)
// ---------------------------------------------------------------
const predictAccident = async (req, res) => {
  try {
    const { year, months, monthNumber, month, district, bloodGroup, rainfall, festival } = req.body;
    const monthNum = Number(monthNumber) || Number(month) || 1;
    const monthStr = months || MONTH_NAMES[monthNum] || 'Jan';

    const payload = {
      year: Number(year) || new Date().getFullYear(),
      months: monthStr,
      monthNumber: monthNum,
      district: district || 'Colombo',
      bloodGroup: bloodGroup || 'A+',
      rainfall: Number(rainfall) || 0,
      festival: Number(festival) || 0
    };

    let result = null;
    try {
      result = await callML('/api/predict/accident', payload);
    } catch (mlErr) {
      console.warn('ML service offline for accident prediction, applying fallback heuristic:', mlErr.message);
      const baseAccidents = 30;
      const rainBonus = Math.min(25, Math.round((Number(rainfall) || 0) * 0.16));
      const festBonus = Number(festival) === 1 ? 16 : 0;
      const districtBonus = (district === 'Colombo' || district === 'Kandy') ? 9 : 3;
      const estAccidents = baseAccidents + rainBonus + festBonus + districtBonus;
      result = {
        predictedAccidents: estAccidents,
        predictedUsage: estAccidents,
        trend: [
          Math.round(estAccidents * 0.91),
          Math.round(estAccidents * 0.95),
          estAccidents,
          Math.round(estAccidents * 1.05),
          Math.round(estAccidents * 0.97),
          Math.round(estAccidents * 1.02),
          Math.round(estAccidents * 1.04)
        ]
      };
    }
    const accidentRecords = await dbResolver.find('AccidentCase');
    
    const SRI_LANKA_DISTRICTS = [
      'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
      'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
      'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
      'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
      'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
    ];

    let topHotspots = [];
    if (accidentRecords && accidentRecords.length > 0) {
      const hotspotCounts = {};
      for (const record of accidentRecords) {
        const rawLocation = record.district || record.location || '';
        if (!rawLocation) continue;
        
        const matched = SRI_LANKA_DISTRICTS.find(d => 
          rawLocation.toLowerCase().includes(d.toLowerCase())
        ) || rawLocation;

        const injuredCount = Number(record.injured) > 0 ? Number(record.injured) : 1;
        hotspotCounts[matched] = (hotspotCounts[matched] || 0) + injuredCount;
      }

      const totalInjured = Object.values(hotspotCounts).reduce((sum, count) => sum + count, 0);
      topHotspots = Object.entries(hotspotCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({
          name,
          count,
          percentage: totalInjured > 0 ? Number(((count / totalInjured) * 100).toFixed(1)) : 0
        }));
    }

    if (topHotspots.length === 0) {
      topHotspots = [
        { name: 'Colombo', count: 2, percentage: 40.0 },
        { name: 'Kandy', count: 2, percentage: 40.0 },
        { name: 'Gampaha', count: 1, percentage: 20.0 }
      ];
    }

    const predictedAccidents = result?.predictedAccidents ?? result?.predictedUsage ?? 30;
    const trend = result?.trend || [
      Math.max(0, Math.round(predictedAccidents * 0.92)),
      Math.max(0, Math.round(predictedAccidents * 0.96)),
      predictedAccidents,
      Math.max(0, Math.round(predictedAccidents * 1.04)),
      Math.max(0, Math.round(predictedAccidents * 0.97)),
      Math.max(0, Math.round(predictedAccidents * 1.02)),
      Math.max(0, Math.round(predictedAccidents * 1.05))
    ];

    res.json({ ...result, predictedAccidents, trend, topHotspots });
  } catch (error) {
    console.error('Accident prediction error:', error.message);
    res.status(500).json({ message: error.message || 'Accident prediction failed' });
  }
};

module.exports = {
  getPredictions,
  recalculatePredictions,
  predictDisease,
  predictAccident
};

