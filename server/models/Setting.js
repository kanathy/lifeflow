const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  systemName: {
    type: String,
    default: 'LifeFlow Blood Bank Management System'
  },
  organization: {
    type: String,
    default: 'National Blood Transfusion Service'
  },
  contactEmail: {
    type: String,
    default: 'info@lifeflow.lk'
  },
  contactPhone: {
    type: String,
    default: '011 268 1111'
  },
  address: {
    type: String,
    default: '123, Keas Road, Colombo 08, Sri Lanka'
  }
}, { timestamps: true });

module.exports = mongoose.model('Setting', SettingSchema);
