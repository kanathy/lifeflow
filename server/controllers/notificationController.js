const dbResolver = require('../utils/dbResolver');

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const list = await dbResolver.find('Notification');
    // Sort in reverse chronological order (newest first)
    list.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const updated = await dbResolver.findByIdAndUpdate('Notification', req.params.id, {
      status: 'Read'
    });

    if (!updated) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const list = await dbResolver.find('Notification');
    for (let item of list) {
      if (item.status === 'Unread') {
        await dbResolver.findByIdAndUpdate('Notification', item._id, { status: 'Read' });
      }
    }
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create manual alert/notification
// @route   POST /api/notifications
// @access  Private
const createNotification = async (req, res) => {
  const { message, type } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    const notification = await dbResolver.create('Notification', {
      message,
      type: type || 'System',
      status: 'Unread'
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification
};
