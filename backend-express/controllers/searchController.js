const Risk = require('../models/Risk');
const Resource = require('../models/Resource');
const Scan = require('../models/Scan');

exports.globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    const environment = req.headers['x-env'] || 'production';
    
    if (!q) {
      return res.status(200).json({ risks: [], resources: [], scans: [] });
    }

    const searchQuery = {
      $and: [
        { environment },
        {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { name: { $regex: q, $options: 'i' } },
            { resource: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    };

    // Separate queries since models differ
    const [risks, resources, scans] = await Promise.all([
      Risk.find({ title: { $regex: q, $options: 'i' }, environment }).limit(5),
      Resource.find({ name: { $regex: q, $options: 'i' }, environment }).limit(5),
      Scan.find({ title: { $regex: q, $options: 'i' }, environment }).limit(5)
    ]);

    res.status(200).json({
      success: true,
      data: {
        risks,
        resources,
        scans
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
