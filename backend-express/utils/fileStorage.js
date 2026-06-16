const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const RISKS_FILE = path.join(DATA_DIR, 'risks.json');
const ASSETS_FILE = path.join(DATA_DIR, 'assets.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');
const CONNECTORS_FILE = path.join(DATA_DIR, 'connectors.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure files exist with empty arrays
const initFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
};

initFile(USERS_FILE);
initFile(RISKS_FILE);
initFile(ASSETS_FILE);
initFile(NOTIFICATIONS_FILE);
initFile(CONNECTORS_FILE);

const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// ================= USER STORAGE =================

const getUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const saveUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error saving users:', err);
  }
};

exports.createUser = async (userData) => {
  const users = getUsers();
  
  if (users.find(u => u.email === userData.email)) {
    throw new Error('Email already in use');
  }

  const hashedPassword = await bcrypt.hash(userData.password, 12);

  const newUser = {
    _id: generateId(),
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    role: userData.role || 'analyst',
    organization: userData.organization || 'Default Corp',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  const { password, ...userWithoutPassword } = newUser;
  return { ...userWithoutPassword, _id: newUser._id };
};

exports.findUserByEmail = async (email) => {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  return user || null;
};

exports.findUserById = async (id) => {
  const users = getUsers();
  const user = users.find(u => u._id === id);
  return user || null;
};

exports.comparePassword = async (candidatePassword, hashedPassword) => {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

exports.updateUser = async (id, updateData) => {
  const users = getUsers();
  const user = users.find(u => u._id === id);
  if (!user) throw new Error('User not found');

  if (updateData.fullname) user.fullname = updateData.fullname;
  if (updateData.email) {
    const duplicate = users.find(u => u.email === updateData.email && u._id !== id);
    if (duplicate) throw new Error('Email already in use');
    user.email = updateData.email;
  }
  if (updateData.password) {
    user.password = await bcrypt.hash(updateData.password, 12);
  }

  saveUsers(users);
  const { password, ...userWithoutPassword } = user;
  return { ...userWithoutPassword, _id: user._id };
};

// ================= RISK STORAGE =================

exports.getRisks = () => {
  try {
    const data = fs.readFileSync(RISKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

exports.saveRisks = (risks) => {
  try {
    fs.writeFileSync(RISKS_FILE, JSON.stringify(risks, null, 2));
  } catch (err) {
    console.error('Error saving risks:', err);
  }
};

exports.createRisk = async (riskData) => {
  const risks = exports.getRisks();
  const newRisk = {
    _id: generateId(),
    status: 'Active',
    createdAt: new Date().toISOString(),
    ...riskData
  };
  risks.push(newRisk);
  exports.saveRisks(risks);
  return newRisk;
};

// ================= ASSETS/RESOURCES STORAGE =================

exports.getAssets = () => {
  try {
    const data = fs.readFileSync(ASSETS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

exports.saveAssets = (assets) => {
  try {
    fs.writeFileSync(ASSETS_FILE, JSON.stringify(assets, null, 2));
  } catch (err) {
    console.error('Error saving assets:', err);
  }
};

exports.createAsset = async (assetData) => {
  const assets = exports.getAssets();
  const newAsset = {
    _id: generateId(),
    createdAt: new Date().toISOString(),
    ...assetData
  };
  assets.push(newAsset);
  exports.saveAssets(assets);
  return newAsset;
};

// ================= NOTIFICATION STORAGE =================

exports.getNotifications = () => {
  try {
    const data = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

exports.saveNotifications = (notifications) => {
  try {
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
  } catch (err) {
    console.error('Error saving notifications:', err);
  }
};

exports.createNotification = async (notifData) => {
  const notifications = exports.getNotifications();
  const newNotif = {
    _id: generateId(),
    read: false,
    createdAt: new Date().toISOString(),
    ...notifData
  };
  notifications.push(newNotif);
  exports.saveNotifications(notifications);
  return newNotif;
};

// ================= CONNECTORS STORAGE =================

exports.getConnectors = () => {
  try {
    const data = fs.readFileSync(CONNECTORS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

exports.saveConnectors = (connectors) => {
  try {
    fs.writeFileSync(CONNECTORS_FILE, JSON.stringify(connectors, null, 2));
  } catch (err) {
    console.error('Error saving connectors:', err);
  }
};

exports.createConnector = async (connectorData) => {
  const connectors = exports.getConnectors();
  const newConnector = {
    _id: generateId(),
    status: 'Active',
    createdAt: new Date().toISOString(),
    ...connectorData
  };
  connectors.push(newConnector);
  exports.saveConnectors(connectors);
  return newConnector;
};
