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

// Export endpoints
router.get('/risks/export', exportRisks);
router.get('/risks/:id/export', exportRiskById);
router.get('/risks/:id/report', generatePDFReport);

// Main risks endpoint
router.get('/risks', getRisks);

// Single risk detail
router.get('/risks/:id', getRiskById);

// Update status
router.put('/risks/:id/resolve', resolveRisk);

module.exports = router;
