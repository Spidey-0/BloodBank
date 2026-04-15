const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  patientAge: { type: Number },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
  unitsRequired: { type: Number, required: true },
  hospital: { type: String },
  urgency: { type: String, enum: ['Routine', 'Urgent', 'Emergency'], default: 'Routine' },
  status: { type: String, enum: ['pending', 'fulfilled', 'rejected'], default: 'pending' },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fulfilledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bloodUnitsIssued: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BloodUnit' }],
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
