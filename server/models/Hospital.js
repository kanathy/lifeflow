const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
  hospitalId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Government', 'Private'],
    default: 'Government'
  },
  contact: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Hospital', HospitalSchema);
