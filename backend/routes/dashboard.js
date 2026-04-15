const express = require('express');
const BloodUnit = require('../models/BloodUnit');
const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalDonors,
      totalAvailableUnits,
      collectedToday,
      issuedToday,
      pendingRequests,
      inventorySummary
    ] = await Promise.all([
      Donor.countDocuments(),
      BloodUnit.aggregate([
        { $match: { status: 'available' } },
        { $group: { _id: null, total: { $sum: '$units' } } }
      ]),
      BloodUnit.countDocuments({ createdAt: { $gte: today } }),
      BloodUnit.countDocuments({ status: 'issued', updatedAt: { $gte: today } }),
      BloodRequest.countDocuments({ status: 'pending' }),
      BloodUnit.aggregate([
        { $match: { status: 'available' } },
        { $group: { _id: '$bloodGroup', total: { $sum: '$units' } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      totalDonors,
      totalAvailableUnits: totalAvailableUnits[0]?.total || 0,
      collectedToday,
      issuedToday,
      pendingRequests,
      inventorySummary
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reports: donations and issues by date range
router.get('/report', auth, async (req, res) => {
  try {
    const { from, to } = req.query;
    const start = new Date(from);
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);

    const [donations, issues] = await Promise.all([
      BloodUnit.find({ createdAt: { $gte: start, $lte: end } }).populate('donor', 'name bloodGroup'),
      BloodRequest.find({
        status: 'fulfilled',
        updatedAt: { $gte: start, $lte: end }
      }).populate('requestedBy', 'name')
    ]);

    res.json({ donations, issues });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
