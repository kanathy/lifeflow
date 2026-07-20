const dbResolver = require('../utils/dbResolver');

// @desc    Get all district predictions
// @route   GET /api/predictions
// @access  Private
const getPredictions = async (req, res) => {
  try {
    const list = await dbResolver.find('Prediction');
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Trigger prediction recalculation (mock)
// @route   POST /api/predictions/recalculate
// @access  Private
const recalculatePredictions = async (req, res) => {
  try {
    const list = await dbResolver.find('Prediction');
    const updatedPredictions = [];

    for (let item of list) {
      // Mock factor adjustments
      const fluctuation = Math.floor(Math.random() * 11) - 5; // -5 to +5
      let risk = Math.max(5, Math.min(98, item.shortageRisk + fluctuation));
      
      let level = 'Low Risk';
      if (risk > 70) level = 'High Risk';
      else if (risk >= 30) level = 'Medium Risk';

      // shift trend list
      const trend = [...item.trend.slice(1), risk];

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

module.exports = {
  getPredictions,
  recalculatePredictions
};
