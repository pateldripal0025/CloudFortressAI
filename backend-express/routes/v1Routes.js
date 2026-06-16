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
const { getComplianceSummary, getComplianceReport } = require('../controllers/complianceController');
const { getConnectors, createConnector, deleteConnector } = require('../controllers/connectorController');
const { getDashboardSummary, getAIPriorityInsights, getAnalytics } = require('../controllers/dashboardController');
const { startScan, getScanHistory } = require('../controllers/scanController');
const { getAssets } = require('../controllers/resourceController');
const { getVulnerabilities } = require('../controllers/vulnerabilityController');
const { 
  register, 
  login, 
  getMe, 
  refreshToken, 
  logout, 
  forgotPassword, 
  resetPassword,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Auth endpoints
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/refresh', refreshToken);
router.post('/auth/logout', logout);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);
router.get('/auth/me', protect, getMe);
router.put('/auth/update-profile', protect, updateProfile);

// Assets/Resources
router.get('/assets', protect, getAssets);

// Vulnerabilities
router.get('/vulnerabilities', protect, getVulnerabilities);

// Cloud Connectors
router.get('/connectors', protect, getConnectors);
router.post('/connectors', protect, createConnector);
router.delete('/connectors/:id', protect, deleteConnector);

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

// Compliance endpoints
router.get('/compliance/summary', protect, getComplianceSummary);
router.get('/compliance/report', protect, getComplianceReport);

// Real-time webhook from Python AI Engine (no auth needed for inter-service communication)
router.post('/alerts/realtime', async (req, res) => {
    try {
        const alert = req.body;
        const User = require('../models/User');
        const Notification = require('../models/Notification');
        const Risk = require('../models/Risk');
        const fileStorage = require('../utils/fileStorage');
        const mongoose = require('mongoose');

        // Resolve user/tenant (default test operator)
        let tenantId = null;
        if (mongoose.connection.readyState === 1) {
            const user = await User.findOne({ email: 'test@user.com' }) || await User.findOne();
            if (user) tenantId = user._id;
        }

        // 1. Create and persist the Notification
        const notificationData = {
            title: `Real-time Alert: ${alert.issue || 'Security Threat'}`,
            message: `A high risk issue has been discovered on ${alert.resource_type || 'Cloud Resource'} [${alert.resource || 'unknown'}].`,
            severity: (alert.severity || 'high').toLowerCase(),
            tenantId: tenantId || 'system-default'
        };

        let dbNotification;
        if (mongoose.connection.readyState === 1 && tenantId) {
            dbNotification = await Notification.create(notificationData);
        } else {
            dbNotification = await fileStorage.createNotification({
                ...notificationData,
                _id: Date.now().toString()
            });
        }

        // 2. Create and persist the Risk record
        let service = 'S3';
        if (alert.resource_type) {
            if (alert.resource_type.includes('S3')) service = 'S3';
            else if (alert.resource_type.includes('SecurityGroup')) service = 'VPC';
            else if (alert.resource_type.includes('RDS')) service = 'RDS';
            else if (alert.resource_type.includes('Role')) service = 'IAM';
            else if (alert.resource_type.includes('Storage')) service = 'Storage';
        }

        const riskData = {
            title: alert.issue || 'Security Threat',
            resource: alert.resource || 'unknown-resource',
            provider: alert.provider || (alert.event_source && alert.event_source.includes('aws') ? 'AWS' : 'Azure'),
            severity: alert.severity || 'High',
            aiScore: Math.floor(Math.random() * 20) + 75,
            recommendation: alert.remediation || 'Restrict access configurations immediately.',
            description: `A security vulnerability was detected in real-time. Resource type: ${alert.resource_type || 'Unknown'}. Source: ${alert.event_source || 'CloudEvent'}.`,
            impact: 'High: Immediate threat exposure to the cloud environment.',
            remediationSteps: ['Isolate the resource', 'Verify access controls', 'Apply remediation recommendation'],
            environment: 'production',
            service: service,
            riskType: 'Misconfiguration',
            region: 'us-east-1',
            attackVector: 'Real-time telemetry event indicated anomalous/public exposure.',
            tenantId: tenantId
        };

        if (mongoose.connection.readyState === 1 && tenantId) {
            await Risk.create(riskData);
        } else {
            const risks = fileStorage.getRisks();
            riskData._id = Date.now().toString() + '_risk';
            risks.push(riskData);
            fileStorage.saveRisks(risks);
        }

        // 3. Broadcast notification via Socket.io
        req.io.emit('new_notification', dbNotification);
        
        // 4. Refresh dashboard scans
        req.io.emit('scan_completed', {
            provider: riskData.provider,
            totalRisks: 1,
            severity: alert.severity
        });
        
        res.json({ success: true, message: 'Real-time alert broadcasted and persisted successfully', notification: dbNotification });
    } catch (err) {
        console.error('[REALTIME WEBHOOK ERROR]', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;

