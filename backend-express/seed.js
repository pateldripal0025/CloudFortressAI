require('dotenv').config();
const mongoose = require('mongoose');
const Risk = require('./models/Risk');
const Resource = require('./models/Resource');
const Scan = require('./models/Scan');
const Vulnerability = require('./models/Vulnerability');
const User = require('./models/User');

// Test user that will be created
const testUser = {
  fullname: "Test User",
  email: "test@user.com",
  password: "password",
  role: "admin"
};

const sampleRisks = [
  {
    title: "Publicly Accessible RDS Instance",
    resource: "finance-prod-db",
    provider: "AWS",
    severity: "Critical",
    aiScore: 94.5,
    recommendation: "Restrict inbound traffic to VPC CIDR only and enable private subnet placement.",
    description: "RDS instance 'finance-prod-db' is configured with public accessibility set to 'Yes'.",
    impact: "This allows anyone with the RDS hostname to attempt connections, potentially leading to brute-force attacks or data breaches.",
    remediationSteps: ["Navigate to RDS Console", "Select 'finance-prod-db'", "Modify and set 'Public access' to 'No'", "Update VPC Security Group rules"],
    environment: "production"
  },
  {
    title: "Public Storage Container Exposure",
    resource: "storage-account-alpha",
    provider: "Azure",
    severity: "High",
    aiScore: 82.0,
    recommendation: "Disable public access level for the container and implement shared access signatures (SAS).",
    description: "Storage container 'public-blobs' has anonymous read access enabled.",
    impact: "Confidential files could be potentially downloaded by unauthorized third parties.",
    remediationSteps: ["Access Azure Portal", "Go to Storage Account properties", "Set 'Allow Blob public access' to 'Disabled'"],
    environment: "production"
  },
  {
    title: "S3 Bucket without Encryption",
    resource: "backups-bucket-01",
    provider: "AWS",
    severity: "Medium",
    aiScore: 48.0,
    recommendation: "Enable AES-256 server-side encryption and enforce it via bucket policy.",
    description: "The S3 bucket does not have default encryption enabled.",
    impact: "Data at rest is not protected against unauthorized physical access to disks.",
    remediationSteps: ["Open S3 Console", "Select bucket Properties", "Enable 'Default encryption'"],
    environment: "staging"
  }
];

const sampleResources = [
  { name: "finance-prod-db", type: "RDS Instance", provider: "AWS", environment: "production" },
  { name: "storage-account-alpha", type: "Storage Account", provider: "Azure", environment: "production" },
  { name: "web-server-v1", type: "Virtual Machine", provider: "AWS", environment: "staging" },
  { name: "auth-gateway", type: "API Gateway", provider: "AWS", environment: "development" },
  { name: "lambda-processor", type: "Lambda Function", provider: "AWS", environment: "production" },
  { name: "k8s-cluster-prod", type: "K8s Cluster", provider: "AWS", environment: "production" },
  { name: "blob-storage-dev", type: "Blob Storage", provider: "Azure", environment: "development" },
  { name: "gcp-compute-1", type: "Compute Engine", provider: "GCP", environment: "production" }
];

const sampleScans = [
  { title: "Quarterly Compliance Audit", status: "Completed", environment: "production" },
  { title: "Weekly Vulnerability Scan", status: "Running", environment: "production" },
  { title: "Pre-deployment Security Check", status: "Completed", environment: "staging" }
];

const sampleVulnerabilities = [
  { resource: "EC2 Instance", issue: "Open SSH Port (22)", severity: "High", score: 8.5, provider: "AWS" },
  { resource: "S3 Bucket", issue: "Public Read Access Enabled", severity: "Critical", score: 9.2, provider: "AWS" },
  { resource: "Azure VM", issue: "Outdated OS Version", severity: "Medium", score: 6.1, provider: "Azure" },
  { resource: "IAM Role", issue: "Privilege Escalation Risk", severity: "High", score: 7.8, provider: "AWS" },
  { resource: "Azure SQL Database", issue: "Data Plane Encryption Disabled", severity: "Critical", score: 9.5, provider: "Azure" },
  { resource: "Network Security Group", issue: "Allow Any Any (0.0.0.0/0)", severity: "High", score: 8.9, provider: "AWS" },
  { resource: "GCP Storage Bucket", issue: "No Encryption on Storage Objects", severity: "Medium", score: 5.4, provider: "GCP" },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Seeding database...");
    
    // Clear existing data
    await Risk.deleteMany({});
    await Resource.deleteMany({});
    await Scan.deleteMany({});
    await Vulnerability.deleteMany({});
    
    // Create or get test user
    let user = await User.findOne({ email: testUser.email });
    if (!user) {
      user = await User.create(testUser);
      console.log("[Seed] Test user created:", user.email);
    } else {
      console.log("[Seed] Test user already exists:", user.email);
    }
    
    const tenantId = user._id;
    
    // Add tenantId to resources and insert
    const resourcesWithTenant = sampleResources.map(r => ({ ...r, tenantId }));
    await Resource.insertMany(resourcesWithTenant);
    console.log(`[Seed] Inserted ${resourcesWithTenant.length} resources`);
    
    // Add tenantId to risks and insert
    const risksWithTenant = sampleRisks.map(r => ({ ...r, tenantId }));
    await Risk.insertMany(risksWithTenant);
    console.log(`[Seed] Inserted ${risksWithTenant.length} risks`);
    
    // Insert scans and vulnerabilities
    const scansWithTenant = sampleScans.map(s => ({ ...s, tenantId }));
    const vulnerabilitiesWithTenant = sampleVulnerabilities.map(v => ({ ...v, tenantId }));
    await Scan.insertMany(scansWithTenant);
    await Vulnerability.insertMany(vulnerabilitiesWithTenant);
    
    console.log("Database seeded successfully with Risks, Resources, and Scans!");
    process.exit();
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedDB();
