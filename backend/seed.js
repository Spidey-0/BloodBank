require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Models ──────────────────────────────────────────────────────────────────
const User = require('./models/User');
const Donor = require('./models/Donor');
const BloodUnit = require('./models/BloodUnit');
const BloodRequest = require('./models/BloodRequest');

// ── Helpers ──────────────────────────────────────────────────────────────────
const daysAgo  = d => new Date(Date.now() - d * 86400000);
const daysFrom = d => new Date(Date.now() + d * 86400000);

// ── Sample Data ───────────────────────────────────────────────────────────────
const USERS = [
  { name: 'Dr. Harpreet Singh',   username: 'admin',      password: 'admin123',  role: 'admin'          },
  { name: 'Gurpreet Kaur',        username: 'gurpreet',   password: 'staff123',  role: 'receptionist'   },
  { name: 'Mandeep Singh',        username: 'mandeep',    password: 'staff123',  role: 'receptionist'   },
  { name: 'Amandeep Sharma',      username: 'amandeep',   password: 'staff123',  role: 'lab_technician' },
  { name: 'Rajwinder Kaur',       username: 'rajwinder',  password: 'staff123',  role: 'lab_technician' },
];

const DONORS = [
  // Amritsar donors
  { name: 'Gurjot Singh Sandhu',    age: 28, gender: 'Male',   bloodGroup: 'B+',  phone: '9876501001', address: 'Sultanwind Road, Amritsar' },
  { name: 'Parminder Kaur',         age: 34, gender: 'Female', bloodGroup: 'A+',  phone: '9876501002', address: 'Lawrence Road, Amritsar' },
  { name: 'Harjinder Singh Bhatia', age: 42, gender: 'Male',   bloodGroup: 'O+',  phone: '9876501003', address: 'Ranjit Avenue, Amritsar' },
  { name: 'Navneet Kaur Gill',      age: 25, gender: 'Female', bloodGroup: 'AB+', phone: '9876501004', address: 'Majitha Road, Amritsar' },
  { name: 'Sukhwinder Singh',       age: 37, gender: 'Male',   bloodGroup: 'O-',  phone: '9876501005', address: 'Putlighar, Amritsar' },
  // Ludhiana donors
  { name: 'Amarjit Singh Dhaliwal', age: 31, gender: 'Male',   bloodGroup: 'A+',  phone: '9876501006', address: 'Sarabha Nagar, Ludhiana' },
  { name: 'Simranpreet Kaur',       age: 27, gender: 'Female', bloodGroup: 'B-',  phone: '9876501007', address: 'BRS Nagar, Ludhiana' },
  { name: 'Kulwant Singh Virk',     age: 45, gender: 'Male',   bloodGroup: 'O+',  phone: '9876501008', address: 'Model Town, Ludhiana' },
  { name: 'Daljeet Kaur Brar',      age: 29, gender: 'Female', bloodGroup: 'A-',  phone: '9876501009', address: 'Dugri, Ludhiana' },
  { name: 'Manjinder Singh',        age: 33, gender: 'Male',   bloodGroup: 'AB-', phone: '9876501010', address: 'Pakhowal Road, Ludhiana' },
  // Jalandhar donors
  { name: 'Balwinder Singh Sohal',  age: 39, gender: 'Male',   bloodGroup: 'B+',  phone: '9876501011', address: 'Model Town, Jalandhar' },
  { name: 'Hardeep Kaur Randhawa',  age: 26, gender: 'Female', bloodGroup: 'O+',  phone: '9876501012', address: 'Basti Sheikh, Jalandhar' },
  { name: 'Satnam Singh Grewal',    age: 52, gender: 'Male',   bloodGroup: 'A+',  phone: '9876501013', address: 'Lajpat Nagar, Jalandhar' },
  { name: 'Rupinder Kaur Sidhu',    age: 23, gender: 'Female', bloodGroup: 'AB+', phone: '9876501014', address: 'Guru Nanak Pura, Jalandhar' },
  // Patiala donors
  { name: 'Raghbir Singh Bhullar',  age: 48, gender: 'Male',   bloodGroup: 'O+',  phone: '9876501015', address: 'Leela Bhawan, Patiala' },
  { name: 'Kiran Deep Kaur',        age: 30, gender: 'Female', bloodGroup: 'B+',  phone: '9876501016', address: 'Rajpura Road, Patiala' },
  { name: 'Gursewak Singh Mann',    age: 35, gender: 'Male',   bloodGroup: 'A-',  phone: '9876501017', address: 'Tripuri, Patiala' },
  // Mohali donors
  { name: 'Tejinder Pal Singh',     age: 32, gender: 'Male',   bloodGroup: 'O+',  phone: '9876501018', address: 'Phase 7, Mohali' },
  { name: 'Prabhleen Kaur Arora',   age: 24, gender: 'Female', bloodGroup: 'A+',  phone: '9876501019', address: 'Sector 71, Mohali' },
  { name: 'Lakhwinder Singh',       age: 41, gender: 'Male',   bloodGroup: 'B+',  phone: '9876501020', address: 'Phase 3B2, Mohali' },
];

// ── Main Seed Function ────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Donor.deleteMany({}),
    BloodUnit.deleteMany({}),
    BloodRequest.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // ── 1. Create Users ────────────────────────────────────────────────────────
  const savedUsers = [];
  for (const u of USERS) {
    const user = new User(u);
    await user.save();
    savedUsers.push(user);
  }
  const [admin, receptionist1, , labTech1] = savedUsers;
  console.log(`👤 Created ${savedUsers.length} staff accounts`);

  // ── 2. Create Donors ───────────────────────────────────────────────────────
  const savedDonors = await Donor.insertMany(DONORS);
  console.log(`🧑‍🤝‍🧑 Created ${savedDonors.length} donors`);

  // ── 3. Create Blood Units ──────────────────────────────────────────────────
  // Available units (recent donations, different blood groups)
  const bloodUnitsData = [
    // Available — healthy stock
    { donor: savedDonors[0]._id,  bloodGroup: 'B+',  units: 1, status: 'available', collectedDate: daysAgo(5),  expiryDate: daysFrom(30) },
    { donor: savedDonors[1]._id,  bloodGroup: 'A+',  units: 1, status: 'available', collectedDate: daysAgo(3),  expiryDate: daysFrom(32) },
    { donor: savedDonors[2]._id,  bloodGroup: 'O+',  units: 1, status: 'available', collectedDate: daysAgo(7),  expiryDate: daysFrom(28) },
    { donor: savedDonors[3]._id,  bloodGroup: 'AB+', units: 1, status: 'available', collectedDate: daysAgo(2),  expiryDate: daysFrom(33) },
    { donor: savedDonors[5]._id,  bloodGroup: 'A+',  units: 1, status: 'available', collectedDate: daysAgo(10), expiryDate: daysFrom(25) },
    { donor: savedDonors[7]._id,  bloodGroup: 'O+',  units: 1, status: 'available', collectedDate: daysAgo(4),  expiryDate: daysFrom(31) },
    { donor: savedDonors[10]._id, bloodGroup: 'B+',  units: 1, status: 'available', collectedDate: daysAgo(6),  expiryDate: daysFrom(29) },
    { donor: savedDonors[11]._id, bloodGroup: 'O+',  units: 1, status: 'available', collectedDate: daysAgo(1),  expiryDate: daysFrom(34) },
    { donor: savedDonors[12]._id, bloodGroup: 'A+',  units: 1, status: 'available', collectedDate: daysAgo(8),  expiryDate: daysFrom(27) },
    { donor: savedDonors[15]._id, bloodGroup: 'B+',  units: 1, status: 'available', collectedDate: daysAgo(3),  expiryDate: daysFrom(32) },
    { donor: savedDonors[17]._id, bloodGroup: 'O+',  units: 1, status: 'available', collectedDate: daysAgo(2),  expiryDate: daysFrom(33) },
    { donor: savedDonors[18]._id, bloodGroup: 'A+',  units: 1, status: 'available', collectedDate: daysAgo(5),  expiryDate: daysFrom(30) },
    { donor: savedDonors[19]._id, bloodGroup: 'B+',  units: 1, status: 'available', collectedDate: daysAgo(9),  expiryDate: daysFrom(26) },
    // Low / critical stock — O- and AB-
    { donor: savedDonors[4]._id,  bloodGroup: 'O-',  units: 1, status: 'available', collectedDate: daysAgo(20), expiryDate: daysFrom(15) },
    { donor: savedDonors[9]._id,  bloodGroup: 'AB-', units: 1, status: 'available', collectedDate: daysAgo(15), expiryDate: daysFrom(20) },
    { donor: savedDonors[6]._id,  bloodGroup: 'B-',  units: 1, status: 'available', collectedDate: daysAgo(12), expiryDate: daysFrom(23) },
    // Already issued
    { donor: savedDonors[13]._id, bloodGroup: 'AB+', units: 1, status: 'issued',    collectedDate: daysAgo(20), expiryDate: daysFrom(15) },
    { donor: savedDonors[16]._id, bloodGroup: 'A-',  units: 1, status: 'issued',    collectedDate: daysAgo(25), expiryDate: daysFrom(10) },
    // Discarded
    { donor: savedDonors[8]._id,  bloodGroup: 'A-',  units: 1, status: 'discarded', discardReason: 'Failed TTI screening test', collectedDate: daysAgo(30), expiryDate: daysAgo(0) },
    { donor: savedDonors[14]._id, bloodGroup: 'O+',  units: 1, status: 'discarded', discardReason: 'Bag damaged during storage', collectedDate: daysAgo(40), expiryDate: daysAgo(5) },
  ];

  const savedUnits = [];
  for (const u of bloodUnitsData) {
    const unit = new BloodUnit({ ...u, collectedBy: labTech1._id });
    await unit.save();
    // Link to donor history
    await Donor.findByIdAndUpdate(u.donor, { $push: { donationHistory: unit._id } });
    savedUnits.push(unit);
  }
  console.log(`🩸 Created ${savedUnits.length} blood units`);

  // ── 4. Create Blood Requests ───────────────────────────────────────────────
  const requestsData = [
    // Pending requests
    {
      patientName: 'Jaswant Singh', patientAge: 58,
      bloodGroup: 'B+', unitsRequired: 2, hospital: 'DMCH Ludhiana',
      urgency: 'Emergency', status: 'pending',
      requestedBy: receptionist1._id,
    },
    {
      patientName: 'Gurleen Kaur', patientAge: 32,
      bloodGroup: 'A+', unitsRequired: 1, hospital: 'Fortis Mohali',
      urgency: 'Urgent', status: 'pending',
      requestedBy: receptionist1._id,
    },
    {
      patientName: 'Ramesh Kumar', patientAge: 45,
      bloodGroup: 'O+', unitsRequired: 1, hospital: 'Civil Hospital Amritsar',
      urgency: 'Routine', status: 'pending',
      requestedBy: receptionist1._id,
    },
    {
      patientName: 'Harjot Kaur', patientAge: 27,
      bloodGroup: 'O-', unitsRequired: 1, hospital: 'PGIMER Chandigarh',
      urgency: 'Emergency', status: 'pending',
      requestedBy: receptionist1._id,
    },
    // Fulfilled requests
    {
      patientName: 'Sukhdev Singh', patientAge: 63,
      bloodGroup: 'AB+', unitsRequired: 1, hospital: 'Amandeep Hospital Amritsar',
      urgency: 'Urgent', status: 'fulfilled',
      requestedBy: receptionist1._id,
      fulfilledBy: labTech1._id,
      bloodUnitsIssued: [savedUnits[16]._id],
    },
    {
      patientName: 'Manpreet Kaur', patientAge: 35,
      bloodGroup: 'A-', unitsRequired: 1, hospital: 'Max Hospital Mohali',
      urgency: 'Routine', status: 'fulfilled',
      requestedBy: receptionist1._id,
      fulfilledBy: labTech1._id,
      bloodUnitsIssued: [savedUnits[17]._id],
    },
    // Rejected request
    {
      patientName: 'Bikram Singh', patientAge: 71,
      bloodGroup: 'AB-', unitsRequired: 3, hospital: 'Rajindra Hospital Patiala',
      urgency: 'Urgent', status: 'rejected',
      requestedBy: receptionist1._id,
      fulfilledBy: admin._id,
      notes: 'Insufficient AB- stock. Patient referred to higher centre.',
    },
  ];

  await BloodRequest.insertMany(requestsData);
  console.log(`📋 Created ${requestsData.length} blood requests`);

  console.log('\n✅ ─────────────────────────────────────────────────');
  console.log('   Sample data seeded successfully!');
  console.log('─────────────────────────────────────────────────────');
  console.log('   Login credentials:');
  console.log('   Admin         → admin / admin123');
  console.log('   Receptionist  → gurpreet / staff123');
  console.log('   Lab Technician→ amandeep / staff123');
  console.log('─────────────────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
