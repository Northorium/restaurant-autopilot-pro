const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// Get all customers
router.get('/', (req, res) => {
  try {
    const { vip, sortBy } = req.query;
    const data = db.readDB();
    let customers = data.customers;
    
    if (vip !== undefined) {
      customers = customers.filter(c => c.vip === (vip === 'true'));
    }
    
    // Sort
    if (sortBy === 'spending') {
      customers.sort((a, b) => b.totalSpent - a.totalSpent);
    } else if (sortBy === 'visits') {
      customers.sort((a, b) => b.totalVisits - a.totalVisits);
    } else if (sortBy === 'recent') {
      customers.sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));
    }
    
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single customer
router.get('/:id', (req, res) => {
  try {
    const data = db.readDB();
    const customer = data.customers.find(c => c.id === req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Get customer's orders
    const orders = data.orders.filter(o => o.customerId === req.params.id);
    
    res.json({
      ...customer,
      orders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create customer
router.post('/', (req, res) => {
  try {
    const data = db.readDB();
    const newCustomer = {
      id: `cust-${Date.now()}`,
      ...req.body,
      totalVisits: 0,
      totalSpent: 0,
      averageSpending: 0,
      vip: false,
      createdAt: new Date().toISOString()
    };
    
    data.customers.push(newCustomer);
    db.writeDB(data);
    
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update customer
router.put('/:id', (req, res) => {
  try {
    const data = db.readDB();
    const index = data.customers.findIndex(c => c.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    data.customers[index] = {
      ...data.customers[index],
      ...req.body
    };
    
    db.writeDB(data);
    res.json(data.customers[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
