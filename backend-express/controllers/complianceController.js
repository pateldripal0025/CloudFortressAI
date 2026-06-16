const mongoose = require('mongoose');
const Risk = require('../models/Risk');
const fileStorage = require('../utils/fileStorage');
const PDFDocument = require('pdfkit');

exports.getComplianceSummary = async (req, res) => {
  try {
    const tenantId = req.user._id;
    let risks;

    if (mongoose.connection.readyState !== 1) {
      risks = fileStorage.getRisks().filter(r => r.tenantId === tenantId && r.status !== 'Resolved');
    } else {
      risks = await Risk.find({ tenantId, status: { $ne: 'Resolved' } });
    }

    // Dynamic compliance calculations based on active database risks
    let soc2 = 100;
    let iso = 100;
    let cis = 100;
    let pci = 100;

    risks.forEach(risk => {
      const severity = (risk.severity || 'Medium').toLowerCase();
      if (severity === 'critical') {
        soc2 -= 6;
        iso -= 7;
        pci -= 9;
        cis -= 5;
      } else if (severity === 'high') {
        soc2 -= 4;
        iso -= 5;
        pci -= 6;
        cis -= 3;
      } else if (severity === 'medium') {
        soc2 -= 2;
        iso -= 3;
        pci -= 3;
        cis -= 1;
      } else if (severity === 'low') {
        soc2 -= 1;
        iso -= 1;
        pci -= 1;
      }
    });

    // Clamp values between 25% and 100%
    const clamp = (val) => Math.min(100, Math.max(25, val));

    res.status(200).json({
      success: true,
      data: {
        soc2: clamp(soc2),
        iso: clamp(iso),
        cis: clamp(cis),
        pci: clamp(pci),
        activeRisksCount: risks.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getComplianceReport = async (req, res) => {
  try {
    const tenantId = req.user._id;
    let risks;

    if (mongoose.connection.readyState !== 1) {
      risks = fileStorage.getRisks().filter(r => r.tenantId === tenantId && r.status !== 'Resolved');
    } else {
      risks = await Risk.find({ tenantId, status: { $ne: 'Resolved' } });
    }

    let soc2 = 100;
    let iso = 100;
    let cis = 100;
    let pci = 100;

    risks.forEach(risk => {
      const severity = (risk.severity || 'Medium').toLowerCase();
      if (severity === 'critical') {
        soc2 -= 6; iso -= 7; pci -= 9; cis -= 5;
      } else if (severity === 'high') {
        soc2 -= 4; iso -= 5; pci -= 6; cis -= 3;
      } else if (severity === 'medium') {
        soc2 -= 2; iso -= 3; pci -= 3; cis -= 1;
      } else if (severity === 'low') {
        soc2 -= 1; iso -= 1; pci -= 1;
      }
    });

    const clamp = (val) => Math.min(100, Math.max(25, val));
    const finalSOC2 = clamp(soc2);
    const finalISO = clamp(iso);
    const finalCIS = clamp(cis);
    const finalPCI = clamp(pci);

    const doc = new PDFDocument({ margin: 50 });
    const filename = `Compliance_Audit_Report.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Header logo background glow
    doc
      .fillColor('#00E5FF')
      .fontSize(26)
      .text('CloudFortress AI Compliance Audit Log', { align: 'center' })
      .moveDown(0.2);
    
    doc
      .fillColor('#94a3b8')
      .fontSize(10)
      .text(`Generated on: ${new Date().toLocaleString()} | Tenant ID: ${tenantId}`, { align: 'center' })
      .moveDown(2);

    // Executive Summary
    doc
      .fillColor('#ffffff')
      .fontSize(16)
      .text('Executive Summary')
      .moveDown(0.5);

    doc
      .fillColor('#cbd5e1')
      .fontSize(11)
      .text(`This document contains a real-time security posture assessment of your connected cloud environments against SOC2 Type II, ISO 27001, CIS Benchmarks, and PCI DSS 4.0 frameworks. Currently, there are ${risks.length} active (unresolved) vulnerability vectors detected.`, { align: 'justify', lineGap: 3 })
      .moveDown(1.5);

    // Compliance Frameworks Box
    doc
      .fillColor('#00E5FF')
      .fontSize(14)
      .text('Framework Compliance Scores')
      .moveDown(0.8);

    const scoresY = doc.y;
    doc
      .rect(50, scoresY, 500, 80)
      .fill('#111827')
      .stroke('#00E5FF');

    doc
      .fillColor('#ffffff')
      .fontSize(11)
      .text(`SOC2 Type II:  ${finalSOC2}%`, 70, scoresY + 20)
      .text(`ISO 27001:     ${finalISO}%`, 70, scoresY + 45)
      .text(`CIS Benchmarks: ${finalCIS}%`, 300, scoresY + 20)
      .text(`PCI DSS 4.0:    ${finalPCI}%`, 300, scoresY + 45);

    doc.moveDown(5);

    // Active Risks List
    doc
      .fillColor('#00E5FF')
      .fontSize(14)
      .text('Vulnerability Vectors Limiting Compliance')
      .moveDown(0.8);

    if (risks.length === 0) {
      doc
        .fillColor('#10B981')
        .fontSize(11)
        .text('No active risks found! Your environment meets 100% compliance requirements.')
        .moveDown(1);
    } else {
      risks.slice(0, 10).forEach((risk, idx) => {
        const sevColor = risk.severity.toLowerCase() === 'critical' ? '#EF4444' : 
                         risk.severity.toLowerCase() === 'high' ? '#F97316' : '#EAB308';
        doc
          .fillColor(sevColor)
          .fontSize(11)
          .text(`[${risk.severity.toUpperCase()}] `, { continued: true })
          .fillColor('#ffffff')
          .text(`${risk.title} (${risk.provider} // ${risk.resource})`)
          .fillColor('#94a3b8')
          .fontSize(9)
          .text(`Recommendation: ${risk.recommendation}`)
          .moveDown(0.6);
      });
      if (risks.length > 10) {
        doc
          .fillColor('#94a3b8')
          .fontSize(10)
          .text(`... and ${risks.length - 10} additional findings cataloged in the system.`, { italic: true })
          .moveDown(1);
      }
    }

    doc.moveDown(2);

    // Footer
    doc
      .fontSize(9)
      .fillColor('#4b5563')
      .text('--- CONFIDENTIAL SECURITY AUDIT REPORT ---', { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Compliance PDF generation error:', error);
    res.status(500).json({ success: false, error: 'Internal server error during PDF generation' });
  }
};
