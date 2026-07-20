/**
 * LifeFlow Database Seeder
 * Run this script ONCE to populate MongoDB with initial data.
 * Usage: node server/utils/seeder.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const BloodInventory = require('../models/BloodInventory');
const EmergencyRequest = require('../models/EmergencyRequest');
const Notification = require('../models/Notification');
const Prediction = require('../models/Prediction');
const Report = require('../models/Report');

const seedData = {
  users: [
    { userId: 'USR001', name: 'Admin User', role: 'Administrator', email: 'admin@lifeflow.lk', password: 'admin123', status: 'Active' },
    { userId: 'USR002', name: 'Hospital User', role: 'Hospital Staff', email: 'staff@kandy.lk', password: 'staff123', status: 'Active' },
    { userId: 'USR003', name: 'Blood Bank Staff', role: 'Donor Coordinator', email: 'bank@colombo.lk', password: 'bank123', status: 'Active' },
    { userId: 'USR004', name: 'Donor Coordinator', role: 'Donor Coordinator', email: 'donor@galle.lk', password: 'donor123', status: 'Active' },
    { userId: 'USR005', name: 'Viewer User', role: 'Viewer', email: 'viewer@lifeflow.lk', password: 'viewer123', status: 'Inactive' }
  ],
  donors: [
    { donorId: 'DNR001', name: 'Nimal Bandara', bloodGroup: 'O+', contact: '077 123 4567', email: 'nimal@gmail.com', lastDonationDate: new Date('2025-05-31'), status: 'Active', district: 'Colombo' },
    { donorId: 'DNR002', name: 'Kasun Madushanka', bloodGroup: 'A-', contact: '071 234 5678', email: 'kasun@gmail.com', lastDonationDate: new Date('2025-05-30'), status: 'Active', district: 'Kandy' },
    { donorId: 'DNR003', name: 'Dilini Fernando', bloodGroup: 'B+', contact: '076 345 6789', email: 'dilini@gmail.com', lastDonationDate: new Date('2025-05-30'), status: 'Active', district: 'Galle' },
    { donorId: 'DNR004', name: 'Thilina Jayasinghe', bloodGroup: 'AB+', contact: '077 987 6543', email: 'thilina@gmail.com', lastDonationDate: new Date('2025-05-29'), status: 'Active', district: 'Jaffna' },
    { donorId: 'DNR005', name: 'Madara Perera', bloodGroup: 'O-', contact: '075 567 8901', email: 'madara@gmail.com', lastDonationDate: new Date('2025-05-29'), status: 'Inactive', district: 'Batticaloa' },
    { donorId: 'DNR006', name: 'Sampath Perera', bloodGroup: 'A+', contact: '072 654 3210', email: 'sampath@gmail.com', lastDonationDate: new Date('2025-05-28'), status: 'Active', district: 'Anuradhapura' }
  ],
  hospitals: [
    { hospitalId: 'HSP001', name: 'Colombo General Hospital', district: 'Colombo', type: 'Government', contact: '011 269 1111', status: 'Active' },
    { hospitalId: 'HSP002', name: 'Kandy General Hospital', district: 'Kandy', type: 'Government', contact: '081 222 2222', status: 'Active' },
    { hospitalId: 'HSP003', name: 'Lady Ridgeway Hospital', district: 'Colombo', type: 'Government', contact: '011 269 3911', status: 'Active' },
    { hospitalId: 'HSP004', name: 'Jaffna Teaching Hospital', district: 'Jaffna', type: 'Government', contact: '021 222 3344', status: 'Active' },
    { hospitalId: 'HSP005', name: 'Durdans Hospital', district: 'Colombo', type: 'Private', contact: '011 541 0000', status: 'Active' }
  ],
  inventory: [
    { bloodGroup: 'A+', rhFactor: 'positive', district: 'Colombo', availableUnits: 320, expiryDays: 12 },
    { bloodGroup: 'A-', rhFactor: 'negative', district: 'Kandy', availableUnits: 120, expiryDays: 5 },
    { bloodGroup: 'B+', rhFactor: 'positive', district: 'Galle', availableUnits: 250, expiryDays: 8 },
    { bloodGroup: 'B-', rhFactor: 'negative', district: 'Jaffna', availableUnits: 90, expiryDays: 2 },
    { bloodGroup: 'O+', rhFactor: 'positive', district: 'Colombo', availableUnits: 410, expiryDays: 10 },
    { bloodGroup: 'O-', rhFactor: 'negative', district: 'Anuradhapura', availableUnits: 45, expiryDays: 15 },
    { bloodGroup: 'AB+', rhFactor: 'positive', district: 'Kandy', availableUnits: 100, expiryDays: 9 },
    { bloodGroup: 'AB-', rhFactor: 'negative', district: 'Trincomalee', availableUnits: 25, expiryDays: 3 }
  ],
  requests: [
    { requestId: 'REQ001', patientName: 'Nimal Perera', bloodGroup: 'A+', hospital: 'Colombo General', district: 'Colombo', status: 'Pending', requestedAt: new Date(Date.now() - 10 * 60 * 1000) },
    { requestId: 'REQ002', patientName: 'Shanika Silva', bloodGroup: 'O-', hospital: 'Kandy Hospital', district: 'Kandy', status: 'Accepted', requestedAt: new Date(Date.now() - 25 * 60 * 1000) },
    { requestId: 'REQ003', patientName: 'Tharindu Fernando', bloodGroup: 'B+', hospital: 'Jaffna Teaching', district: 'Jaffna', status: 'Pending', requestedAt: new Date(Date.now() - 60 * 60 * 1000) },
    { requestId: 'REQ004', patientName: 'Saman Kumara', bloodGroup: 'AB+', hospital: 'Galle Hospital', district: 'Galle', status: 'Completed', requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { requestId: 'REQ005', patientName: 'Lakshi Dissanayake', bloodGroup: 'O+', hospital: 'Batticaloa Hosp.', district: 'Batticaloa', status: 'Accepted', requestedAt: new Date(Date.now() - 3 * 60 * 60 * 1000) }
  ],
  notifications: [
    { message: 'Blood shortage predicted in Colombo district', type: 'Alert', dateTime: new Date('2025-05-31T10:25:00'), status: 'Unread' },
    { message: 'Emergency request REQ002 has been accepted', type: 'System', dateTime: new Date('2025-05-30T21:10:00'), status: 'Unread' },
    { message: 'New blood stock added to Kandy Hospital', type: 'System', dateTime: new Date('2025-05-30T08:30:00'), status: 'Read' },
    { message: 'Donor Nimal Bandara is eligible to donate', type: 'Reminder', dateTime: new Date('2025-05-29T19:30:00'), status: 'Read' },
    { message: 'Blood unit O- in Anuradhapura will expire soon', type: 'Alert', dateTime: new Date('2025-05-29T16:15:00'), status: 'Read' }
  ],
  predictions: [
    { district: 'Colombo', shortageRisk: 90, riskLevel: 'High Risk', trend: [80, 85, 90, 88, 92, 90, 95] },
    { district: 'Kandy', shortageRisk: 65, riskLevel: 'Medium Risk', trend: [50, 55, 60, 58, 62, 65, 68] },
    { district: 'Galle', shortageRisk: 45, riskLevel: 'Medium Risk', trend: [40, 42, 45, 43, 44, 45, 47] },
    { district: 'Jaffna', shortageRisk: 20, riskLevel: 'Low Risk', trend: [25, 22, 20, 21, 19, 20, 18] },
    { district: 'Batticaloa', shortageRisk: 15, riskLevel: 'Low Risk', trend: [10, 12, 14, 13, 15, 15, 16] }
  ],
  reports: [
    { reportName: 'Monthly Blood Inventory Report', type: 'Inventory', dateRange: '01 May - 31 May 2025', generatedOn: new Date('2025-05-31T10:30:00') },
    { reportName: 'Blood Usage Report', type: 'Usage', dateRange: '01 May - 31 May 2025', generatedOn: new Date('2025-05-31T10:30:00') },
    { reportName: 'Donor Activity Report', type: 'Donor', dateRange: '01 May - 31 May 2025', generatedOn: new Date('2025-05-31T09:45:00') }
  ]
};

const runSeeder = async () => {
  try {
    console.log('\x1b[36m%s\x1b[0m', '🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\x1b[32m%s\x1b[0m', '✅ MongoDB Connected! Starting seed...\n');

    // Clear existing collections
    console.log('🗑️  Clearing old data...');
    await Promise.all([
      User.deleteMany({}),
      Donor.deleteMany({}),
      Hospital.deleteMany({}),
      BloodInventory.deleteMany({}),
      EmergencyRequest.deleteMany({}),
      Notification.deleteMany({}),
      Prediction.deleteMany({}),
      Report.deleteMany({})
    ]);

    // Insert Users (Mongoose pre-save hook hashes passwords automatically)
    console.log('👤 Seeding Users...');
    for (const userData of seedData.users) {
      await User.create(userData);
    }
    console.log(`   ✅ ${seedData.users.length} users created`);

    // Insert all other collections
    console.log('🩸 Seeding Donors...');
    await Donor.insertMany(seedData.donors);
    console.log(`   ✅ ${seedData.donors.length} donors created`);

    console.log('🏥 Seeding Hospitals...');
    await Hospital.insertMany(seedData.hospitals);
    console.log(`   ✅ ${seedData.hospitals.length} hospitals created`);

    console.log('💉 Seeding Blood Inventory...');
    await BloodInventory.insertMany(seedData.inventory);
    console.log(`   ✅ ${seedData.inventory.length} stock entries created`);

    console.log('🚨 Seeding Emergency Requests...');
    await EmergencyRequest.insertMany(seedData.requests);
    console.log(`   ✅ ${seedData.requests.length} requests created`);

    console.log('🔔 Seeding Notifications...');
    await Notification.insertMany(seedData.notifications);
    console.log(`   ✅ ${seedData.notifications.length} notifications created`);

    console.log('📊 Seeding Predictions...');
    await Prediction.insertMany(seedData.predictions);
    console.log(`   ✅ ${seedData.predictions.length} predictions created`);

    console.log('📋 Seeding Reports...');
    await Report.insertMany(seedData.reports);
    console.log(`   ✅ ${seedData.reports.length} reports created`);

    console.log('\n\x1b[32m%s\x1b[0m', '🎉 Database seeded successfully!');
    console.log('\x1b[33m%s\x1b[0m', '👉 You can now login with:');
    console.log('   Admin   → admin@lifeflow.lk / admin123');
    console.log('   Staff   → staff@kandy.lk / staff123\n');
    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Seeder Error:', error.message);
    process.exit(1);
  }
};

runSeeder();
