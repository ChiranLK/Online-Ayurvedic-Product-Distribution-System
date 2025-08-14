const express = require('express');
const router = express.Router();
const Seller = require('../models/Seller');

// Create a new seller
router.post('/', async (req, res) => {
  try {
    const seller = new Seller(req.body);
    await seller.save();
    res.status(201).json(seller);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all sellers
router.get('/', async (req, res) => {
  try {
    const sellers = await Seller.find();
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific seller
router.get('/:id', async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a seller
router.put('/:id', async (req, res) => {
  try {
    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    res.json(seller);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a seller
router.delete('/:id', async (req, res) => {
  try {
    const seller = await Seller.findByIdAndDelete(req.params.id);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    res.json({ message: 'Seller deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
