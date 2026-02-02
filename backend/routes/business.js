const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// Get business info
router.get('/', (req, res) => {
  try {
    const business = db.getBusiness();
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json(business);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update business info
router.put('/', (req, res) => {
  try {
    const updates = req.body;
    const updatedBusiness = db.updateBusiness(updates);
    if (!updatedBusiness) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json(updatedBusiness);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Google Business Profile status
router.get('/google/status', (req, res) => {
  try {
    const business = db.getBusiness();
    res.json({
      connected: business?.googleConnected || false,
      accountName: business?.name || '',
      lastSync: business?.lastSync || new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Meta Business status
router.get('/meta/status', (req, res) => {
  try {
    const business = db.getBusiness();
    res.json({
      connected: business?.metaConnected || false,
      pageName: business?.name || '',
      lastSync: business?.lastSync || new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
