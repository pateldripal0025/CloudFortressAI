const Resource = require('../models/Resource');

// @desc    Get all assets with summary counts
// @route   GET /api/assets
exports.getAssets = async (req, res) => {
  try {
    const environment = req.headers['x-env'] || 'production';
    const tenantId = req.user.id;
    
    let totalCount = await Resource.countDocuments({ environment, tenantId });

    // Mass-seed if looking empty for this tenant
    if (totalCount === 0) {
      console.log(`[ASSETS] Seeding enterprise resources for tenant: ${tenantId}`);
      await exports.generateRandomAssets(tenantId, 50, environment);
      totalCount = await Resource.countDocuments({ environment, tenantId });
    }
    
    const resources = await Resource.find({ environment, tenantId }).sort({ createdAt: -1 });
    
    const typeDistribution = await Resource.aggregate([
      { $match: { environment, tenantId: req.user._id } },
      { $group: { _id: "$type", value: { $sum: 1 } } }
    ]);

    const providerDistribution = await Resource.aggregate([
      { $match: { environment, tenantId: req.user._id } },
      { $group: { _id: "$provider", value: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalCount,
        assets: resources.slice(0, 50),
        distribution: {
          types: typeDistribution.map(td => ({ type: td._id, count: td.value })),
          providers: providerDistribution.map(pd => ({ provider: pd._id, count: pd.value }))
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Simulation Helper
exports.generateRandomAssets = async (tenantId, count = 5, environment = 'production') => {
  try {
    if (!tenantId) return [];

    const types = ['Virtual Machine', 'SQL Database', 'S3 Bucket', 'IAM Role', 'Lambda Function', 'Blob Storage', 'K8s Cluster'];
    const providers = ['AWS', 'Azure', 'GCP'];
    const newAssets = [];
    
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const provider = providers[Math.floor(Math.random() * providers.length)];
      const prefix = type.split(' ')[0].toLowerCase();
      
      newAssets.push({
        name: `${prefix}-${Math.random().toString(36).substring(7)}-${provider.toLowerCase()}`,
        type,
        provider,
        environment,
        tenantId
      });
    }
    
    const inserted = await Resource.insertMany(newAssets);
    return inserted;
  } catch (err) {
    console.error('[ASSET SIMULATION ERROR]', err);
    return [];
  }
};

