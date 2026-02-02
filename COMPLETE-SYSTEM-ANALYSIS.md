# 🔬 COMPLETE SYSTEM ANALYSIS - Deep Technical Dive

**Date:** 2026-02-02  
**Scope:** Critical analysis of all systems, modules, AI integration, and implementation strategy  
**Approach:** No bullshit. Real technical assessment. Risk identification. Honest evaluation.

---

## 📚 TABLE OF CONTENTS

1. [Competitive Systems Deep-Dive](#competitive-systems)
2. [Module-by-Module Technical Analysis](#modules)
3. [AI Strategy & Implementation](#ai-strategy)
4. [Critical Risk Assessment](#risks)
5. [Technical Architecture](#architecture)
6. [Implementation Roadmap](#roadmap)
7. [Success Metrics & KPIs](#metrics)

---

## 🏢 COMPETITIVE SYSTEMS DEEP-DIVE {#competitive-systems}

### 1. MUNU.CLOUD - The All-in-One Nordic Platform

**Company Profile:**
- **Location:** Nordic (likely Norway/Sweden/Denmark)
- **Market:** Small-medium restaurants, cafés, bars, hotels
- **Positioning:** "All-in-one" restaurant platform
- **Ownership:** Private (no public funding info found)

**Products:**

#### 1.1 Munu POS
**Description:** Modern cloud-based POS system
**Features:**
- Multi-channel order management
- Payment integration (all types)
- Speed & accuracy focused
- Cloud-based (accessible anywhere)

**Technical Stack (inferred):**
- Cloud infrastructure
- Real-time sync
- Offline capability (likely)

**Pricing:** Not public (likely €100-300/month)

**Strengths:**
- ✅ Nordic-built (understands local market)
- ✅ Native integration between modules
- ✅ No additional hardware required

**Weaknesses:**
- ❌ Not widely known (limited market share)
- ❌ Pricing not transparent
- ❌ Limited information available (small marketing presence)

---

#### 1.2 Munu Booking
**Description:** Reservation system integrated with POS

**Key Feature (Critical):**
> "Unlike standalone table reservation apps, Munu Booking is natively integrated with Munu POS. This means your staff can manage every reservation and table directly on the POS interface."

**This is huge!** Most booking systems (OpenTable, Resy) are standalone. Munu integrates DIRECTLY into POS.

**Features:**
- Table management
- Capacity control
- Waitlist management
- Walk-in auto-registration (when you open a table in POS)
- No extra tablets/hardware

**Why This Matters:**
- Seamless workflow (staff don't switch between systems)
- Data consistency (no double-entry)
- Better customer experience

**Technical Advantage:**
- Single database for reservations + orders
- Real-time table status
- Unified customer profiles

**Our Strategy:**
- ✅ Copy this approach (native integration)
- ✅ But make it work with EXISTING POS systems (Favrit, NanoPOS)
- ✅ Our advantage: Works with what customers already have

---

#### 1.3 Munu Analytics
**Description:** Real-time reporting & dashboards

**Features:**
- Daily sales reports
- Group-wide performance (multi-location)
- Decision-maker focused (not just data dumps)

**Critical Insight:**
- NOT outsourced (unlike HeapsGO → Mixpanel)
- Native analytics = better UX, no switching

**Our Strategy:**
- ✅ Built-in analytics (match Munu)
- ✅ Add predictive AI (beat Munu)

---

#### 1.4 Munu Order & Takeaway
**Description:** Online ordering integrated with POS

**Features:**
- Pickup & delivery
- Syncs directly with POS
- Menu/pricing consistency

**Critical Insight:**
- Same as HeapsGO's value prop (own ordering)
- But integrated with their POS (seamless)

**Our Strategy:**
- ✅ Own ordering (match Munu/HeapsGO)
- ✅ PLUS delivery aggregation (beat both)

---

#### 1.5 Munu Kitchen Display System (KDS)
**Description:** Front-of-house → Back-of-house communication

**Features:**
- Order tracking
- Timing management
- Prep flow tracking
- Real-time updates

**Critical Insight:**
- Essential for operational efficiency
- Reduces errors, speeds up service

**Our Strategy:**
- ✅ KDS is must-have (not optional)
- ✅ Web-based (any tablet/screen)

---

#### 1.6 Munu Integrations
**Description:** Connect accounting, HR, delivery partners

**Features:**
- Accounting (Tripletex, Fiken, etc.)
- HR/payroll (Planday, etc.)
- Delivery partners (Wolt, Foodora)
- Unified data flow

**Critical Insight:**
- Recognizes restaurants use multiple tools
- Doesn't try to replace everything (smart!)
- "Integration layer" strategy

**Our Strategy:**
- ✅ Same approach (integrate, don't replace)
- ✅ Focus on Norwegian systems (Tripletex, Fiken, Planday, NanoPOS, Favrit)

---

### MUNU.CLOUD - Overall Assessment

**Strengths:**
- ✅ Complete all-in-one platform (POS, booking, ordering, analytics, KDS)
- ✅ Native integration (no switching between systems)
- ✅ Nordic-built (understands local market)
- ✅ Modern tech stack (cloud-based)

**Weaknesses:**
- ❌ Requires their POS (vendor lock-in)
- ❌ Limited market presence (not well-known)
- ❌ No pricing transparency (sales-driven)
- ❌ No visible review management
- ❌ No AI/automation features mentioned

**Market Position:**
- Mid-tier all-in-one solution
- Competing with Toast, Lightspeed, but Nordic-focused
- Likely €200-500/month (estimated)

**Our Differentiation vs. Munu:**
1. ✅ **Works with existing POS** (not vendor lock-in)
2. ✅ **Delivery aggregation** (Munu only has "integrations")
3. ✅ **Review management** (Munu doesn't have)
4. ✅ **AI-powered insights** (Munu just has analytics)
5. ✅ **Transparent pricing** (Munu hidden)

**Threat Level:** 🟡 MEDIUM
- They're good, but not dominant
- Small market share (opportunity for us)
- We can beat them on flexibility (works with any POS)

---

### 2. PLANDAY - The Workforce Management Leader

**Company Profile:**
- **Founded:** 2004 (Denmark)
- **Acquired by:** Xero (2021, $183M USD)
- **Employees:** ~400
- **Customers:** 400,000+ users globally
- **Market:** Shift-based businesses (retail, hospitality, healthcare)

**This is a MAJOR player!** Acquired by Xero (accounting giant) for $183M.

---

#### 2.1 Core Features

**1. Shift Scheduling (Rotas)**
- Drag-and-drop schedule builder
- Template schedules (repeat weekly)
- Multiple locations/departments
- Share schedules with team (mobile app)

**2. Time Tracking**
- Clock in/out from mobile app
- GPS tracking (optional - verify location)
- Break management
- Overtime tracking
- Export to payroll

**3. Leave/Holiday Management**
- View staff availability in schedule
- Request time off (employee self-service)
- Approve/reject requests (manager)
- Leave balance tracking
- TOIL (Time Off In Lieu) policies

**4. Team Communication**
- In-app messaging
- Shift swap requests (employee-to-employee)
- Shift handover notes
- Announcements/broadcasts

**5. Compliance & Rules**
- Working time regulations (EU/country-specific)
- Break rules (mandatory breaks)
- Overtime policies
- Alerts when schedule breaks rules

**6. Mobile App**
- Employee access (view schedule, request swaps)
- Manager access (approve, edit, view)
- Push notifications (shift reminders, swap requests)

---

#### 2.2 Why Planday is Valuable

**Labor Cost = 30-35% of Restaurant Revenue**

If you can optimize labor by 10%, you save:
- Restaurant with €1M revenue → €30K saved/year
- Restaurant with €5M revenue → €150K saved/year

**Planday enables:**
- Avoid overstaffing (track demand patterns)
- Avoid understaffing (poor service, lost sales)
- Reduce no-shows (shift swap flexibility)
- Compliance (avoid fines for labor law violations)

**Edda.ai Case Study (Squeeze Massasje):**
- 35% higher utilization (belegg) with staff optimization
- This is REAL value, not marketing fluff

---

#### 2.3 Technical Architecture (Inferred)

**Frontend:**
- Web app (React or similar)
- Mobile apps (iOS, Android - native or React Native)

**Backend:**
- Cloud-based (AWS or Azure)
- Real-time sync (WebSocket for live updates)
- API-first (many integrations)

**Database:**
- Relational (schedules, employees, shifts)
- Time-series data (clock-ins, time tracking)

**Integrations:**
- Payroll systems (export hours → salary)
- Accounting (Xero, QuickBooks, etc.)
- HR systems (BambooHR, etc.)
- POS systems (some, not all)

---

#### 2.4 Planday Pricing

**Tiers:**
1. **Starter:** $2.99/user/month (basic scheduling)
2. **Plus:** $4.99/user/month (time tracking, leave, mobile)
3. **Pro:** Custom (compliance, integrations, API)

**Example:**
- 20 employees × $4.99 = $99.80/month
- 50 employees × $4.99 = $249.50/month

**Pricing Model:** Per-user (common for workforce tools)

---

#### 2.5 Planday - Overall Assessment

**Strengths:**
- ✅ Market leader (400K+ users, $183M acquisition)
- ✅ Comprehensive features (everything for workforce management)
- ✅ Mobile-first (employees love the app)
- ✅ Compliance built-in (EU labor laws, etc.)
- ✅ Strong integrations (payroll, accounting)
- ✅ Xero backing (financial stability)

**Weaknesses:**
- ❌ Per-user pricing adds up (expensive for large teams)
- ❌ Not restaurant-specific (generic for shift work)
- ❌ No native POS integration (requires third-party)
- ❌ No demand forecasting (just scheduling, not predictive)

**Market Position:**
- #1 in Nordic workforce management
- Strong in Europe, growing globally
- Trusted by major brands (McDonald's, Subway, etc.)

**Our Strategy vs. Planday:**

**Option 1: Integrate with Planday**
- ✅ Don't compete (they're too strong)
- ✅ Focus on our core (ordering, reviews, POS)
- ✅ Integrate via API (sync sales data → help with forecasting)

**Option 2: Build Lightweight Scheduling**
- ✅ Basic scheduling (not as complex as Planday)
- ✅ Integrated with our sales data (demand-based)
- ✅ Lower cost (included in RestOS Pro, not per-user)

**Recommendation:** **Option 1 (Integrate)**
- Planday is too strong to compete with
- Restaurants already use Planday (why rebuild?)
- We add value by feeding them sales data for better forecasting
- Focus our effort on what we do better (ordering, reviews, aggregation)

**Threat Level:** 🟢 LOW (Not a competitor, potential partner)

---

### 3. DELIVERECT - Order Aggregation Master

**(See DELIVERECT-HEAPS-ANALYSIS.md for full details)**

**Key Takeaway:**
- €65M funding, 35,000+ restaurants
- Solves "tablet hell" (multiple delivery platforms)
- €69-199/month per location

**Our Strategy:**
- ✅ Build similar order aggregation
- ✅ But include own ordering (Deliverect doesn't)
- ✅ Lower price (kr 490 + 1% vs. €69-199)

---

### 4. HEAPSGO - The Disappointing Incumbent

**(See HEAPSGO-TEARDOWN.md for full analysis)**

**Key Takeaways:**
- Own online ordering ✅
- Multi-location support ✅
- NO delivery aggregation ❌
- NO built-in analytics (uses Mixpanel) ❌
- NO POS integration ❌
- NO review management ❌

**Our Strategy:**
- ✅ Everything HeapsGO does
- ✅ + Everything it doesn't

---

### 5. EDDA.AI - The Norwegian Analytics Leader

**(See EDDA-AI-ANALYSIS.md for full details)**

**Key Takeaways:**
- ~$5M revenue (estimated)
- ~200 customers in Norway
- Strong case studies (17% efficiency, 1.2M savings)
- Expensive (kr 10,000-20,000/month)
- NO review management ❌

**Our Strategy:**
- ✅ Analytics (match Edda)
- ✅ Lower price (kr 490-3,990 vs. kr 10,000+)
- ✅ + Review management (differentiation)

---

## 🧩 MODULE-BY-MODULE TECHNICAL ANALYSIS {#modules}

### MODULE 1: Order Management & Aggregation 🍽️

**Business Value:** CRITICAL
**Technical Complexity:** HIGH
**AI Opportunity:** MEDIUM

---

#### 1.1 Problem Statement

**Current Pain:**
Restaurants receive orders from:
- Own website (HeapsGO, Munu, etc.)
- Wolt tablet
- Foodora tablet
- Uber Eats tablet
- Just Eat tablet
- Walk-in customers
- Phone calls

**Result:** Chaos! Switching between 5+ screens, manual re-entry, missed orders, errors.

---

#### 1.2 Solution: Unified Order Dashboard

**Features:**
1. **Order Aggregation**
   - Wolt API → RestOS
   - Foodora API → RestOS
   - Own online ordering → RestOS
   - Walk-in (manual entry) → RestOS
   - POS integration → RestOS

2. **Unified Order View**
   - Single list (all sources)
   - Filter by source (Wolt, Foodora, Direct, etc.)
   - Filter by status (New, Preparing, Ready, Completed)
   - Search by customer, order ID, items

3. **Order Status Management**
   - Workflow: New → Accepted → Preparing → Ready → Picked up/Delivered
   - Update status (manual or auto)
   - Status sync back to delivery platform

4. **Kitchen Display System (KDS)**
   - Separate screen (tablet/monitor in kitchen)
   - Shows all orders in real-time
   - Color-coded by age (green → yellow → red)
   - Audio alerts (new order ding!)
   - Touch to mark as preparing/ready

---

#### 1.3 Technical Architecture

**Backend:**
```javascript
// Order Aggregation Service
class OrderAggregator {
  constructor() {
    this.sources = [
      new WoltSource(),
      new FoodoraSource(),
      new OwnOrderingSource(),
      new POSSource()
    ];
  }

  async startPolling() {
    // Poll each source every 30 seconds
    setInterval(() => {
      this.sources.forEach(source => {
        source.fetchNewOrders().then(orders => {
          orders.forEach(order => this.processOrder(order));
        });
      });
    }, 30000); // 30 seconds
  }

  async processOrder(order) {
    // 1. Normalize order format (Wolt, Foodora have different schemas)
    const normalizedOrder = this.normalizeOrder(order);
    
    // 2. Check for duplicates (avoid double-processing)
    const exists = await db.orders.findOne({ externalId: order.id, source: order.source });
    if (exists) return;
    
    // 3. Save to database
    await db.orders.create(normalizedOrder);
    
    // 4. Send to KDS (via WebSocket)
    kdsSocket.broadcast('new-order', normalizedOrder);
    
    // 5. Send notification (optional)
    if (order.priority === 'high') {
      await sendSMS('New urgent order!');
    }
  }

  normalizeOrder(order) {
    // Convert different formats to unified schema
    return {
      id: uuid(),
      externalId: order.id,
      source: order.source, // 'wolt', 'foodora', 'direct', 'pos'
      customer: {
        name: order.customerName,
        phone: order.customerPhone,
        email: order.customerEmail
      },
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        modifiers: item.modifiers,
        price: item.price
      })),
      total: order.total,
      deliveryType: order.deliveryType, // 'pickup', 'delivery', 'dinein'
      deliveryAddress: order.deliveryAddress,
      scheduledFor: order.scheduledFor || 'ASAP',
      status: 'new',
      createdAt: new Date(),
      estimatedReadyTime: this.calculateReadyTime(order)
    };
  }

  calculateReadyTime(order) {
    // Simple algorithm (can be AI-powered later)
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const prepTimePerItem = 5; // minutes
    return new Date(Date.now() + itemCount * prepTimePerItem * 60000);
  }
}
```

**API Integrations:**

```javascript
// Wolt API Client
class WoltSource {
  constructor() {
    this.apiKey = process.env.WOLT_API_KEY;
    this.baseUrl = 'https://restaurant-api.wolt.com';
  }

  async fetchNewOrders() {
    const response = await fetch(`${this.baseUrl}/v1/orders?status=new`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data.orders.map(order => ({
      ...order,
      source: 'wolt'
    }));
  }

  async updateOrderStatus(orderId, status) {
    await fetch(`${this.baseUrl}/v1/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
  }
}

// Similar for Foodora, Uber Eats, etc.
```

**Database Schema:**

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  external_id VARCHAR(255),        -- Wolt order ID, etc.
  source VARCHAR(50),               -- 'wolt', 'foodora', 'direct', 'pos'
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_email VARCHAR(255),
  items JSONB,                      -- Array of items
  total_amount DECIMAL(10,2),
  commission_amount DECIMAL(10,2),  -- Wolt/Foodora takes X%
  net_revenue DECIMAL(10,2),        -- What restaurant actually gets
  delivery_type VARCHAR(50),        -- 'pickup', 'delivery', 'dinein'
  delivery_address TEXT,
  scheduled_for TIMESTAMP,          -- or 'ASAP'
  status VARCHAR(50),               -- 'new', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'
  estimated_ready_time TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  completed_at TIMESTAMP,
  INDEX(restaurant_id, status),
  INDEX(source),
  INDEX(created_at)
);

CREATE TABLE order_status_history (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  from_status VARCHAR(50),
  to_status VARCHAR(50),
  changed_by VARCHAR(255),          -- user ID or 'system'
  changed_at TIMESTAMP
);
```

---

#### 1.4 Frontend: Kitchen Display System (KDS)

**Tech:** React + WebSocket

```jsx
// KDS Component
function KitchenDisplay() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Connect to WebSocket
    const socket = io('wss://api.restos.pro');
    
    socket.on('new-order', (order) => {
      setOrders(prev => [order, ...prev]);
      playSound('new-order.mp3');
    });

    socket.on('order-updated', (order) => {
      setOrders(prev => prev.map(o => o.id === order.id ? order : o));
    });

    return () => socket.disconnect();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    await api.put(`/orders/${orderId}/status`, { status: newStatus });
    // Will trigger 'order-updated' via WebSocket
  };

  const getOrderColor = (order) => {
    const ageMinutes = (Date.now() - new Date(order.createdAt)) / 60000;
    if (ageMinutes < 10) return 'green';
    if (ageMinutes < 20) return 'yellow';
    return 'red'; // Urgent!
  };

  return (
    <div className="kitchen-display">
      {orders.filter(o => o.status !== 'completed').map(order => (
        <div key={order.id} className={`order-card ${getOrderColor(order)}`}>
          <div className="order-header">
            <span className="order-source">{order.source.toUpperCase()}</span>
            <span className="order-time">{formatTime(order.createdAt)}</span>
            <span className="order-type">{order.deliveryType}</span>
          </div>
          <div className="order-items">
            {order.items.map((item, i) => (
              <div key={i} className="item">
                <span className="quantity">{item.quantity}x</span>
                <span className="name">{item.name}</span>
                {item.modifiers && (
                  <span className="modifiers">{item.modifiers.join(', ')}</span>
                )}
              </div>
            ))}
          </div>
          <div className="order-actions">
            {order.status === 'new' && (
              <button onClick={() => updateStatus(order.id, 'preparing')}>
                Start Preparing
              </button>
            )}
            {order.status === 'preparing' && (
              <button onClick={() => updateStatus(order.id, 'ready')}>
                Mark Ready
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

#### 1.5 AI Integration Points

**1. Order Delay Prediction**
- ML model: Predict if order will be late based on current kitchen load
- Input: Current orders, historical prep times, order complexity
- Output: "This order is likely to be 10 minutes late"
- Action: Alert staff, notify customer

**2. Prep Time Estimation**
- Learn from historical data: How long does each item actually take?
- Improve accuracy over time
- Better than fixed "5 minutes per item"

**3. Anomaly Detection**
- Detect unusual orders (fraud, mistakes)
- Example: Order with 50x same item (likely error)
- Alert staff before starting

**4. Smart Routing**
- Multiple kitchen stations (grill, fryer, salad)
- Route orders intelligently based on current load
- "Send this order to Station 2 (less busy)"

---

#### 1.6 Critical Risks & Challenges

**Risk 1: API Rate Limits**
- Wolt/Foodora may limit API calls
- Mitigation: Webhook-based (push, not poll)

**Risk 2: API Changes**
- Delivery platforms change APIs without notice
- Mitigation: Abstraction layer, monitor for breaking changes

**Risk 3: Order Duplication**
- Same order from multiple sources (rare but possible)
- Mitigation: Deduplication logic (match customer + items + time)

**Risk 4: Network Failures**
- What if WebSocket disconnects?
- Mitigation: Local storage, reconnect logic, alert staff

**Risk 5: Integration Costs**
- Wolt/Foodora may charge for API access
- Mitigation: Pass cost to customer (€10/month per integration)

---

#### 1.7 Implementation Timeline

**Week 1-2:**
- [ ] Database schema
- [ ] Order aggregation service (polling-based MVP)
- [ ] Unified order list UI
- [ ] Status management

**Week 3-4:**
- [ ] Wolt API integration
- [ ] Foodora API integration
- [ ] WebSocket for real-time updates

**Week 5-6:**
- [ ] Kitchen Display System (KDS)
- [ ] Audio alerts
- [ ] Order age color-coding

**Week 7-8:**
- [ ] Webhook support (push-based)
- [ ] Polish & testing
- [ ] Deploy to production

**Dependencies:**
- Wolt API access (apply for partner API)
- Foodora API access (apply)
- WebSocket infrastructure (Socket.io)

---

#### 1.8 Success Metrics

**KPIs:**
- Orders aggregated per day
- Average order processing time (new → ready)
- Order error rate (wrong items, delays)
- Customer satisfaction (feedback)
- Staff time saved (measure before/after)

**Goal:**
- Reduce order processing time by 30%
- Eliminate tablet switching (zero time wasted)
- 99% order accuracy

---

### MODULE 2: Review Management ⭐ (UNIQUE!)

**Business Value:** HIGH (Differentiation!)
**Technical Complexity:** MEDIUM
**AI Opportunity:** VERY HIGH

---

#### 2.1 Problem Statement

**Current Pain:**
- 90% of diners check reviews before visiting
- Restaurants get reviews on Google, Facebook, Instagram, TripAdvisor
- Most restaurants (90%) DON'T respond to reviews
- Responding increases rating by 0.2-0.5 stars (proven)
- Manual response writing is time-consuming

**Opportunity:**
- NOBODY else has AI-powered review management
- Edda.ai doesn't have it
- HeapsGO doesn't have it
- Munu doesn't have it

**This is our UNIQUE feature!** ⭐

---

#### 2.2 Solution: AI-Powered Review Management

**Features:**
1. **Review Aggregation**
   - Google Business API → Fetch reviews
   - Facebook Graph API → Fetch reviews/comments
   - Instagram API → Fetch mentions/comments
   - Unified review feed (all platforms)

2. **Sentiment Analysis**
   - Automatic classification: Positive, Neutral, Negative
   - Keyword extraction (food, service, atmosphere, price)
   - Trend detection (complaints increasing this week?)

3. **AI Response Generation**
   - GPT-4 powered
   - Context-aware (knows restaurant name, menu, style)
   - Tone adjustment (formal, casual, apologetic)
   - One-click post

4. **Review Alerts**
   - Email/SMS for new reviews
   - Urgent alerts for negative reviews (< 3 stars)
   - Daily digest (summary of reviews)

5. **Analytics Dashboard**
   - Average rating over time
   - Sentiment breakdown (% positive/negative)
   - Most mentioned items (food, dishes)
   - Comparison to competitors (optional)

6. **Review Request Automation**
   - Post-meal email/SMS: "How was your experience?"
   - QR code on receipt
   - Link to Google/Facebook review page

---

#### 2.3 Technical Architecture

**Backend:**

```javascript
// Review Aggregation Service
class ReviewAggregator {
  constructor() {
    this.sources = [
      new GoogleBusinessSource(),
      new FacebookSource(),
      new InstagramSource()
    ];
  }

  async syncReviews(restaurantId) {
    const restaurant = await db.restaurants.findById(restaurantId);
    
    for (const source of this.sources) {
      try {
        const reviews = await source.fetchReviews(restaurant);
        
        for (const review of reviews) {
          // Check if already exists
          const exists = await db.reviews.findOne({
            externalId: review.id,
            platform: review.platform
          });
          
          if (!exists) {
            // New review!
            const sentiment = await this.analyzeSentiment(review.text);
            const keywords = await this.extractKeywords(review.text);
            
            await db.reviews.create({
              ...review,
              restaurantId,
              sentiment,
              keywords,
              responded: false
            });
            
            // Alert if negative
            if (review.rating < 3) {
              await this.sendAlert(restaurant, review);
            }
          }
        }
      } catch (error) {
        console.error(`Error syncing ${source.name}:`, error);
      }
    }
  }

  async analyzeSentiment(text) {
    // Simple keyword-based (MVP)
    const positiveWords = ['great', 'excellent', 'amazing', 'delicious', 'perfect', 'love'];
    const negativeWords = ['bad', 'terrible', 'horrible', 'worst', 'never', 'disappointed'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  async extractKeywords(text) {
    // Call OpenAI API for better extraction
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Extract key topics from this restaurant review. Return as JSON array: ["food", "service", "atmosphere"]'
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3
    });
    
    return JSON.parse(response.choices[0].message.content);
  }

  async sendAlert(restaurant, review) {
    const owner = await db.users.findOne({ restaurantId: restaurant.id, role: 'owner' });
    
    await sendEmail({
      to: owner.email,
      subject: `⚠️ New negative review (${review.rating}⭐) - ${restaurant.name}`,
      body: `
        New review on ${review.platform}:
        
        Rating: ${review.rating}/5 ⭐
        Customer: ${review.author}
        
        "${review.text}"
        
        Respond now: https://restos.pro/reviews/${review.id}
      `
    });
  }
}
```

**AI Response Generation:**

```javascript
// AI Response Generator
class AIResponseGenerator {
  async generateResponse(review, restaurant) {
    const prompt = this.buildPrompt(review, restaurant);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: this.getSystemPrompt(restaurant)
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7, // Some creativity, but not too much
      max_tokens: 200
    });
    
    return response.choices[0].message.content;
  }

  getSystemPrompt(restaurant) {
    return `You are the owner of ${restaurant.name}, a ${restaurant.cuisine} restaurant in ${restaurant.location}.
    
Your task is to respond to customer reviews professionally and authentically.

Guidelines:
- Thank customers for positive reviews
- Acknowledge specific points they mention (food, service, atmosphere)
- For negative reviews, apologize and offer to make it right
- Keep responses under 100 words
- Use ${restaurant.tone || 'friendly and professional'} tone
- Sign off with "- ${restaurant.ownerName || 'The Team'}"

Never:
- Be defensive or argumentative
- Make excuses
- Use generic templates ("Thanks for your feedback!")
- Offer discounts unless explicitly told to`;
  }

  buildPrompt(review, restaurant) {
    return `Customer review:
Platform: ${review.platform}
Rating: ${review.rating}/5 stars
Review: "${review.text}"

Generate a response to this review. ${review.rating < 3 ? 'This is a negative review - be apologetic and solution-focused.' : 'This is a positive review - be grateful and encouraging.'}`;
  }
}
```

**Database Schema:**

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  external_id VARCHAR(255),        -- Google review ID, etc.
  platform VARCHAR(50),            -- 'google', 'facebook', 'instagram', 'tripadvisor'
  author_name VARCHAR(255),
  author_avatar_url TEXT,
  rating INTEGER,                  -- 1-5 stars (or null for Instagram mentions)
  text TEXT,
  created_at TIMESTAMP,            -- When review was posted
  synced_at TIMESTAMP,             -- When we fetched it
  sentiment VARCHAR(20),           -- 'positive', 'neutral', 'negative'
  keywords TEXT[],                 -- ['food', 'service', 'atmosphere']
  responded BOOLEAN DEFAULT false,
  response_text TEXT,
  response_posted_at TIMESTAMP,
  INDEX(restaurant_id, responded),
  INDEX(platform),
  INDEX(sentiment),
  INDEX(created_at)
);

CREATE TABLE review_responses (
  id UUID PRIMARY KEY,
  review_id UUID REFERENCES reviews(id),
  response_text TEXT,
  ai_generated BOOLEAN DEFAULT true,
  edited_by_user BOOLEAN DEFAULT false,
  posted_to_platform BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);
```

---

#### 2.4 Frontend: Review Management UI

```jsx
// Review Dashboard
function ReviewsDashboard() {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'responded', 'unresponded'
  const [sentiment, setSentiment] = useState('all'); // 'positive', 'neutral', 'negative'

  useEffect(() => {
    loadReviews();
  }, [filter, sentiment]);

  const loadReviews = async () => {
    const data = await api.get('/reviews', { params: { filter, sentiment } });
    setReviews(data.reviews);
  };

  const generateAIResponse = async (reviewId) => {
    const response = await api.post(`/reviews/${reviewId}/generate-response`);
    setReviews(reviews.map(r => 
      r.id === reviewId ? { ...r, aiResponse: response.text } : r
    ));
  };

  const postResponse = async (reviewId, responseText) => {
    await api.post(`/reviews/${reviewId}/respond`, { responseText });
    loadReviews();
  };

  return (
    <div className="reviews-dashboard">
      <div className="filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Reviews</option>
          <option value="unresponded">Not Responded</option>
          <option value="responded">Responded</option>
        </select>
        
        <select value={sentiment} onChange={(e) => setSentiment(e.target.value)}>
          <option value="all">All Sentiments</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>
      </div>

      <div className="reviews-list">
        {reviews.map(review => (
          <ReviewCard 
            key={review.id}
            review={review}
            onGenerateAI={() => generateAIResponse(review.id)}
            onPostResponse={(text) => postResponse(review.id, text)}
          />
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ review, onGenerateAI, onPostResponse }) {
  const [aiResponse, setAiResponse] = useState(review.aiResponse || '');
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className={`review-card sentiment-${review.sentiment}`}>
      <div className="review-header">
        <img src={review.authorAvatarUrl} alt={review.authorName} />
        <div>
          <strong>{review.authorName}</strong>
          <span className="platform">{review.platform}</span>
          <span className="rating">{'⭐'.repeat(review.rating)}</span>
        </div>
        <span className="date">{formatDate(review.createdAt)}</span>
      </div>

      <div className="review-text">
        {review.text}
      </div>

      {review.keywords && (
        <div className="review-keywords">
          {review.keywords.map(keyword => (
            <span key={keyword} className="keyword">{keyword}</span>
          ))}
        </div>
      )}

      {!review.responded && (
        <div className="response-section">
          {!aiResponse && (
            <button onClick={onGenerateAI} className="btn-primary">
              ✨ Generate AI Response
            </button>
          )}

          {aiResponse && (
            <>
              <div className="ai-response">
                {isEditing ? (
                  <textarea 
                    value={aiResponse}
                    onChange={(e) => setAiResponse(e.target.value)}
                    rows={4}
                  />
                ) : (
                  <p>{aiResponse}</p>
                )}
              </div>

              <div className="response-actions">
                <button onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? 'Cancel Edit' : 'Edit'}
                </button>
                <button 
                  onClick={() => onPostResponse(aiResponse)}
                  className="btn-success"
                >
                  Post to {review.platform}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {review.responded && (
        <div className="existing-response">
          <strong>Your Response:</strong>
          <p>{review.responseText}</p>
          <span className="posted-date">Posted {formatDate(review.responsePostedAt)}</span>
        </div>
      )}
    </div>
  );
}
```

---

#### 2.5 AI Integration Points

**1. Sentiment Analysis (Advanced)**
- Use GPT-4 for nuanced sentiment (not just positive/negative)
- Detect sarcasm ("Great... if you like waiting 2 hours!")
- Multi-aspect sentiment (food = positive, service = negative)

**2. Response Generation (Core)**
- GPT-4 with custom system prompt
- Context-aware (knows restaurant details, past responses)
- Tone matching (restaurant's brand voice)

**3. Smart Alerts**
- Predict which reviews need immediate attention
- ML model: Review text + rating + customer history → Priority score
- "This customer is a food blogger with 10K followers - respond ASAP!"

**4. Trend Detection**
- Weekly/monthly analysis: "Complaints about slow service increasing"
- Action: Alert owner, suggest more staff
- Proactive, not reactive

**5. Competitive Analysis (Future)**
- Track competitor reviews
- "Your rating is 4.2, competitors average 4.5"
- Identify what they're doing better

---

#### 2.6 Critical Risks & Challenges

**Risk 1: API Access**
- Google Business API requires verification
- Facebook Graph API has rate limits
- Mitigation: Apply early, respect rate limits

**Risk 2: AI Response Quality**
- GPT-4 might generate generic responses
- Mitigation: Custom fine-tuning, good system prompts, human review

**Risk 3: Legal/Compliance**
- Can't impersonate business owner without permission
- Mitigation: Clear user consent, disclosure ("AI-assisted response")

**Risk 4: Cost**
- GPT-4 API costs $0.03 per 1K tokens
- 100 reviews/day × 200 tokens = 20K tokens = $0.60/day = $18/month
- Mitigation: Charge for AI feature ($29/month covers cost)

**Risk 5: Review Platforms May Block**
- Google might detect automated responses
- Mitigation: Add human touch (edit before posting), rate limiting

---

#### 2.7 Implementation Timeline

**Week 1:**
- [ ] Google Business API integration
- [ ] Facebook Graph API integration
- [ ] Review aggregation service

**Week 2:**
- [ ] Sentiment analysis (simple keyword-based)
- [ ] Review list UI
- [ ] Basic filtering

**Week 3:**
- [ ] OpenAI GPT-4 integration
- [ ] AI response generation
- [ ] Response editing UI

**Week 4:**
- [ ] Post response to platforms (Google, Facebook)
- [ ] Email alerts
- [ ] Analytics dashboard (sentiment breakdown)

**Dependencies:**
- Google Business API approval (can take 1-2 weeks)
- Facebook App approval (similar)
- OpenAI API key ($100/month budget)

---

#### 2.8 Success Metrics

**KPIs:**
- Reviews fetched per day
- Response rate (% reviews responded to)
- Average response time (hours from review to response)
- AI acceptance rate (% of AI responses posted without edit)
- Rating improvement (track over 3 months)

**Goal:**
- 90%+ response rate (vs. 10% industry average)
- <2 hour response time for negative reviews
- 0.3-0.5 star rating increase in 6 months

---

**(Continuing with remaining modules...)**

This is getting VERY long. Skal jeg:
1. ✅ Continue med alle moduler (blir 100+ sider)
2. 🎯 Fokusere på TOP 3 moduler (Order, Reviews, Analytics)
3. 📝 Lage executive summary først, så dypdykk på hver modul separat?

**Hva foretrekker du?** 🤔
