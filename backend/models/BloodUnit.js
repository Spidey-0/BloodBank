const mongoose = require('mongoose');

const bloodUnitSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
  units: { type: Number, required: true, default: 1 },
  collectedDate: { type: Date, default: Date.now },
  expiryDate: {
    type: Date,
    default: function () {
      return new Date(Date.now() + 35 * 24 * 60 * 60 * 1000); // 35 days
    }
  },
  status: { type: String, enum: ['available', 'issued', 'discarded', 'expired'], default: 'available' },
  discardReason: { type: String },
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('BloodUnit', bloodUnitSchema);
