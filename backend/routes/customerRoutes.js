const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');

// Create a new customer (Registration)
router.post('/', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    
    // Remove password from response
    const customerResponse = customer.toObject();
    delete customerResponse.password;
    
    res.status(201).json(customerResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Customer login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const token = jwt.sign(
      { id: customer._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );
    
    res.json({ token, customerId: customer._id, name: customer.name });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().select('-password');
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select('-password');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a customer
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Don't allow password update through this route
    if (req.body.password) {
      delete req.body.password;
    }

    Object.assign(customer, req.body);
    await customer.save();

    const customerResponse = customer.toObject();
    delete customerResponse.password;

    res.json(customerResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
