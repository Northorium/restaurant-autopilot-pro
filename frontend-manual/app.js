// API Configuration
const API_URL = 'http://localhost:3001/api';
let authToken = localStorage.getItem('authToken');

// Check authentication on load
if (authToken) {
    verifyToken();
} else {
    showScreen('login');
}

// Login Form Handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(data.user));
            showScreen('dashboard');
            loadPage('overview');
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Connection error. Make sure the backend is running on port 3001.');
    }
});

// Verify Token
async function verifyToken() {
    try {
        const response = await fetch(`${API_URL}/auth/verify`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            showScreen('dashboard');
            loadPage('overview');
        } else {
            localStorage.removeItem('authToken');
            showScreen('login');
        }
    } catch (error) {
        showScreen('login');
    }
}

// Logout Handler
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    authToken = null;
    showScreen('login');
});

// Screen Management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`${screenId}-screen`).classList.add('active');
}

// Menu Navigation
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
        const page = item.getAttribute('data-page');
        document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
        item.classList.add('active');
        loadPage(page);
    });
});

// Load Page Content
async function loadPage(page) {
    const titles = {
        'overview': 'Dashboard Overview',
        'reviews': 'Reviews Management',
        'analytics': 'Analytics & Insights',
        'ai': 'AI Assistant',
        'business': 'Business Profile'
    };
    
    document.getElementById('page-title').textContent = titles[page] || 'Dashboard';
    
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading...</p></div>';
    
    try {
        switch(page) {
            case 'overview':
                await loadOverview();
                break;
            case 'reviews':
                await loadReviews();
                break;
            case 'analytics':
                await loadAnalytics();
                break;
            case 'ai':
                await loadAI();
                break;
            case 'business':
                await loadBusiness();
                break;
        }
    } catch (error) {
        contentArea.innerHTML = `<div class="loading"><p>Error loading content: ${error.message}</p></div>`;
    }
}

// Load Overview Page
async function loadOverview() {
    const [analytics, reviews] = await Promise.all([
        apiGet('/analytics/overview'),
        apiGet('/reviews')
    ]);
    
    const content = document.getElementById('content-area');
    content.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon purple">
                        <span class="material-icons">rate_review</span>
                    </div>
                </div>
                <div class="stat-value">${analytics.reviews.total}</div>
                <div class="stat-label">Total Reviews</div>
                <div class="stat-trend positive">
                    <span class="material-icons">trending_up</span>
                    ${analytics.reviews.trend}
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon teal">
                        <span class="material-icons">star</span>
                    </div>
                </div>
                <div class="stat-value">${analytics.rating.average}</div>
                <div class="stat-label">Average Rating</div>
                <div class="stat-trend positive">
                    <span class="material-icons">trending_up</span>
                    ${analytics.rating.trend}
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon green">
                        <span class="material-icons">check_circle</span>
                    </div>
                </div>
                <div class="stat-value">${analytics.responses.rate}%</div>
                <div class="stat-label">Response Rate</div>
                <div class="stat-trend positive">
                    <span class="material-icons">trending_up</span>
                    ${analytics.responses.trend}
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon orange">
                        <span class="material-icons">sentiment_satisfied</span>
                    </div>
                </div>
                <div class="stat-value">${analytics.sentiment.positive}%</div>
                <div class="stat-label">Positive Sentiment</div>
                <div class="stat-trend positive">
                    <span class="material-icons">trending_up</span>
                    Excellent
                </div>
            </div>
        </div>
        
        <div class="content-card">
            <h2>Recent Reviews</h2>
            ${reviews.reviews.slice(0, 3).map(review => renderReview(review)).join('')}
        </div>
    `;
}

// Load Reviews Page
async function loadReviews() {
    const data = await apiGet('/reviews');
    
    const content = document.getElementById('content-area');
    
    // Update page title
    document.getElementById('page-title').textContent = 'Reviews Management';
    
    content.innerHTML = `
        <div class="content-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div>
                    <h2 style="margin-bottom: 0.5rem;">All Reviews (${data.total})</h2>
                    <span style="color: var(--text-secondary); font-size: 0.875rem;">
                        ${data.stats.pending} pending responses • ${data.stats.responded} responded
                    </span>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-secondary" onclick="filterReviews('all')" id="filter-all">All</button>
                    <button class="btn-secondary" onclick="filterReviews('pending')" id="filter-pending">Pending</button>
                    <button class="btn-secondary" onclick="filterReviews('responded')" id="filter-responded">Responded</button>
                </div>
            </div>
            <div id="reviews-list">
                ${data.reviews.map(review => renderReview(review)).join('')}
            </div>
        </div>
    `;
}

// Filter reviews
async function filterReviews(filter) {
    let url = '/reviews';
    if (filter === 'pending') url += '?responded=false';
    if (filter === 'responded') url += '?responded=true';
    
    const data = await apiGet(url);
    const reviewsList = document.getElementById('reviews-list');
    reviewsList.innerHTML = data.reviews.map(review => renderReview(review)).join('');
}

// Load Analytics Page
async function loadAnalytics() {
    const [overview, ratings, platforms] = await Promise.all([
        apiGet('/analytics/overview'),
        apiGet('/analytics/ratings'),
        apiGet('/analytics/platforms')
    ]);
    
    const content = document.getElementById('content-area');
    document.getElementById('page-title').textContent = 'Analytics & Insights';
    
    content.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon orange">
                    <span class="material-icons">star</span>
                </div>
                <div class="stat-value">${overview.rating.average}</div>
                <div class="stat-label">Overall Rating</div>
                <div class="stat-trend positive">
                    <span class="material-icons">trending_up</span>
                    ${overview.rating.trend}
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon purple">
                    <span class="material-icons">rate_review</span>
                </div>
                <div class="stat-value">${overview.reviews.total}</div>
                <div class="stat-label">Total Reviews</div>
                <div class="stat-trend positive">
                    <span class="material-icons">trending_up</span>
                    ${overview.reviews.trend}
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green">
                    <span class="material-icons">check_circle</span>
                </div>
                <div class="stat-value">${overview.responses.rate}%</div>
                <div class="stat-label">Response Rate</div>
                <div class="stat-trend positive">
                    <span class="material-icons">trending_up</span>
                    ${overview.responses.trend}
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon teal">
                    <span class="material-icons">schedule</span>
                </div>
                <div class="stat-value">${overview.responses.averageTime}</div>
                <div class="stat-label">Avg Response Time</div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem;">
            <div class="content-card">
                <h2>Rating Distribution</h2>
                ${ratings.distribution.map(rating => `
                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="display: flex; align-items: center; gap: 0.5rem;">
                                <span style="color: var(--warning);">${'★'.repeat(rating.stars)}${'☆'.repeat(5-rating.stars)}</span>
                                <span>${rating.stars} stars</span>
                            </span>
                            <span style="color: var(--text-secondary);">${rating.count} (${rating.percentage}%)</span>
                        </div>
                        <div style="background: var(--bg-tertiary); height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: var(--accent-primary); height: 100%; width: ${rating.percentage}%; transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="content-card">
                <h2>Sentiment Analysis</h2>
                <div style="margin-top: 1.5rem;">
                    <div style="margin-bottom: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="color: var(--success);">😊 Positive</span>
                            <span style="color: var(--success); font-weight: 500;">${overview.sentiment.positive}%</span>
                        </div>
                        <div style="background: var(--bg-tertiary); height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: var(--success); height: 100%; width: ${overview.sentiment.positive}%;"></div>
                        </div>
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="color: var(--warning);">😐 Neutral</span>
                            <span style="color: var(--warning); font-weight: 500;">${overview.sentiment.neutral}%</span>
                        </div>
                        <div style="background: var(--bg-tertiary); height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: var(--warning); height: 100%; width: ${overview.sentiment.neutral}%;"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="color: var(--error);">😞 Negative</span>
                            <span style="color: var(--error); font-weight: 500;">${overview.sentiment.negative}%</span>
                        </div>
                        <div style="background: var(--bg-tertiary); height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: var(--error); height: 100%; width: ${overview.sentiment.negative}%;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="content-card">
            <h2>Platform Performance</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-top: 1rem;">
                ${platforms.platforms.map(platform => `
                    <div style="background: var(--bg-tertiary); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border);">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                            <h3 style="font-size: 1.25rem; font-weight: 500;">${platform.name}</h3>
                            <span style="color: var(--success); font-size: 0.875rem;">${platform.trend}</span>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                            <div>
                                <p style="color: var(--text-secondary); font-size: 0.75rem; margin-bottom: 0.25rem;">Reviews</p>
                                <p style="font-size: 1.5rem; font-weight: 300;">${platform.reviews}</p>
                            </div>
                            <div>
                                <p style="color: var(--text-secondary); font-size: 0.75rem; margin-bottom: 0.25rem;">Rating</p>
                                <p style="font-size: 1.5rem; font-weight: 300;">${platform.rating}</p>
                            </div>
                            <div>
                                <p style="color: var(--text-secondary); font-size: 0.75rem; margin-bottom: 0.25rem;">Response</p>
                                <p style="font-size: 1.5rem; font-weight: 300;">${platform.responseRate}%</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Load AI Page
async function loadAI() {
    const content = document.getElementById('content-area');
    content.innerHTML = `
        <div class="content-card">
            <h2>AI Review Response Generator</h2>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                Generate professional responses to customer reviews using AI.
            </p>
            
            <div style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem;">Review Rating</label>
                <select id="ai-rating" style="width: 100%; padding: 0.75rem; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary);">
                    <option value="5">5 stars - Excellent</option>
                    <option value="4">4 stars - Good</option>
                    <option value="3">3 stars - Average</option>
                    <option value="2">2 stars - Poor</option>
                    <option value="1">1 star - Terrible</option>
                </select>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem;">Review Text</label>
                <textarea id="ai-text" placeholder="Enter the customer's review..." style="width: 100%; min-height: 120px; padding: 0.75rem; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); resize: vertical;"></textarea>
            </div>
            
            <button onclick="generateAIResponse()" class="btn-primary" style="width: auto;">
                <span class="material-icons">auto_awesome</span>
                Generate Response
            </button>
            
            <div id="ai-result" style="margin-top: 1.5rem;"></div>
        </div>
    `;
}

// Generate AI Response
async function generateAIResponse() {
    const rating = document.getElementById('ai-rating').value;
    const text = document.getElementById('ai-text').value;
    
    if (!text.trim()) {
        alert('Please enter review text');
        return;
    }
    
    const resultDiv = document.getElementById('ai-result');
    resultDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>Generating...</p></div>';
    
    try {
        const data = await apiPost('/ai/generate-response', { rating: parseInt(rating), text });
        
        resultDiv.innerHTML = `
            <div class="content-card" style="background: var(--bg-tertiary);">
                <h3>✨ AI Generated Response</h3>
                <p style="line-height: 1.6; margin: 1rem 0;">${data.response}</p>
                <div style="display: flex; gap: 0.75rem;">
                    <button class="btn-secondary" onclick="copyToClipboard('${data.response.replace(/'/g, "\\'")}')">
                        <span class="material-icons">content_copy</span>
                        Copy
                    </button>
                </div>
            </div>
        `;
    } catch (error) {
        resultDiv.innerHTML = `<p style="color: var(--error);">Error: ${error.message}</p>`;
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
}

// Load Business Page
async function loadBusiness() {
    const [business, googleStatus, metaStatus] = await Promise.all([
        apiGet('/business'),
        apiGet('/business/google/status'),
        apiGet('/business/meta/status')
    ]);
    
    const content = document.getElementById('content-area');
    document.getElementById('page-title').textContent = 'Business Profile';
    
    content.innerHTML = `
        <div class="content-card">
            <h2>Restaurant Information</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 1.5rem;">
                <div>
                    <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${business.name}</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">${business.description || ''}</p>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <span class="material-icons" style="font-size: 18px; color: var(--text-secondary);">location_on</span>
                        <span>${business.address}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <span class="material-icons" style="font-size: 18px; color: var(--text-secondary);">phone</span>
                        <span>${business.phone}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <span class="material-icons" style="font-size: 18px; color: var(--text-secondary);">email</span>
                        <span>${business.email || ''}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span class="material-icons" style="font-size: 18px; color: var(--text-secondary);">language</span>
                        <a href="${business.website}" target="_blank" style="color: var(--accent-primary);">${business.website}</a>
                    </div>
                </div>
                <div>
                    <div style="background: var(--bg-tertiary); padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 64px; height: 64px; background: rgba(255, 193, 7, 0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                <span class="material-icons" style="font-size: 32px; color: var(--warning);">star</span>
                            </div>
                            <div>
                                <p style="font-size: 2rem; font-weight: 300; line-height: 1;">${business.rating}</p>
                                <p style="color: var(--text-secondary); font-size: 0.875rem;">${business.reviewCount} reviews</p>
                            </div>
                        </div>
                    </div>
                    <div style="background: var(--bg-tertiary); padding: 1.5rem; border-radius: 12px;">
                        <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">Category</p>
                        <p style="font-weight: 500;">${business.category}</p>
                        ${business.priceLevel ? `<p style="color: var(--accent-primary); margin-top: 0.5rem;">${business.priceLevel}</p>` : ''}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="content-card">
            <h2>Opening Hours</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
                ${Object.entries(business.hours).map(([day, hours]) => `
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: var(--bg-tertiary); border-radius: 8px;">
                        <span style="text-transform: capitalize; font-weight: 500;">${day}</span>
                        <span style="color: var(--text-secondary);">${hours}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="content-card">
            <h2>Connected Platforms</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-top: 1rem;">
                <div style="background: var(--bg-tertiary); padding: 1.5rem; border-radius: 12px; border: 1px solid ${googleStatus.connected ? 'var(--success)' : 'var(--border)'};">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <div style="width: 48px; height: 48px; background: #4285F4; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 500; font-size: 1.25rem;">
                            G
                        </div>
                        <div>
                            <h3 style="font-size: 1.125rem; margin-bottom: 0.25rem;">Google Business Profile</h3>
                            <p style="color: var(--text-secondary); font-size: 0.875rem;">${googleStatus.accountName}</p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span class="material-icons" style="font-size: 16px; color: var(--success);">check_circle</span>
                        <span style="color: var(--success); font-size: 0.875rem;">Connected</span>
                        <span style="color: var(--text-secondary); font-size: 0.75rem; margin-left: auto;">Last sync: ${new Date(googleStatus.lastSync).toLocaleString()}</span>
                    </div>
                </div>
                
                <div style="background: var(--bg-tertiary); padding: 1.5rem; border-radius: 12px; border: 1px solid ${metaStatus.connected ? 'var(--success)' : 'var(--border)'};">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <div style="width: 48px; height: 48px; background: linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 500; font-size: 1.25rem;">
                            M
                        </div>
                        <div>
                            <h3 style="font-size: 1.125rem; margin-bottom: 0.25rem;">Meta Business</h3>
                            <p style="color: var(--text-secondary); font-size: 0.875rem;">${metaStatus.pageName}</p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span class="material-icons" style="font-size: 16px; color: var(--success);">check_circle</span>
                        <span style="color: var(--success); font-size: 0.875rem;">Connected</span>
                        <span style="color: var(--text-secondary); font-size: 0.75rem; margin-left: auto;">Last sync: ${new Date(metaStatus.lastSync).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render Review
function renderReview(review) {
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    const initials = review.author.split(' ').map(n => n[0]).join('');
    
    return `
        <div class="review-item">
            <div class="review-header">
                <div class="review-author">
                    <div class="author-avatar">${initials}</div>
                    <div class="author-info">
                        <h4>${review.author}</h4>
                        <p>${new Date(review.date).toLocaleDateString()} • ${review.platform}</p>
                    </div>
                </div>
                <div class="review-rating" style="color: var(--warning);">${stars}</div>
            </div>
            <p class="review-text">${review.text}</p>
            ${review.responded ? `
                <div style="background: rgba(76, 175, 80, 0.1); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <p style="color: var(--success); font-weight: 500; margin-bottom: 0.5rem;">✓ Your Response:</p>
                    <p style="line-height: 1.6;">${review.response}</p>
                </div>
            ` : `
                <div class="review-actions">
                    <button class="btn-secondary">
                        <span class="material-icons">auto_awesome</span>
                        Generate AI Response
                    </button>
                    <button class="btn-secondary">
                        <span class="material-icons">edit</span>
                        Write Response
                    </button>
                </div>
            `}
        </div>
    `;
}

// API Helper Functions
async function apiGet(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!response.ok) throw new Error('API request failed');
    return response.json();
}

async function apiPost(endpoint, data) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('API request failed');
    return response.json();
}
