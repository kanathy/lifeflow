const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  district: {
    type: String,
    required: true,
    unique: true
  },
  shortageRisk: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  riskLevel: {
    type: String,
    enum: ['High Risk', 'Medium Risk', 'Low Risk'],
    required: true
  },
  trend: {
    type: [Number],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Prediction', PredictionSchema);
