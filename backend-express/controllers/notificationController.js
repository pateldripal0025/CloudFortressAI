const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const notifications = await Notification.find({ tenantId }).sort({ createdAt: -1 }).limit(20);
    const unreadCount = await Notification.countDocuments({ tenantId, read: false });
    
    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { title, message, severity } = req.body;
    const notification = await Notification.create({ 
      title, 
      message, 
      severity,
      tenantId: req.user.id 
    });
    
    // Emit real-time update
    if (req.io) {
      req.io.emit('new_notification', notification);
    }
    
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.id }, 
      { read: true }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ tenantId: req.user.id });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

