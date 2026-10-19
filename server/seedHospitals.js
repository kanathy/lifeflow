/**
 * Seed Script — 25 Sri Lanka District Hospitals
 * Usage: node seedHospitals.js
 * Creates or updates one official government hospital per district in MongoDB.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Hospital = require('./models/Hospital');

const hospitalsData = [
  {
    hospitalId: 'HSP-AMP-01',
    name: 'Ampara District General Hospital',
    district: 'Ampara',
    type: 'Government',
    contact: '063 222 2261',
    email: 'dgh.ampara@health.gov.lk',
    address: 'Hospital Road, Ampara',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-ANU-01',
    name: 'Anuradhapura Teaching Hospital',
    district: 'Anuradhapura',
    type: 'Government',
    contact: '025 222 2261',
    email: 'th.anuradhapura@health.gov.lk',
    address: 'Maithripala Senanayake Mawatha, Anuradhapura',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-BAD-01',
    name: 'Badulla Provincial General Hospital',
    district: 'Badulla',
    type: 'Government',
    contact: '055 222 2261',
    email: 'pgh.badulla@health.gov.lk',
    address: 'Mahiyangana Road, Badulla',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-BAT-01',
    name: 'Batticaloa Teaching Hospital',
    district: 'Batticaloa',
    type: 'Government',
    contact: '065 222 2261',
    email: 'th.batticaloa@health.gov.lk',
    address: 'Hospital Road, Batticaloa',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-COL-01',
    name: 'National Hospital of Sri Lanka (Colombo)',
    district: 'Colombo',
    type: 'Government',
    contact: '011 269 1111',
    email: 'nhsl.bloodbank@health.gov.lk',
    address: 'Regent Street, Colombo 10',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-GAL-01',
    name: 'Karapitiya Teaching Hospital (Galle)',
    district: 'Galle',
    type: 'Government',
    contact: '091 223 2250',
    email: 'th.karapitiya@health.gov.lk',
    address: 'Labuduwa Road, Karapitiya, Galle',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-GAM-01',
    name: 'Gampaha District General Hospital',
    district: 'Gampaha',
    type: 'Government',
    contact: '033 222 2261',
    email: 'dgh.gampaha@health.gov.lk',
    address: 'Asgiriya, Gampaha',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-HAM-01',
    name: 'Hambantota District General Hospital',
    district: 'Hambantota',
    type: 'Government',
    contact: '047 222 0261',
    email: 'dgh.hambantota@health.gov.lk',
    address: 'Mirijjawila, Hambantota',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-JAF-01',
    name: 'Jaffna Teaching Hospital',
    district: 'Jaffna',
    type: 'Government',
    contact: '021 222 2261',
    email: 'th.jaffna@health.gov.lk',
    address: 'Hospital Road, Jaffna',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-KAL-01',
    name: 'Nagoda General Hospital (Kalutara)',
    district: 'Kalutara',
    type: 'Government',
    contact: '034 222 2261',
    email: 'gh.nagoda@health.gov.lk',
    address: 'Nagoda, Kalutara',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-KAN-01',
    name: 'Kandy National Hospital',
    district: 'Kandy',
    type: 'Government',
    contact: '081 222 2261',
    email: 'nh.kandy@health.gov.lk',
    address: 'William Gopallawa Mawatha, Kandy',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-KEG-01',
    name: 'Kegalle District General Hospital',
    district: 'Kegalle',
    type: 'Government',
    contact: '035 222 2261',
    email: 'dgh.kegalle@health.gov.lk',
    address: 'Kandy Road, Kegalle',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-KIL-01',
    name: 'Kilinochchi District General Hospital',
    district: 'Kilinochchi',
    type: 'Government',
    contact: '021 228 5328',
    email: 'dgh.kilinochchi@health.gov.lk',
    address: 'A9 Road, Kilinochchi',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-KUR-01',
    name: 'Kurunegala Teaching Hospital',
    district: 'Kurunegala',
    type: 'Government',
    contact: '037 222 2261',
    email: 'th.kurunegala@health.gov.lk',
    address: 'Circular Road, Kurunegala',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-MAN-01',
    name: 'Mannar District General Hospital',
    district: 'Mannar',
    type: 'Government',
    contact: '023 222 2261',
    email: 'dgh.mannar@health.gov.lk',
    address: 'Hospital Road, Mannar',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-MTL-01',
    name: 'Matale District General Hospital',
    district: 'Matale',
    type: 'Government',
    contact: '066 222 2261',
    email: 'dgh.matale@health.gov.lk',
    address: 'Trincomalee Street, Matale',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-MTR-01',
    name: 'Matara District General Hospital',
    district: 'Matara',
    type: 'Government',
    contact: '041 222 2261',
    email: 'dgh.matara@health.gov.lk',
    address: 'Nupe, Matara',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-MON-01',
    name: 'Monaragala District General Hospital',
    district: 'Monaragala',
    type: 'Government',
    contact: '055 227 6261',
    email: 'dgh.monaragala@health.gov.lk',
    address: 'Sirigala, Monaragala',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-MUL-01',
    name: 'Mullaitivu District General Hospital',
    district: 'Mullaitivu',
    type: 'Government',
    contact: '021 229 0024',
    email: 'dgh.mullaitivu@health.gov.lk',
    address: 'Mankulam Road, Mullaitivu',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-NUW-01',
    name: 'Nuwara Eliya District General Hospital',
    district: 'Nuwara Eliya',
    type: 'Government',
    contact: '052 222 2261',
    email: 'dgh.nuwaraeliya@health.gov.lk',
    address: 'Hospital Road, Nuwara Eliya',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-POL-01',
    name: 'Polonnaruwa District General Hospital',
    district: 'Polonnaruwa',
    type: 'Government',
    contact: '027 222 2261',
    email: 'dgh.polonnaruwa@health.gov.lk',
    address: 'Hospital Junction, Polonnaruwa',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-PUT-01',
    name: 'Base Hospital Puttalam',
    district: 'Puttalam',
    type: 'Government',
    contact: '032 226 5261',
    email: 'bh.puttalam@health.gov.lk',
    address: 'Kurunegala Road, Puttalam',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-RAT-01',
    name: 'Ratnapura Teaching Hospital',
    district: 'Ratnapura',
    type: 'Government',
    contact: '045 222 2261',
    email: 'th.ratnapura@health.gov.lk',
    address: 'Colombo Road, Ratnapura',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-TRI-01',
    name: 'Trincomalee District General Hospital',
    district: 'Trincomalee',
    type: 'Government',
    contact: '026 222 2261',
    email: 'dgh.trincomalee@health.gov.lk',
    address: 'Dockyard Road, Trincomalee',
    status: 'Active'
  },
  {
    hospitalId: 'HSP-VAV-01',
    name: 'Vavuniya District General Hospital',
    district: 'Vavuniya',
    type: 'Government',
    contact: '024 222 2261',
    email: 'dgh.vavuniya@health.gov.lk',
    address: 'Inner Circular Road, Vavuniya',
    status: 'Active'
  }
];

async function autoSeedHospitals() {
  try {
    let insertedCount = 0;
    let updatedCount = 0;

    for (const h of hospitalsData) {
      const existing = await Hospital.findOne({
        $or: [
          { hospitalId: h.hospitalId },
          { name: h.name, district: h.district },
          { district: h.district }
        ]
      });

      if (existing) {
        await Hospital.findByIdAndUpdate(existing._id, {
          hospitalId: existing.hospitalId || h.hospitalId,
          name: existing.name || h.name,
          district: h.district,
          type: existing.type || h.type,
          contact: existing.contact || h.contact,
          email: existing.email || h.email,
          address: existing.address || h.address,
          status: 'Active'
        });
        updatedCount++;
      } else {
        await Hospital.create(h);
        insertedCount++;
      }
    }

    const totalCount = await Hospital.countDocuments();
    console.log(`\x1b[32m%s\x1b[0m`, `🏥 Hospital DB Sync: ${insertedCount} inserted, ${updatedCount} synced. Total hospitals: ${totalCount}`);
    return { insertedCount, updatedCount, totalCount };
  } catch (error) {
    console.error('Error during auto hospital sync:', error);
  }
}

async function seedHospitals() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lifeflow';
  console.log(`Connecting to MongoDB at: ${uri}`);

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully.');
    await autoSeedHospitals();
  } catch (error) {
    console.error('Error during hospital seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

if (require.main === module) {
  seedHospitals();
}

module.exports = {
  hospitalsData,
  autoSeedHospitals,
  seedHospitals
};
