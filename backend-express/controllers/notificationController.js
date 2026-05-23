const mongoose = require('mongoose');
const fileStorage = require('../utils/fileStorage');
const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const tenantId = req.user._id;

    if (mongoose.connection.readyState !== 1) {
      console.log('[Notification Fallback] MongoDB offline. Fetching local notifications...');
      const localNotifs = fileStorage.getNotifications().filter(n => n.tenantId === tenantId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 20);
      const unreadCount = localNotifs.filter(n => !n.read).length;

      return res.status(200).json({
        success: true,
        data: localNotifs,
        unreadCount
      });
    }

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

    if (mongoose.connection.readyState !== 1) {
      const notification = await fileStorage.createNotification({
        title,
        message,
        severity,
        tenantId: req.user._id
      });

      if (req.io) {
        req.io.emit('new_notification', notification);
      }

      return res.status(201).json({ success: true, data: notification });
    }

    const notification = await Notification.create({ 
      title, 
      message, 
      severity,
      tenantId: req.user._id 
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
    if (mongoose.connection.readyState !== 1) {
      const notifs = fileStorage.getNotifications();
      const n = notifs.find(item => item._id === req.params.id && item.tenantId === req.user._id);
      if (n) {
        n.read = true;
        fileStorage.saveNotifications(notifs);
      }
      return res.status(200).json({ success: true });
    }

    await Notification.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user._id }, 
      { read: true }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.clearAll = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const notifs = fileStorage.getNotifications();
      const kept = notifs.filter(n => n.tenantId !== req.user._id);
      fileStorage.saveNotifications(kept);
      return res.status(200).json({ success: true });
    }

    await Notification.deleteMany({ tenantId: req.user._id });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
