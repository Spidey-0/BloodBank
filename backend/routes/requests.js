const express = require('express');
const BloodRequest = require('../models/BloodRequest');
const BloodUnit = require('../models/BloodUnit');
const auth = require('../middleware/auth');
const router = express.Router();

// GET all requests
router.get('/', auth, async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .populate('requestedBy', 'name')
      .populate('fulfilledBy', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create request
router.post('/', auth, async (req, res) => {
  try {
    const request = new BloodRequest({ ...req.body, requestedBy: req.user.id });
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH fulfill a request
router.patch('/:id/fulfill', auth, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    // Find available units of required blood group
    const available = await BloodUnit.find({
      bloodGroup: request.bloodGroup,
      status: 'available'
    }).limit(request.unitsRequired);

    const totalAvailable = available.reduce((sum, u) => sum + u.units, 0);
    if (totalAvailable < request.unitsRequired) {
      return res.status(400).json({ message: `Insufficient stock. Available: ${totalAvailable} units` });
    }

    // Mark units as issued
    const unitIds = available.map(u => u._id);
    await BloodUnit.updateMany({ _id: { $in: unitIds } }, { status: 'issued' });

    request.status = 'fulfilled';
    request.fulfilledBy = req.user.id;
    request.bloodUnitsIssued = unitIds;
    await request.save();

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH reject a request
router.patch('/:id/reject', auth, async (req, res) => {
  try {
    const request = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', notes: req.body.reason, fulfilledBy: req.user.id },
      { new: true }
    );
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
