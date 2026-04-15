const express = require('express');
const BloodUnit = require('../models/BloodUnit');
const Donor = require('../models/Donor');
const auth = require('../middleware/auth');
const router = express.Router();

// GET all blood units
router.get('/', auth, async (req, res) => {
  try {
    const units = await BloodUnit.find().populate('donor', 'name phone bloodGroup').sort({ createdAt: -1 });
    res.json(units);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET inventory summary by blood group
router.get('/inventory-summary', auth, async (req, res) => {
  try {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const summary = {};
    for (const bg of bloodGroups) {
      const result = await BloodUnit.aggregate([
        { $match: { bloodGroup: bg, status: 'available' } },
        { $group: { _id: null, total: { $sum: '$units' } } }
      ]);
      summary[bg] = result[0]?.total || 0;
    }
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add blood unit (record donation)
router.post('/', auth, async (req, res) => {
  try {
    const unit = new BloodUnit({ ...req.body, collectedBy: req.user.id });
    await unit.save();
    await Donor.findByIdAndUpdate(req.body.donor, { $push: { donationHistory: unit._id } });
    res.status(201).json(unit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH discard a unit
router.patch('/:id/discard', auth, async (req, res) => {
  try {
    const unit = await BloodUnit.findByIdAndUpdate(
      req.params.id,
      { status: 'discarded', discardReason: req.body.reason },
      { new: true }
    );
    if (!unit) return res.status(404).json({ message: 'Blood unit not found' });
    res.json(unit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
