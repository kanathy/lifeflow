const mongoose = require('mongoose');
const Hospital = require('./models/Hospital');
const BloodInventory = require('./models/BloodInventory');

const BLOOD_GROUPS = [
  { group: 'O+', rh: 'positive', factor: 1.8, expiry: 18 },
  { group: 'A+', rh: 'positive', factor: 1.3, expiry: 14 },
  { group: 'B+', rh: 'positive', factor: 1.2, expiry: 16 },
  { group: 'AB+', rh: 'positive', factor: 0.5, expiry: 22 },
  { group: 'O-', rh: 'negative', factor: 0.35, expiry: 10 },
  { group: 'A-', rh: 'negative', factor: 0.25, expiry: 12 },
  { group: 'B-', rh: 'negative', factor: 0.20, expiry: 9 },
  { group: 'AB-', rh: 'negative', factor: 0.15, expiry: 8 }
];

async function seedAllDistrictsInventory(clearExisting = true) {
  try {
    // 1. Fetch exact hospitals from Hospital collection (the ones displayed in Hospitals page)
    let hospitals = await Hospital.find({}).lean();
    if (!hospitals || hospitals.length === 0) {
      console.log('No hospitals found in DB. Seeding hospitals first...');
      const { autoSeedHospitals } = require('./seedHospitals');
      await autoSeedHospitals();
      hospitals = await Hospital.find({}).lean();
    }

    if (clearExisting) {
      await BloodInventory.deleteMany({});
    }

    const records = [];

    // For every hospital present in the Hospital page
    hospitals.forEach(hosp => {
      let base = 32;
      const d = hosp.district;
      if (['Colombo', 'Kandy', 'Galle', 'Kurunegala', 'Anuradhapura', 'Jaffna'].includes(d)) {
        base = 52;
      } else if (['Mannar', 'Mullaitivu', 'Kilinochchi', 'Nuwara Eliya'].includes(d)) {
        base = 18;
      } else if (['Gampaha', 'Kalutara', 'Badulla', 'Ratnapura', 'Matara', 'Batticaloa'].includes(d)) {
        base = 36;
      }

      BLOOD_GROUPS.forEach(bg => {
        const units = Math.max(3, Math.round(base * bg.factor));
        records.push({
          bloodGroup: bg.group,
          rhFactor: bg.rh,
          district: hosp.district,
          hospitalName: hosp.name,
          availableUnits: units,
          expiryDays: bg.expiry
        });
      });
    });

    const inserted = await BloodInventory.insertMany(records);
    console.log(`✅ Seeded ${inserted.length} blood inventory records for ${hospitals.length} hospitals from Hospital collection!`);
    return inserted;
  } catch (error) {
    console.error('Error seeding blood inventory:', error);
    throw error;
  }
}

// Allow direct execution: node server/seedBloodInventory.js
if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '.env') });
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lifeflow';
  mongoose.connect(uri)
    .then(async () => {
      console.log('Connected to MongoDB. Seeding blood inventory for all hospitals...');
      const res = await seedAllDistrictsInventory(true);
      console.log(`Successfully created ${res.length} inventory records in MongoDB!`);
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = {
  BLOOD_GROUPS,
  seedAllDistrictsInventory
};
