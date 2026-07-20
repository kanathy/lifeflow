// Mock in-memory database with pre-populated dashboard data matching screens
const bcrypt = require('bcryptjs');

let data = {
  users: [
    {
      _id: 'USR001',
      userId: 'USR001',
      name: 'Admin User',
      role: 'Administrator',
      email: 'admin@lifeflow.lk',
      password: bcrypt.hashSync('admin123', 8),
      status: 'Active'
    },
    {
      _id: 'USR002',
      userId: 'USR002',
      name: 'Hospital User',
      role: 'Hospital Staff',
      email: 'staff@kandy.lk',
      password: bcrypt.hashSync('staff123', 8),
      status: 'Active'
    },
    {
      _id: 'USR003',
      userId: 'USR003',
      name: 'Blood Bank Staff',
      role: 'Donor Coordinator',
      email: 'bank@colombo.lk',
      password: bcrypt.hashSync('bank123', 8),
      status: 'Active'
    },
    {
      _id: 'USR004',
      userId: 'USR004',
      name: 'Donor Coordinator',
      role: 'Donor Coordinator',
      email: 'donor@galle.lk',
      password: bcrypt.hashSync('donor123', 8),
      status: 'Active'
    },
    {
      _id: 'USR005',
      userId: 'USR005',
      name: 'Viewer User',
      role: 'Viewer',
      email: 'viewer@lifeflow.lk',
      password: bcrypt.hashSync('viewer123', 8),
      status: 'Inactive'
    }
  ],
  donors: [
    {
      _id: 'DNR001',
      donorId: 'DNR001',
      name: 'Nimal Bandara',
      bloodGroup: 'O+',
      contact: '077 123 4567',
      email: 'nimal@gmail.com',
      lastDonationDate: new Date('2025-05-31T10:30:00'),
      status: 'Active',
      district: 'Colombo'
    },
    {
      _id: 'DNR002',
      donorId: 'DNR002',
      name: 'Kasun Madushanka',
      bloodGroup: 'A-',
      contact: '071 234 5678',
      email: 'kasun@gmail.com',
      lastDonationDate: new Date('2025-05-30T14:15:00'),
      status: 'Active',
      district: 'Kandy'
    },
    {
      _id: 'DNR003',
      donorId: 'DNR003',
      name: 'Dilini Fernando',
      bloodGroup: 'B+',
      contact: '076 345 6789',
      email: 'dilini@gmail.com',
      lastDonationDate: new Date('2025-05-30T09:00:00'),
      status: 'Active',
      district: 'Galle'
    },
    {
      _id: 'DNR004',
      donorId: 'DNR004',
      name: 'Thilina Jayasinghe',
      bloodGroup: 'AB+',
      contact: '077 987 6543',
      email: 'thilina@gmail.com',
      lastDonationDate: new Date('2025-05-29T11:45:00'),
      status: 'Active',
      district: 'Jaffna'
    },
    {
      _id: 'DNR005',
      donorId: 'DNR005',
      name: 'Madara Perera',
      bloodGroup: 'O-',
      contact: '075 567 8901',
      email: 'madara@gmail.com',
      lastDonationDate: new Date('2025-05-29T16:20:00'),
      status: 'Inactive',
      district: 'Batticaloa'
    },
    {
      _id: 'DNR006',
      donorId: 'DNR006',
      name: 'Sampath Perera',
      bloodGroup: 'A+',
      contact: '072 654 3210',
      email: 'sampath@gmail.com',
      lastDonationDate: new Date('2025-05-28T09:30:00'),
      status: 'Active',
      district: 'Anuradhapura'
    }
  ],
  hospitals: [
    {
      _id: 'HSP001',
      hospitalId: 'HSP001',
      name: 'Colombo General Hospital',
      district: 'Colombo',
      type: 'Government',
      contact: '011 269 1111',
      status: 'Active'
    },
    {
      _id: 'HSP002',
      hospitalId: 'HSP002',
      name: 'Kandy General Hospital',
      district: 'Kandy',
      type: 'Government',
      contact: '081 222 2222',
      status: 'Active'
    },
    {
      _id: 'HSP003',
      hospitalId: 'HSP003',
      name: 'Lady Ridgeway Hospital',
      district: 'Colombo',
      type: 'Government',
      contact: '011 269 3911',
      status: 'Active'
    },
    {
      _id: 'HSP004',
      hospitalId: 'HSP004',
      name: 'Jaffna Teaching Hospital',
      district: 'Jaffna',
      type: 'Government',
      contact: '021 222 3344',
      status: 'Active'
    },
    {
      _id: 'HSP005',
      hospitalId: 'HSP005',
      name: 'Durdans Hospital',
      district: 'Colombo',
      type: 'Private',
      contact: '011 541 0000',
      status: 'Active'
    }
  ],
  inventory: [
    { _id: 'INV001', bloodGroup: 'A+', rhFactor: 'positive', district: 'Colombo', availableUnits: 320, expiryDays: 12, lastUpdated: new Date('2025-05-31T10:30:00') },
    { _id: 'INV002', bloodGroup: 'A-', rhFactor: 'negative', district: 'Kandy', availableUnits: 120, expiryDays: 5, lastUpdated: new Date('2025-05-30T14:15:00') },
    { _id: 'INV003', bloodGroup: 'B+', rhFactor: 'positive', district: 'Galle', availableUnits: 250, expiryDays: 8, lastUpdated: new Date('2025-05-30T09:00:00') },
    { _id: 'INV004', bloodGroup: 'B-', rhFactor: 'negative', district: 'Jaffna', availableUnits: 90, expiryDays: 2, lastUpdated: new Date('2025-05-29T11:45:00') },
    { _id: 'INV005', bloodGroup: 'O+', rhFactor: 'positive', district: 'Colombo', availableUnits: 410, expiryDays: 10, lastUpdated: new Date('2025-05-31T10:30:00') },
    { _id: 'INV006', bloodGroup: 'O-', rhFactor: 'negative', district: 'Anuradhapura', availableUnits: 45, expiryDays: 15, lastUpdated: new Date('2025-05-29T16:20:00') },
    { _id: 'INV007', bloodGroup: 'AB+', rhFactor: 'positive', district: 'Kandy', availableUnits: 100, expiryDays: 9, lastUpdated: new Date('2025-05-31T10:30:00') },
    { _id: 'INV008', bloodGroup: 'AB-', rhFactor: 'negative', district: 'Trincomalee', availableUnits: 25, expiryDays: 3, lastUpdated: new Date('2025-05-31T10:30:00') }
  ],
  requests: [
    {
      _id: 'REQ001',
      requestId: 'REQ001',
      patientName: 'Nimal Perera',
      bloodGroup: 'A+',
      hospital: 'Colombo General',
      district: 'Colombo',
      status: 'Pending',
      requestedAt: new Date(Date.now() - 10 * 60 * 1000) // 10 mins ago
    },
    {
      _id: 'REQ002',
      requestId: 'REQ002',
      patientName: 'Shanika Silva',
      bloodGroup: 'O-',
      hospital: 'Kandy Hospital',
      district: 'Kandy',
      status: 'Accepted',
      requestedAt: new Date(Date.now() - 25 * 60 * 1000) // 25 mins ago
    },
    {
      _id: 'REQ003',
      requestId: 'REQ003',
      patientName: 'Tharindu Fernando',
      bloodGroup: 'B+',
      hospital: 'Jaffna Teaching',
      district: 'Jaffna',
      status: 'Pending',
      requestedAt: new Date(Date.now() - 60 * 60 * 1000) // 1 hr ago
    },
    {
      _id: 'REQ004',
      requestId: 'REQ004',
      patientName: 'Saman Kumara',
      bloodGroup: 'AB+',
      hospital: 'Galle Hospital',
      district: 'Galle',
      status: 'Completed',
      requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hrs ago
    },
    {
      _id: 'REQ005',
      requestId: 'REQ005',
      patientName: 'Lakshi Dissanayake',
      bloodGroup: 'O+',
      hospital: 'Batticaloa Hosp.',
      district: 'Batticaloa',
      status: 'Accepted',
      requestedAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hrs ago
    }
  ],
  notifications: [
    { _id: 'NOT001', message: 'Blood shortage predicted in Colombo district', type: 'Alert', dateTime: new Date('2025-05-31T10:25:00'), status: 'Unread' },
    { _id: 'NOT002', message: 'Emergency request REQ002 has been accepted', type: 'System', dateTime: new Date('2025-05-30T21:10:00'), status: 'Unread' },
    { _id: 'NOT003', message: 'New blood stock added to Kandy Hospital', type: 'System', dateTime: new Date('2025-05-30T08:30:00'), status: 'Read' },
    { _id: 'NOT004', message: 'Donor Nimal Bandara is eligible to donate', type: 'Reminder', dateTime: new Date('2025-05-29T19:30:00'), status: 'Read' },
    { _id: 'NOT005', message: 'Blood unit O- in Anuradhapura will expire soon', type: 'Alert', dateTime: new Date('2025-05-29T16:15:00'), status: 'Read' },
    { _id: 'NOT006', message: 'Monthly report for May is ready', type: 'System', dateTime: new Date('2025-05-28T10:00:00'), status: 'Read' }
  ],
  predictions: [
    { _id: 'PRD001', district: 'Colombo', shortageRisk: 90, riskLevel: 'High Risk', trend: [80, 85, 90, 88, 92, 90, 95] },
    { _id: 'PRD002', district: 'Kandy', shortageRisk: 65, riskLevel: 'Medium Risk', trend: [50, 55, 60, 58, 62, 65, 68] },
    { _id: 'PRD003', district: 'Galle', shortageRisk: 45, riskLevel: 'Medium Risk', trend: [40, 42, 45, 43, 44, 45, 47] },
    { _id: 'PRD004', district: 'Jaffna', shortageRisk: 20, riskLevel: 'Low Risk', trend: [25, 22, 20, 21, 19, 20, 18] },
    { _id: 'PRD005', district: 'Batticaloa', shortageRisk: 15, riskLevel: 'Low Risk', trend: [10, 12, 14, 13, 15, 15, 16] }
  ],
  reports: [
    { _id: 'REP001', reportName: 'Monthly Blood Inventory Report', type: 'Inventory', dateRange: '01 May - 31 May 2025', generatedOn: new Date('2025-05-31T10:30:00') },
    { _id: 'REP002', reportName: 'Blood Usage Report', type: 'Usage', dateRange: '01 May - 31 May 2025', generatedOn: new Date('2025-05-31T10:30:00') },
    { _id: 'REP003', reportName: 'Donor Activity Report', type: 'Donor', dateRange: '01 May - 31 May 2025', generatedOn: new Date('2025-05-31T09:45:00') },
    { _id: 'REP004', reportName: 'Emergency Requests Report', type: 'Requests', dateRange: '01 May - 31 May 2025', generatedOn: new Date('2025-05-31T09:20:00') },
    { _id: 'REP005', reportName: 'District-wise Summary Report', type: 'Summary', dateRange: '01 May - 31 May 2025', generatedOn: new Date('2025-05-30T16:30:00') }
  ],
  settings: {
    systemName: 'LifeFlow Blood Bank Management System',
    organization: 'National Blood Transfusion Service',
    contactEmail: 'info@lifeflow.lk',
    contactPhone: '011 268 1111',
    address: '123, Keas Road, Colombo 08, Sri Lanka'
  }
};

const mockDb = {
  find: (collection) => {
    return Promise.resolve(data[collection] || []);
  },
  findOne: (collection, query) => {
    const items = data[collection] || [];
    const found = items.find(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
    return Promise.resolve(found || null);
  },
  findById: (collection, id) => {
    const items = data[collection] || [];
    const found = items.find(item => item._id === id || item.userId === id || item.donorId === id || item.hospitalId === id || item.requestId === id);
    return Promise.resolve(found || null);
  },
  create: (collection, payload) => {
    const items = data[collection] || [];
    const prefix = {
      users: 'USR',
      donors: 'DNR',
      hospitals: 'HSP',
      inventory: 'INV',
      requests: 'REQ',
      notifications: 'NOT',
      predictions: 'PRD',
      reports: 'REP'
    }[collection] || 'ID';
    
    const count = items.length + 1;
    const newId = `${prefix}${String(count).padStart(3, '0')}`;
    
    const newItem = {
      _id: newId,
      [`${collection.slice(0, -1)}Id`]: newId,
      ...payload,
      lastUpdated: new Date(),
      requestedAt: new Date(),
      dateTime: new Date(),
      generatedOn: new Date()
    };
    
    if (collection === 'inventory') {
      newItem.lastUpdated = new Date();
    }
    
    items.push(newItem);
    return Promise.resolve(newItem);
  },
  findByIdAndUpdate: (collection, id, payload) => {
    const items = data[collection] || [];
    const index = items.findIndex(item => item._id === id || item.userId === id || item.donorId === id || item.hospitalId === id || item.requestId === id);
    if (index === -1) return Promise.resolve(null);
    
    items[index] = { ...items[index], ...payload, lastUpdated: new Date() };
    return Promise.resolve(items[index]);
  },
  findByIdAndDelete: (collection, id) => {
    const items = data[collection] || [];
    const index = items.findIndex(item => item._id === id || item.userId === id || item.donorId === id || item.hospitalId === id || item.requestId === id);
    if (index === -1) return Promise.resolve(null);
    
    const deleted = items.splice(index, 1)[0];
    return Promise.resolve(deleted);
  },
  getSettings: () => {
    return Promise.resolve(data.settings);
  },
  updateSettings: (newSettings) => {
    data.settings = { ...data.settings, ...newSettings };
    return Promise.resolve(data.settings);
  }
};

module.exports = mockDb;
