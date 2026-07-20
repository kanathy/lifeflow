const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reportName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Inventory', 'Usage', 'Donor', 'Requests', 'Summary']
  },
  dateRange: {
    type: String,
    required: true
  },
  generatedOn: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
