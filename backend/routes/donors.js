const express = require('express');
const Donor = require('../models/Donor');
const BloodUnit = require('../models/BloodUnit');
const auth = require('../middleware/auth');
const router = express.Router();

// GET all donors (with search)
router.get('/', auth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = { $or: [{ name: new RegExp(search, 'i') }, { phone: new RegExp(search, 'i') }] };
    }
    const donors = await Donor.find(query).sort({ createdAt: -1 });
    res.json(donors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single donor with history
router.get('/:id', auth, async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) return res.status(404).json({ message: 'Donor not found' });
    const history = await BloodUnit.find({ donor: req.params.id }).sort({ collectedDate: -1 });
    res.json({ donor, history });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create donor
router.post('/', auth, async (req, res) => {
  try {
    const donor = new Donor(req.body);
    await donor.save();
    res.status(201).json(donor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update donor
router.put('/:id', auth, async (req, res) => {
  try {
    const donor = await Donor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!donor) return res.status(404).json({ message: 'Donor not found' });
    res.json(donor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE donor
router.delete('/:id', auth, async (req, res) => {
  try {
    await Donor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Donor deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
