const Risk = require('../models/Risk');
const Notification = require('../models/Notification');
const { Parser } = require('json2csv');

// @desc    Get all risks with filtering, search, and pagination
// @route   GET /api/risks
exports.getRisks = async (req, res) => {
  try {
    const { search, severity, provider, page = 1, limit = 10 } = req.query;
    const environment = req.headers['x-env'] || 'production';
    
    // Build query with Tenant Isolation
    const query = { environment, tenantId: req.user.id };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { resource: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (severity) {
      query.severity = severity;
    }
    
    if (provider) {
      query.provider = provider;
    }

    // Initial Seeding for new tenants if no risks exist
    let total = await Risk.countDocuments(query);
    
    if (total === 0 && !search && !severity && !provider) {
      console.log(`[RISK SEED] Initializing Advanced Telemetry Matrix for tenant: ${req.user.id}`);
      const initialRisks = [
        {
          title: "Public S3 Bucket with Sensitive Data Exposure",
          resource: "finance-tax-records-prod",
          provider: "AWS",
          service: "S3",
          region: "us-east-1",
          severity: "Critical",
          riskType: "Data Exposure",
          aiScore: 98,
          recommendation: "Enable 'Block All Public Access' at account level and enforce AES-256 encryption.",
          description: "Production S3 bucket containing PII and tax records is configured with 'AllUsers' Read/Write permissions.",
          attackVector: "Attacker uses automated scanners to identify open buckets and exfiltrate raw PII without authentication.",
          remediationSteps: ["Navigate to S3 Permissions", "Enable Block Public Access", "Verify Bucket Policy", "Enable CloudTrail logging"],
          tenantId: req.user.id
        },
        {
          title: "IAM Role with AdminAccess on Public EC2",
          resource: "web-portal-front-01",
          provider: "AWS",
          service: "EC2",
          region: "ap-south-1",
          severity: "Critical",
          riskType: "Identity",
          aiScore: 94,
          recommendation: "Remove AdministratorAccess and replace with least-privilege service-specific policy.",
          description: "An EC2 instance with an internet-facing IP has an IAM role with full AdministratorAccess attached.",
          attackVector: "Attacker exploits a web vulnerability (SSRF) to steal metadata credentials and gain control of the entire AWS account.",
          remediationSteps: ["Detach Admin IAM Policy", "Create Scoped Policy", "Update Instance Profile", "Rotate Credentials"],
          tenantId: req.user.id
        },
        {
          title: "RDS Instance Accessible from Public Internet",
          resource: "customer-db-prod-master",
          provider: "AWS",
          service: "RDS",
          region: "eu-west-1",
          severity: "High",
          riskType: "Network",
          aiScore: 88,
          recommendation: "Disable 'Publicly Accessible' flag and move to private subnet with VPC Peering.",
          description: "Production database is reachable via port 5432 from 0.0.0.0/0, bypassing transit gateway guards.",
          impact: "Brute-force SQL injection and unauthorized data exfiltration.",
          attackVector: "Direct connection attempt to DB endpoint using common credential lists.",
          remediationSteps: ["Modify RDS Connectivity", "Disable Public Accessibility", "Update Security Groups", "Audit DB Logs"],
          tenantId: req.user.id
        },
        {
          title: "Insecure Kubernetes Dashboard Exposure",
          resource: "k8s-cluster-alpha-02",
          provider: "Azure",
          service: "Kubernetes",
          region: "eastus",
          severity: "High",
          riskType: "Misconfiguration",
          aiScore: 86,
          recommendation: "Disable the Kubernetes Dashboard and use kubectl/Lens with RBAC instead.",
          description: "The K8s dashboard is exposed via a LoadBalancer service without active authentication checks.",
          attackVector: "Attacker identifies the exposed dashboard and uses it to deploy a malicious pod with root access.",
          remediationSteps: ["Delete Kubernetes Dashboard Service", "Enable Azure AD Integration", "Enforce RBAC", "Rotate Cluster CA"],
          tenantId: req.user.id
        },
        {
          title: "Unencrypted EBS Volume on Prod Instance",
          resource: "billing-app-node-03",
          provider: "AWS",
          service: "EC2",
          region: "us-west-2",
          severity: "Medium",
          riskType: "Misconfiguration",
          aiScore: 62,
          recommendation: "Snapshot volume, and re-create with KMS-CMK encryption enabled.",
          description: "A production volume containing application logs and local cache is not encrypted at rest.",
          attackVector: "Unauthorized user with access to physical hardware or AWS snapshots could read raw disk data.",
          remediationSteps: ["Snapshot current EBS", "Copy snapshot with Encryption", "Modify Instance to use New Volume", "Delete Unencrypted Volume"],
          tenantId: req.user.id
        },
        {
          title: "Security Group Allows Unrestricted SSH (22)",
          resource: "jump-box-staging",
          provider: "AWS",
          service: "VPC",
          region: "us-east-1",
          severity: "Medium",
          riskType: "Network",
          aiScore: 58,
          recommendation: "Limit port 22 access to specific Corporate VPN IP ranges.",
          description: "Security Group 'sg-admin-access' allows inbound TCP traffic on port 22 from any IP Address.",
          attackVector: "SSH Brute-force attacks or exploitation of zero-day vulnerabilities in the SSH daemon.",
          remediationSteps: ["Edit Inbound Rules", "Change 0.0.0.0/0 to VPN IP", "Enable GuardDuty", "Verify CloudWatch Alarms"],
          tenantId: req.user.id
        },
        {
          title: "Azure KeyVault Secret Publicly Accessible",
          resource: "kv-prod-secrets-01",
          provider: "Azure",
          service: "KeyVault",
          region: "westeurope",
          severity: "Critical",
          riskType: "Identity",
          aiScore: 96,
          recommendation: "Enable Private Link and restrict access to specific VNETs.",
          description: "Production KeyVault has public network access enabled without IP whitelist restrictions.",
          attackVector: "Attacker attempts to authenticate against the public endpoint using leaked service principal creds.",
          remediationSteps: ["Enable Firewall in Networking", "Add Private Endpoint", "Restrict IP Access", "Rotate Secrets"],
          tenantId: req.user.id
        },
          {
            title: "Excessive IAM Permissions on Lambda Function",
            resource: "data-cleaner-lambda",
            provider: "AWS",
            service: "Lambda",
            region: "us-central1",
            severity: "Low",
            riskType: "Identity",
            aiScore: 34,
            recommendation: "Refactor policy to include specific bucket/database resource ARNs.",
            description: "The Lambda function execution role has wildcard '*' permissions for all S3 and CloudWatch actions.",
            attackVector: "Functional compromise allowed through code injection to delete arbitrary data across the account.",
            remediationSteps: ["Review Policy JSON", "Replace * with specific resources", "Deploy Scoped Role", "Update Lambda Config"],
            tenantId: req.user.id
          },
          {
            title: "Cognito User Pool Without MFA Enforced",
            resource: "customer-identity-pool-v2",
            provider: "AWS",
            service: "IAM",
            region: "us-east-1",
            severity: "High",
            riskType: "Identity",
            aiScore: 82,
            recommendation: "Update User Pool configuration to 'MFA Required' with SMS or TOTP.",
            description: "Production Cognito user pool is allowing logins without Multi-Factor Authentication.",
            attackVector: "Brute-force or credential stuffing attacks against user accounts lead to unauthorized platform access.",
            remediationSteps: ["Open Cognito Console", "Select User Pool", "Go to Sign-in Experience", "Set MFA to Required", "Select TOTP/SMS"],
            tenantId: req.user.id
          },
          {
            title: "GCP Cloud SQL Instance with Public IP",
            resource: "billing-db-primary",
            provider: "GCP",
            service: "SQL",
            region: "asia-east1",
            severity: "High",
            riskType: "Network",
            aiScore: 89,
            recommendation: "Enable Private IP and disable Public IP for the instance.",
            description: "Cloud SQL instance containing billing data is reachable via a public IP address.",
            attackVector: "Direct database connection attempt from unauthorized IP ranges using compromised db user creds.",
            remediationSteps: ["Navigate to Cloud SQL", "Select Instance", "Go to Connections", "Uncheck Public IP", "Verify Private IP Setup"],
            tenantId: req.user.id
          },
          {
            title: "Azure Storage Account Lacking Secure Transfer",
            resource: "stblobprodlogs01",
            provider: "Azure",
            service: "Storage",
            region: "northeurope",
            severity: "Medium",
            riskType: "Data Exposure",
            aiScore: 52,
            recommendation: "Set 'Secure transfer required' to Enabled in Configuration.",
            description: "Storage account allows HTTP connections, risking credential exposure over unencrypted channels.",
            attackVector: "Man-in-the-middle attack captures authentication tokens during data transit.",
            remediationSteps: ["Select Storage Account", "Go to Configuration", "Toggle 'Secure transfer required' to Enabled", "Save Settings"],
            tenantId: req.user.id
          },
          {
            title: "CloudFront Distribution Without WAF",
            resource: "d1234567890.cloudfront.net",
            provider: "AWS",
            service: "CloudFront",
            region: "Global",
            severity: "Medium",
            riskType: "Network",
            aiScore: 48,
            recommendation: "Associate an AWS WAF Web ACL with the distribution.",
            description: "Edge distribution for public portal is running without web application firewall protections.",
            attackVector: "Application-level attacks (SQLi/XSS) reach the origin without edge-level filtering.",
            remediationSteps: ["Create WAF Web ACL", "Go to CloudFront Console", "Select Distribution", "Edit General Settings", "Select WAF Web ACL"],
            tenantId: req.user.id
          }
        ];

      await Risk.insertMany(initialRisks);
      total = initialRisks.length;
    }


    // Pagination
    const skip = (page - 1) * (parseInt(limit) || 10);

    const risks = await Risk.find(query)
      .sort({ aiScore: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit) || 10);




    res.status(200).json({
      success: true,
      data: risks,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single risk
// @route   GET /api/risks/:id
exports.getRiskById = async (req, res) => {
  try {
    const risk = await Risk.findOne({ _id: req.params.id, tenantId: req.user.id });
    if (!risk) {
      return res.status(404).json({ success: false, error: 'Risk not found' });
    }
    res.status(200).json({ success: true, data: risk });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Invalid ID format' });
  }
};

// @desc    Resolve risk
// @route   PUT /api/risks/:id/resolve
exports.resolveRisk = async (req, res) => {
  try {
    const risk = await Risk.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.id }, 
      { status: 'Resolved' }, 
      { new: true }
    );
    
    if (!risk) {
      return res.status(404).json({ success: false, error: 'Risk not found' });
    }

    // Create a notification
    const notification = await Notification.create({
      title: 'Risk Resolved',
      message: `${risk.title} has been mitigated by the operator.`,
      severity: 'medium',
      tenantId: req.user.id
    });

    // Emit via Socket.io
    if (req.io) {
      req.io.emit('new_notification', notification);
      req.io.emit('riskUpdated', risk);
    }

    res.status(200).json({ success: true, data: risk });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// @desc    Export risks to CSV
// @route   GET /api/risks/export
exports.exportRisks = async (req, res) => {
  try {
    const risks = await Risk.find({ tenantId: req.user.id });
    
    const fields = ['_id', 'title', 'resource', 'provider', 'severity', 'aiScore', 'recommendation'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(risks);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('risks_export.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// @desc    Export single risk to CSV
// @route   GET /api/risks/:id/export
exports.exportRiskById = async (req, res) => {
  try {
    const risk = await Risk.findOne({ _id: req.params.id, tenantId: req.user.id });
    if (!risk) {
      return res.status(404).json({ success: false, error: 'Risk not found' });
    }
    
    const fields = ['_id', 'title', 'resource', 'provider', 'severity', 'aiScore', 'recommendation', 'description', 'impact', 'remediationSteps', 'status', 'environment', 'createdAt'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(risk);
    
    res.header('Content-Type', 'text/csv');
    res.attachment(`risk_report_${risk._id}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
const PDFDocument = require('pdfkit');

// @desc    Generate a professional PDF report for a single risk
// @route   GET /api/risks/:id/report
exports.generatePDFReport = async (req, res) => {
  try {
    const risk = await Risk.findOne({ _id: req.params.id, tenantId: req.user.id });
    if (!risk) {
      return res.status(404).json({ success: false, error: 'Risk not found' });
    }

    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    const filename = `Risk_Report_${risk._id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream the PDF to the response
    doc.pipe(res);

    // Header
    doc
      .fillColor('#00E5FF')
      .fontSize(24)
      .text('CloudFortress AI Security Report', { align: 'center' })
      .moveDown(0.2);
    
    doc
      .fillColor('#94a3b8')
      .fontSize(10)
      .text(`Generated on: ${new Date().toLocaleString()} | Investigation ID: ${risk._id}`, { align: 'center' })
      .moveDown(2);

    // Risk Overview Box
    doc
      .rect(50, doc.y, 500, 100)
      .fill('#111827')
      .stroke('#00E5FF');
    
    doc
      .fillColor('#ffffff')
      .fontSize(18)
      .text(`Issue: ${risk.title}`, 70, doc.y + 20)
      .fontSize(12)
      .fillColor('#94a3b8')
      .text(`Resource: ${risk.resource} | Provider: ${risk.provider}`, 70, doc.y + 5);

    doc.moveDown(5);

    // Severity & AI Score
    const severityColor = risk.severity.toLowerCase() === 'critical' ? '#EF4444' : 
                         risk.severity.toLowerCase() === 'high' ? '#F97316' : '#EAB308';

    doc
      .fillColor(severityColor)
      .fontSize(14)
      .text(`Severity: ${risk.severity.toUpperCase()}`, { continued: true })
      .fillColor('#ffffff')
      .text(` | AI Priority Score: ${risk.aiScore}/100`)
      .moveDown(1.5);

    // Sections
    const addSection = (title, content) => {
      doc
        .fillColor('#00E5FF')
        .fontSize(14)
        .text(title)
        .moveDown(0.5);
      
      doc
        .fillColor('#ffffff')
        .fontSize(11)
        .text(content, { align: 'justify', lineGap: 3 })
        .moveDown(1.5);
    };

    addSection('Detailed Analysis', risk.description || 'No detailed analysis provided for this finding.');
    addSection('Potential Impact', risk.impact || 'Failure to remediate may lead to unauthorized data access or infrastructure degradation.');
    
    // Remediation Steps
    doc.fillColor('#00E5FF').fontSize(14).text('AI Recommended Remediation Path').moveDown(0.5);
    
    if (risk.remediationSteps && risk.remediationSteps.length > 0) {
      risk.remediationSteps.forEach((step, index) => {
        doc.fillColor('#ffffff').fontSize(11).text(`${index + 1}. ${step}`).moveDown(0.2);
      });
    } else {
      doc.fillColor('#ffffff').fontSize(11).text('1. Consult security policy for further investigation.');
    }

    doc.moveDown(2);

    // Footer
    doc
      .fontSize(9)
      .fillColor('#4b5563')
      .text('--- CONFIDENTIAL SECURITY AUDIT REPORT ---', { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ success: false, error: 'Internal server error during PDF generation' });
  }
};

// @desc    Create new risk
// @route   POST /api/risks
exports.createRisk = async (req, res) => {
  try {
    const riskData = {
      ...req.body,
      tenantId: req.user.id
    };

    const risk = await Risk.create(riskData);

    res.status(201).json({
      success: true,
      data: risk
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update risk
// @route   PATCH /api/risks/:id
exports.updateRisk = async (req, res) => {
  try {
    const risk = await Risk.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!risk) {
      return res.status(404).json({ success: false, error: 'Risk not found' });
    }

    res.status(200).json({ success: true, data: risk });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete risk
// @route   DELETE /api/risks/:id
exports.deleteRisk = async (req, res) => {
  try {
    const risk = await Risk.findOneAndDelete({ _id: req.params.id, tenantId: req.user.id });

    if (!risk) {
      return res.status(404).json({ success: false, error: 'Risk not found' });
    }

    res.status(204).json({ success: true, data: null });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

