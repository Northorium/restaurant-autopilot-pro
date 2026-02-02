const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/database.json');

// Read database
function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return null;
  }
}

// Write database
function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
}

// Get business
function getBusiness() {
  const db = readDB();
  return db?.business || null;
}

// Update business
function updateBusiness(updates) {
  const db = readDB();
  if (!db) return null;
  
  db.business = { ...db.business, ...updates };
  writeDB(db);
  return db.business;
}

// Get all reviews
function getReviews(filters = {}) {
  const db = readDB();
  if (!db) return [];
  
  let reviews = db.reviews || [];
  
  // Apply filters
  if (filters.platform) {
    reviews = reviews.filter(r => r.platform === filters.platform);
  }
  
  if (filters.responded !== undefined) {
    reviews = reviews.filter(r => r.responded === filters.responded);
  }
  
  if (filters.rating) {
    reviews = reviews.filter(r => r.rating === parseInt(filters.rating));
  }
  
  if (filters.sentiment) {
    reviews = reviews.filter(r => r.sentiment === filters.sentiment);
  }
  
  // Sort by date (newest first)
  reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return reviews;
}

// Get single review
function getReview(id) {
  const db = readDB();
  if (!db) return null;
  
  return db.reviews.find(r => r.id === id) || null;
}

// Add review response
function addReviewResponse(id, response, responseBy = 'owner') {
  const db = readDB();
  if (!db) return null;
  
  const review = db.reviews.find(r => r.id === id);
  if (!review) return null;
  
  review.responded = true;
  review.response = response;
  review.responseDate = new Date().toISOString();
  review.responseBy = responseBy;
  
  writeDB(db);
  return review;
}

// Delete review response
function deleteReviewResponse(id) {
  const db = readDB();
  if (!db) return null;
  
  const review = db.reviews.find(r => r.id === id);
  if (!review) return null;
  
  review.responded = false;
  delete review.response;
  delete review.responseDate;
  delete review.responseBy;
  
  writeDB(db);
  return review;
}

// Get analytics
function getAnalytics() {
  const db = readDB();
  return db?.analytics || null;
}

// Get user by email
function getUserByEmail(email) {
  const db = readDB();
  if (!db) return null;
  
  return db.users.find(u => u.email === email) || null;
}

// Calculate stats
function calculateStats() {
  const db = readDB();
  if (!db) return null;
  
  const reviews = db.reviews;
  const total = reviews.length;
  const responded = reviews.filter(r => r.responded).length;
  const pending = total - responded;
  
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / total;
  
  return {
    total,
    responded,
    pending,
    averageRating: avgRating.toFixed(1),
    responseRate: Math.round((responded / total) * 100)
  };
}

module.exports = {
  readDB,
  writeDB,
  getBusiness,
  updateBusiness,
  getReviews,
  getReview,
  addReviewResponse,
  deleteReviewResponse,
  getAnalytics,
  getUserByEmail,
  calculateStats
};
