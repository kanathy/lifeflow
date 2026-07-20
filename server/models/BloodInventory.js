const mongoose = require('mongoose');

const BloodInventorySchema = new mongoose.Schema({
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
  },
  rhFactor: {
    type: String,
    enum: ['positive', 'negative'],
    required: true
  },
  district: {
    type: String,
    required: true
  },
  availableUnits: {
    type: Number,
    required: true,
    default: 0
  },
  expiryDays: {
    type: Number,
    required: true,
    default: 35 // default shelf life
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('BloodInventory', BloodInventorySchema);
