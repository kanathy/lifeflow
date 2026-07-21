const mongoose = require('mongoose');

const DonorSchema = new mongoose.Schema({
  donorId: {
    type: String,
    required: true,
    unique: true,
    default: () => `DON${Date.now()}`
  },
  name: {
    type: String,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
  },
  contact: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  lastDonationDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  district: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Donor', DonorSchema);
