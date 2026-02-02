const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// Get all menu categories
router.get('/categories', (req, res) => {
  try {
    const data = db.readDB();
    res.json(data.menu.categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all menu items
router.get('/items', (req, res) => {
  try {
    const { categoryId, available, popular } = req.query;
    const data = db.readDB();
    let items = data.menu.items;
    
    if (categoryId) {
      items = items.filter(item => item.categoryId === categoryId);
    }
    if (available !== undefined) {
      items = items.filter(item => item.available === (available === 'true'));
    }
    if (popular !== undefined) {
      items = items.filter(item => item.popular === (popular === 'true'));
    }
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single menu item
router.get('/items/:id', (req, res) => {
  try {
    const data = db.readDB();
    const item = data.menu.items.find(i => i.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update menu item
router.put('/items/:id', (req, res) => {
  try {
    const data = db.readDB();
    const itemIndex = data.menu.items.findIndex(i => i.id === req.params.id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    data.menu.items[itemIndex] = {
      ...data.menu.items[itemIndex],
      ...req.body
    };
    
    db.writeDB(data);
    res.json(data.menu.items[itemIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
