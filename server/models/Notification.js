const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Alert', 'Reminder', 'System'],
    default: 'System'
  },
  dateTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Read', 'Unread'],
    default: 'Unread'
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
