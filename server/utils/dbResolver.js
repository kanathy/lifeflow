const User = require('../models/User');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const BloodInventory = require('../models/BloodInventory');
const EmergencyRequest = require('../models/EmergencyRequest');
const Notification = require('../models/Notification');
const Prediction = require('../models/Prediction');
const Report = require('../models/Report');
const AccidentCase = require('../models/AccidentCase');
const DiseaseCase = require('../models/DiseaseCase');
const Setting = require('../models/Setting');

const models = {
  User,
  Donor,
  Hospital,
  BloodInventory,
  EmergencyRequest,
  Notification,
  Prediction,
  Report,
  AccidentCase,
  DiseaseCase,
  Setting
};

const dbResolver = {
  find: async (modelName, query = {}) => {
    return models[modelName].find(query).lean();
  },

  findOne: async (modelName, query = {}) => {
    return models[modelName].findOne(query).lean();
  },

  findById: async (modelName, id) => {
    return models[modelName].findById(id).lean();
  },

  create: async (modelName, payload) => {
    const doc = await models[modelName].create(payload);
    return doc.toObject();
  },

  findByIdAndUpdate: async (modelName, id, payload) => {
    return models[modelName].findByIdAndUpdate(id, payload, { new: true }).lean();
  },

  findByIdAndDelete: async (modelName, id) => {
    return models[modelName].findByIdAndDelete(id).lean();
  },

  getSettings: async () => {
    let setting = await Setting.findOne().lean();
    if (!setting) {
      setting = await Setting.create({
        systemName: 'LifeFlow Blood Bank Management System',
        organization: 'National Blood Transfusion Service',
        contactEmail: 'info@lifeflow.lk',
        contactPhone: '011 268 1111',
        address: '123, Keas Road, Colombo 08, Sri Lanka'
      });
      setting = setting.toObject();
    }
    return setting;
  },

  updateSettings: async (payload) => {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create(payload);
    } else {
      Object.assign(setting, payload);
      await setting.save();
    }
    return setting.toObject();
  }
};

module.exports = dbResolver;
