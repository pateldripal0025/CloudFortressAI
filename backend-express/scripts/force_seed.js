const mongoose = require('mongoose');
const Vulnerability = require('../models/Vulnerability');
const Resource = require('../models/Resource');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

async function seed() {
    try {
        const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cloudfortress_node";
        await mongoose.connect(uri);
        console.log("Connected to MongoDB for force-seeding.");


        // Force-seed Vulnerabilities
        await Vulnerability.deleteMany({});
        const items = Array.from({ length: 425 }, (_, i) => ({
            resource: `res-cloud-${Math.floor(Math.random()*9999)}`,
            issue: ["Open Access Port", "MFA Disabled", "Admin Drift", "SSH Exposure", "Public Access", "SQLi Vector", "Sensitive Logs Leak"][i % 7],
            severity: ["Critical", "High", "Medium", "Low"][i % 4],
            score: Math.min(10, (Math.random() * 5) + 5),
            provider: ["AWS", "Azure", "GCP"][i % 3]
        }));
        await Vulnerability.insertMany(items);
        console.log(`Seeded ${items.length} Vulnerabilities.`);

        // Force-seed Resources
        await Resource.deleteMany({});
        const resItems = Array.from({ length: 1547 }, (_, i) => ({
            name: `asset-${Math.floor(Math.random()*100000)}`,
            type: ['Virtual Machine', 'SQL Database', 'S3 Bucket', 'IAM Role', 'Lambda', 'Blob Storage'][i % 6],
            provider: ["AWS", "Azure", "GCP"][i % 3],
            environment: "production"
        }));
        await Resource.insertMany(resItems);
        console.log(`Seeded ${resItems.length} Resources.`);

        console.log("FORCE SEED COMPLETE.");
        process.exit(0);
    } catch (err) {
        console.error("Force seed failed:", err);
        process.exit(1);
    }
}
seed();
