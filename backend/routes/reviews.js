const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// Get all reviews
router.get('/', (req, res) => {
  try {
    const { platform, responded, rating, sentiment } = req.query;
    
    const filters = {};
    if (platform) filters.platform = platform;
    if (responded !== undefined) filters.responded = responded === 'true';
    if (rating) filters.rating = rating;
    if (sentiment) filters.sentiment = sentiment;
    
    const reviews = db.getReviews(filters);
    const stats = db.calculateStats();
    
    res.json({
      reviews,
      total: reviews.length,
      stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single review
router.get('/:id', (req, res) => {
  try {
    const review = db.getReview(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Respond to review
router.post('/:id/respond', (req, res) => {
  try {
    const { response } = req.body;
    
    if (!response || !response.trim()) {
      return res.status(400).json({ error: 'Response text is required' });
    }
    
    const review = db.addReviewResponse(req.params.id, response);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete response
router.delete('/:id/respond', (req, res) => {
  try {
    const review = db.deleteReviewResponse(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
