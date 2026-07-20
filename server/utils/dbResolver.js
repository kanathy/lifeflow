const User = require('../models/User');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const BloodInventory = require('../models/BloodInventory');
const EmergencyRequest = require('../models/EmergencyRequest');
const Notification = require('../models/Notification');
const Prediction = require('../models/Prediction');
const Report = require('../models/Report');
const mockDb = require('./mockDb');

const models = {
  User,
  Donor,
  Hospital,
  BloodInventory,
  EmergencyRequest,
  Notification,
  Prediction,
  Report
};

const getCollectionName = (modelName) => {
  if (modelName === 'BloodInventory') return 'inventory';
  if (modelName === 'EmergencyRequest') return 'requests';
  if (modelName === 'Prediction') return 'predictions';
  if (modelName === 'Report') return 'reports';
  
  // standard pluralization
  const lower = modelName.toLowerCase();
  if (lower.endsWith('y')) {
    return lower.slice(0, -1) + 'ies';
  }
  return lower + 's';
};

const dbResolver = {
  find: async (modelName, query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      const col = getCollectionName(modelName);
      return mockDb.find(col);
    }
    return models[modelName].find(query);
  },

  findOne: async (modelName, query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      const col = getCollectionName(modelName);
      return mockDb.findOne(col, query);
    }
    return models[modelName].findOne(query);
  },

  findById: async (modelName, id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      const col = getCollectionName(modelName);
      return mockDb.findById(col, id);
    }
    return models[modelName].findById(id);
  },

  create: async (modelName, payload) => {
    if (process.env.USE_MOCK_DB === 'true') {
      const col = getCollectionName(modelName);
      return mockDb.create(col, payload);
    }
    return models[modelName].create(payload);
  },

  findByIdAndUpdate: async (modelName, id, payload) => {
    if (process.env.USE_MOCK_DB === 'true') {
      const col = getCollectionName(modelName);
      return mockDb.findByIdAndUpdate(col, id, payload);
    }
    return models[modelName].findByIdAndUpdate(id, payload, { new: true });
  },

  findByIdAndDelete: async (modelName, id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      const col = getCollectionName(modelName);
      return mockDb.findByIdAndDelete(col, id);
    }
    return models[modelName].findByIdAndDelete(id);
  },

  getSettings: async () => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.getSettings();
    }
    // settings fallback in mongoose (we can store it in a single settings entry or mock)
    // for simplicity, we mock settings or use a mockDb file
    return mockDb.getSettings();
  },

  updateSettings: async (payload) => {
    return mockDb.updateSettings(payload);
  }
};

module.exports = dbResolver;
