const mongoose = require('mongoose');
const Connector = require('../models/Connector');
const fileStorage = require('../utils/fileStorage');

exports.getConnectors = async (req, res) => {
  try {
    const tenantId = req.user._id;

    if (mongoose.connection.readyState !== 1) {
      const localConnectors = fileStorage.getConnectors().filter(c => c.tenantId === tenantId);
      return res.status(200).json({ success: true, data: localConnectors });
    }

    const connectors = await Connector.find({ tenantId });
    res.status(200).json({ success: true, data: connectors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createConnector = async (req, res) => {
  try {
    const tenantId = req.user._id;
    const { name, provider, credentials } = req.body;

    if (!name || !provider || !credentials) {
      return res.status(400).json({ success: false, error: 'Name, provider, and credentials are required.' });
    }

    if (mongoose.connection.readyState !== 1) {
      const connector = await fileStorage.createConnector({
        name,
        provider,
        credentials,
        tenantId
      });
      return res.status(201).json({ success: true, data: connector });
    }

    const connector = await Connector.create({
      name,
      provider,
      credentials,
      tenantId
    });

    res.status(201).json({ success: true, data: connector });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteConnector = async (req, res) => {
  try {
    const tenantId = req.user._id;
    const { id } = req.params;

    if (mongoose.connection.readyState !== 1) {
      const connectors = fileStorage.getConnectors();
      const filtered = connectors.filter(c => !(c._id === id && c.tenantId === tenantId));
      if (connectors.length === filtered.length) {
        return res.status(404).json({ success: false, error: 'Connector not found' });
      }
      fileStorage.saveConnectors(filtered);
      return res.status(200).json({ success: true, message: 'Connector deleted successfully' });
    }

    const connector = await Connector.findOneAndDelete({ _id: id, tenantId });
    if (!connector) {
      return res.status(404).json({ success: false, error: 'Connector not found' });
    }

    res.status(200).json({ success: true, message: 'Connector deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
