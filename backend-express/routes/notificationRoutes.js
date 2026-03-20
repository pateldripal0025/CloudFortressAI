const express = require('express');
const router = express.Router();
const { getNotifications, createNotification, markAsRead, clearAll } = require('../controllers/notificationController');

router.get('/', getNotifications);
router.post('/', createNotification);
router.put('/:id/read', markAsRead);
router.delete('/clear', clearAll);

module.exports = router;
