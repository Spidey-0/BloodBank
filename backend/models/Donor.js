const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
  phone: { type: String, required: true, unique: true },
  address: { type: String },
  donationHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BloodUnit' }]
}, { timestamps: true });

module.exports = mongoose.model('Donor', donorSchema);
