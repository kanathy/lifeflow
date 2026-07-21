const mongoose = require('mongoose');

const AccidentCaseSchema = new mongoose.Schema({
  caseId: {
    type: String,
    required: true
  },
  date: {
    type: String,
    default: 'May 31, 2025'
  },
  location: {
    type: String,
    required: true
  },
  accidentType: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['Minor', 'Major', 'Fatal', 'Critical', 'Moderate', 'Severe'],
    default: 'Major'
  },
  injured: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['Open', 'Closed', 'Active', 'Discharged', 'Under Treatment'],
    default: 'Open'
  },
  patientName: {
    type: String
  },
  bloodGroup: {
    type: String
  },
  unitsRequired: {
    type: Number,
    default: 0
  },
  hospital: {
    type: String
  },
  district: {
    type: String
  },
  notes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('AccidentCase', AccidentCaseSchema);
