const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const fileStorage = require('../utils/fileStorage');
const Scan = require('../models/Scan');
const Risk = require('../models/Risk');
const Notification = require('../models/Notification');
const { generateScanVulnerabilities } = require('./vulnerabilityController');
const { generateRandomAssets } = require('./resourceController');

const SCANS_FILE = path.join(__dirname, '../data/scans.json');

const getLocalScans = () => {
  try {
    if (!fs.existsSync(SCANS_FILE)) {
      fs.writeFileSync(SCANS_FILE, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(SCANS_FILE, 'utf-8'));
  } catch (err) {
    return [];
  }
};

const saveLocalScans = (scans) => {
  try {
    fs.writeFileSync(SCANS_FILE, JSON.stringify(scans, null, 2));
  } catch (err) {}
};

exports.startScan = async (req, res) => {
  try {
    const { provider } = req.body;
    const environment = req.headers['x-env'] || 'production';
    const tenantId = req.user._id;

    if (mongoose.connection.readyState !== 1) {
      console.log('[Scan Fallback] MongoDB offline. Running offline scan...');
      const scans = getLocalScans();
      const newScan = {
        _id: Math.random().toString(36).substring(2, 11),
        title: `${provider} Quick Scan`,
        status: 'Running',
        environment: environment,
        tenantId,
        createdAt: new Date().toISOString()
      };
      scans.push(newScan);
      saveLocalScans(scans);

      if (req.io) {
        req.io.emit('scan_started', {
          id: newScan._id,
          title: newScan.title,
          timestamp: newScan.createdAt
        });
      }

      setTimeout(async () => {
        try {
          const currentScans = getLocalScans();
          const target = currentScans.find(s => s._id === newScan._id);
          if (target) {
            target.status = 'Completed';
            saveLocalScans(currentScans);
          }

          const newVulns = await generateScanVulnerabilities(tenantId, provider);
          await generateRandomAssets(tenantId, Math.floor(Math.random() * 8) + 5, environment);

          const notification = await fileStorage.createNotification({
            title: 'Global Scan Completed',
            message: `Security audit for ${provider} in ${environment} finished. ${newVulns.length} new vulnerabilities detected.`,
            severity: newVulns.length > 0 ? 'high' : 'low',
            tenantId
          });

          if (req.io) {
            req.io.emit('new_notification', notification);
            req.io.emit('scan_completed', {
              id: newScan._id,
              status: 'Completed'
            });
          }
        } catch (innerErr) {
          console.error('[SCAN FALLBACK INNER ERROR]', innerErr);
        }
      }, 3000);

      return res.status(202).json({
        success: true,
        message: 'Scan execution started',
        ...newScan
      });
    }

    // 1. Create a Scan record
    const scan = await Scan.create({
      title: `${provider} Quick Scan`,
      status: 'Running',
      environment: environment,
      tenantId
    });

    // 2. Emit "Scan Started" to socket
    if (req.io) {
      req.io.emit('scan_started', {
        id: scan._id,
        title: scan.title,
        timestamp: scan.createdAt
      });
    }

    // 3. Simulate scan duration (3 seconds)
    setTimeout(async () => {
      try {
        // Complete the scan
        scan.status = 'Completed';
        await scan.save();

        // Create new vulnerabilities dynamically
        const newVulns = await generateScanVulnerabilities(tenantId, provider);
        
        // Generate a random batch of new assets (simulating discovery)
        await generateRandomAssets(tenantId, Math.floor(Math.random() * 8) + 5, environment);


        // Create a notification
        const notification = await Notification.create({
          title: 'Global Scan Completed',
          message: `Security audit for ${provider} in ${environment} finished. ${newVulns.length} new vulnerabilities detected.`,
          severity: newVulns.length > 0 ? 'high' : 'low',
          tenantId
        });

        // Emit completion events
        if (req.io) {
          req.io.emit('new_notification', notification);
          req.io.emit('scan_completed', {
            id: scan._id,
            status: 'Completed'
          });
        }
      } catch (innerErr) {
        console.error('[SCAN DELAYED TASK ERROR]', innerErr);
      }
    }, 3000);

    res.status(202).json({
      success: true,
      message: 'Scan execution started',
      ...scan.toObject()
    });


  } catch (error) {
    console.error('[SCAN EXECUTION ERROR]', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getScanHistory = async (req, res) => {
  try {
    const environment = req.headers['x-env'] || 'production';
    const tenantId = req.user._id;

    if (mongoose.connection.readyState !== 1) {
      console.log('[Scan Fallback] MongoDB offline. Fetching local scans...');
      const localScans = getLocalScans().filter(s => s.environment === environment && s.tenantId === tenantId);
      return res.status(200).json(localScans);
    }

    const scans = await Scan.find({ environment, tenantId }).sort({ createdAt: -1 });
    res.status(200).json(scans);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
