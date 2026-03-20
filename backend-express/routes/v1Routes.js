const express = require('express');
const router = express.Router();
const { 
  getRisks, 
  getRiskById, 
  resolveRisk, 
  exportRisks, 
  exportRiskById, 
  generatePDFReport 
} = require('../controllers/riskController');
const { globalSearch } = require('../controllers/searchController');
const { getNotifications, markAsRead, clearAll } = require('../controllers/notificationController');
const { getDashboardSummary, getAIPriorityInsights, getAnalytics } = require('../controllers/dashboardController');
const { startScan, getScanHistory } = require('../controllers/scanController');
const { getAssets } = require('../controllers/resourceController');
const { getVulnerabilities } = require('../controllers/vulnerabilityController');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Auth endpoints
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', protect, getMe);

// Assets/Resources
router.get('/assets', protect, getAssets);

// Vulnerabilities
router.get('/vulnerabilities', protect, getVulnerabilities);

// Dashboard endpoints
router.get('/dashboard/summary', protect, getDashboardSummary);
router.get('/dashboard/threat-surface', protect, require('../controllers/dashboardController').getThreatSurfaceData);
router.get('/dashboard/resource-sphere', protect, require('../controllers/dashboardController').getResourceSphereData);
router.get('/analytics', protect, getAnalytics);

router.get('/ai/priority-insights', protect, getAIPriorityInsights);


// Scan endpoints
router.post('/scans/start', protect, startScan);
router.get('/scans/history', protect, getScanHistory);

const { createRisk, updateRisk, deleteRisk } = require('../controllers/riskController');

// Risk endpoints
router.get('/risks', protect, getRisks);
router.post('/risks', protect, createRisk);
router.get('/risks/export', protect, exportRisks);
router.get('/risks/:id', protect, getRiskById);
router.patch('/risks/:id', protect, updateRisk);
router.delete('/risks/:id', protect, deleteRisk);
router.get('/risks/:id/export', protect, exportRiskById);
router.get('/risks/:id/report', protect, generatePDFReport);
router.put('/risks/:id/resolve', protect, resolveRisk);

// Search endpoint
router.get('/search', protect, globalSearch);

// Notification endpoints
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markAsRead);
router.delete('/notifications/clear', protect, clearAll);


module.exports = router;
