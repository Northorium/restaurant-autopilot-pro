const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// Get all orders
router.get('/', (req, res) => {
  try {
    const { status, date } = req.query;
    const data = db.readDB();
    let orders = data.orders;
    
    if (status) {
      orders = orders.filter(o => o.status === status);
    }
    
    if (date) {
      const searchDate = new Date(date).toISOString().split('T')[0];
      orders = orders.filter(o => {
        const orderDate = new Date(o.date).toISOString().split('T')[0];
        return orderDate === searchDate;
      });
    }
    
    // Sort by date (newest first)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single order
router.get('/:id', (req, res) => {
  try {
    const data = db.readDB();
    const order = data.orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new order
router.post('/', (req, res) => {
  try {
    const data = db.readDB();
    const orderNumber = `ORD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(data.orders.length + 1).padStart(3, '0')}`;
    
    const newOrder = {
      id: `order-${Date.now()}`,
      orderNumber,
      date: new Date().toISOString(),
      ...req.body
    };
    
    data.orders.push(newOrder);
    db.writeDB(data);
    
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order
router.put('/:id', (req, res) => {
  try {
    const data = db.readDB();
    const index = data.orders.findIndex(o => o.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    data.orders[index] = {
      ...data.orders[index],
      ...req.body
    };
    
    db.writeDB(data);
    res.json(data.orders[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sales stats
router.get('/stats/sales', (req, res) => {
  try {
    const data = db.readDB();
    res.json(data.sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
