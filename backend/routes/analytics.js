const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// Get analytics overview
router.get('/overview', (req, res) => {
  try {
    const analytics = db.getAnalytics();
    
    if (!analytics) {
      return res.status(404).json({ error: 'Analytics data not found' });
    }
    
    const { overview, sentiment } = analytics;
    
    res.json({
      period: req.query.period || '30d',
      reviews: {
        total: overview.totalReviews,
        new: overview.newReviewsLast30Days,
        trend: `+${Math.round((overview.newReviewsLast30Days / overview.totalReviews) * 100)}%`
      },
      rating: {
        average: overview.averageRating,
        previous: overview.previousAverageRating,
        trend: `+${(((overview.averageRating - overview.previousAverageRating) / overview.previousAverageRating) * 100).toFixed(1)}%`
      },
      responses: {
        rate: overview.responseRate,
        previous: overview.previousResponseRate,
        trend: `+${(overview.responseRate - overview.previousResponseRate).toFixed(1)}%`,
        averageTime: overview.averageResponseTime
      },
      sentiment: {
        positive: sentiment.positive,
        neutral: sentiment.neutral,
        negative: sentiment.negative
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get rating distribution
router.get('/ratings', (req, res) => {
  try {
    const analytics = db.getAnalytics();
    
    if (!analytics) {
      return res.status(404).json({ error: 'Analytics data not found' });
    }
    
    res.json({
      distribution: analytics.ratingDistribution
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get review trends
router.get('/trends', (req, res) => {
  try {
    // Generate 30 days of trend data
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        reviews: Math.floor(Math.random() * 5) + 1,
        rating: 4 + Math.random()
      };
    });
    
    res.json({
      daily: last30Days,
      summary: {
        totalReviews: last30Days.reduce((sum, d) => sum + d.reviews, 0),
        averageRating: 4.6,
        responseRate: 92
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get platform stats
router.get('/platforms', (req, res) => {
  try {
    const analytics = db.getAnalytics();
    
    if (!analytics) {
      return res.status(404).json({ error: 'Analytics data not found' });
    }
    
    const platforms = analytics.platforms.map(p => ({
      ...p,
      trend: `+${Math.round((p.newReviews / p.reviews) * 100)}%`
    }));
    
    res.json({ platforms });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top keywords
router.get('/keywords', (req, res) => {
  try {
    const analytics = db.getAnalytics();
    
    if (!analytics) {
      return res.status(404).json({ error: 'Analytics data not found' });
    }
    
    res.json({
      keywords: analytics.topKeywords
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
