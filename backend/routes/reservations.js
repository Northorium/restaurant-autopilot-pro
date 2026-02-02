const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// Get all reservations
router.get('/', (req, res) => {
  try {
    const { status, date } = req.query;
    const data = db.readDB();
    let reservations = data.reservations;
    
    if (status) {
      reservations = reservations.filter(r => r.status === status);
    }
    
    if (date) {
      const searchDate = new Date(date).toISOString().split('T')[0];
      reservations = reservations.filter(r => {
        const resDate = new Date(r.date).toISOString().split('T')[0];
        return resDate === searchDate;
      });
    }
    
    // Sort by date
    reservations.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single reservation
router.get('/:id', (req, res) => {
  try {
    const data = db.readDB();
    const reservation = data.reservations.find(r => r.id === req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new reservation
router.post('/', (req, res) => {
  try {
    const data = db.readDB();
    const newReservation = {
      id: `res-${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    data.reservations.push(newReservation);
    db.writeDB(data);
    
    res.status(201).json(newReservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update reservation
router.put('/:id', (req, res) => {
  try {
    const data = db.readDB();
    const index = data.reservations.findIndex(r => r.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    data.reservations[index] = {
      ...data.reservations[index],
      ...req.body
    };
    
    db.writeDB(data);
    res.json(data.reservations[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete reservation
router.delete('/:id', (req, res) => {
  try {
    const data = db.readDB();
    const index = data.reservations.findIndex(r => r.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    data.reservations.splice(index, 1);
    db.writeDB(data);
    
    res.json({ message: 'Reservation deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
