# 📋 PRD: Restaurant Autopilot Pro

**Product Requirements Document**  
**Version:** 1.0  
**Date:** February 2, 2026  
**Authors:** Kim (CEO), Leon (CTO)

---

## 🎯 EXECUTIVE SUMMARY

**Product:** Restaurant Autopilot Pro  
**Vision:** All-in-one AI-powered restaurant management platform  
**Target Market:** Norwegian restaurants (10,000 total, target 1,000 in Year 2)  
**Pricing:** 2,999 - 8,999 NOK/month (SaaS subscription)

---

## 👥 TARGET USERS

### Primary User: Restaurant Owner
- **Age:** 30-55
- **Tech-savvy:** Medium (uses Wolt, Planday, Favrit)
- **Pain:** Too many systems, manual work, expensive commissions
- **Goal:** More revenue, less work, better insights

### Secondary User: Restaurant Manager
- **Uses:** Daily operations (orders, staff, inventory)
- **Needs:** Simple, fast, reliable tools

### Tertiary User: Kitchen Staff
- **Uses:** Kitchen Display System
- **Needs:** Clear orders, zero mistakes

---

## 🏗️ SYSTEM ARCHITECTURE

### Tech Stack
- **Backend:** Node.js + TypeScript + NestJS
- **Database:** PostgreSQL + Redis
- **ORM:** Prisma
- **Frontend:** React + TypeScript + Vite
- **API:** REST + WebSocket
- **Queue:** BullMQ
- **AI:** OpenAI GPT-4 + custom models
- **Hosting:** AWS (EC2/ECS, RDS, S3, CloudFront)

### Modules (11 total)
1. Order Aggregation
2. Review Management
3. Analytics Dashboard
4. Online Ordering
5. Menu Management
6. POS Integration
7. Delivery Integration
8. Accounting Integration
9. Staff Scheduling
10. Inventory Management
11. Customer Loyalty

---

## 📦 MODULE 1: ORDER AGGREGATION

### Overview
Aggregate orders from all sources into one unified interface.

### Data Sources
- Wolt (API)
- Foodora (API)
- Own online ordering
- Manual orders (phone, walk-in)

### Features
- Real-time order fetching (webhooks preferred, polling fallback)
- Unified order format (normalize from all sources)
- Order status sync (accept, ready, completed)
- Prep time management
- Order filtering/search
- Order history

### Database Schema
```prisma
model Order {
  id              String   @id @default(uuid())
  restaurantId    String
  externalId      String?  // ID from Wolt/Foodora
  source          String   // 'wolt', 'foodora', 'direct', 'manual'
  orderType       String   // 'delivery', 'pickup', 'dinein'
  
  // Customer info
  customerName    String?
  customerPhone   String?
  customerEmail   String?
  deliveryAddress String?
  
  // Order details
  items           OrderItem[]
  totalAmount     Float
  subtotal        Float
  deliveryFee     Float?
  commissionAmount Float?
  netRevenue      Float
  
  // Status
  status          String   // 'new', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'
  acceptedAt      DateTime?
  readyAt         DateTime?
  completedAt     DateTime?
  
  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([restaurantId, status])
  @@index([restaurantId, createdAt])
}

model OrderItem {
  id          String   @id @default(uuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id])
  
  name        String
  quantity    Int
  price       Float
  modifiers   Json?    // Array of modifiers
  notes       String?
  
  createdAt   DateTime @default(now())
}
```

### API Endpoints
```typescript
GET    /api/orders                    // List orders
GET    /api/orders/:id                // Get order details
POST   /api/orders                    // Create order (manual)
PATCH  /api/orders/:id/status         // Update status
POST   /api/orders/:id/accept         // Accept order
POST   /api/orders/:id/ready          // Mark ready
POST   /api/orders/:id/complete       // Complete order
POST   /api/orders/:id/cancel         // Cancel order
```

### WebSocket Events
```typescript
// Client subscribes
ws.emit('subscribe', { restaurantId });

// Server pushes
ws.emit('order.new', order);
ws.emit('order.updated', order);
ws.emit('order.cancelled', order);
```

### Business Logic
```typescript
class OrderService {
  // Fetch orders from Wolt
  async fetchWoltOrders(restaurantId: string): Promise<Order[]>
  
  // Fetch orders from Foodora
  async fetchFoodoraOrders(restaurantId: string): Promise<Order[]>
  
  // Normalize order (convert Wolt/Foodora format to our format)
  normalizeOrder(externalOrder: any, source: string): Order
  
  // Accept order (send confirmation to platform)
  async acceptOrder(orderId: string, prepTimeMinutes: number): Promise<void>
  
  // Update order status (sync to platform)
  async updateOrderStatus(orderId: string, status: string): Promise<void>
  
  // Calculate net revenue (after commissions)
  calculateNetRevenue(order: Order): number
}
```

### Integration Specifications

#### Wolt API
- **Base URL:** `https://restaurant-api.wolt.com/v1`
- **Auth:** API Key (header: `Authorization: Bearer <token>`)
- **Webhook:** Order created, updated, cancelled
- **Rate Limit:** 100 req/min

#### Foodora API
- **Base URL:** `https://api.foodora.com/v1`
- **Auth:** OAuth 2.0
- **Webhook:** Order events
- **Rate Limit:** 60 req/min

### Success Criteria
- ✅ All orders visible in < 10 seconds
- ✅ 99.9% webhook delivery (fallback to polling)
- ✅ Zero missed orders
- ✅ Order status synced within 30 seconds

---

## 📦 MODULE 2: REVIEW MANAGEMENT

### Overview
Aggregate reviews from all platforms, AI-generate responses.

### Data Sources
- Google Reviews (API)
- Facebook (API)
- Wolt app reviews
- Foodora app reviews

### Features
- Fetch reviews daily (cron)
- Sentiment analysis (positive, neutral, negative)
- AI-generated responses (GPT-4)
- Manual review/edit of AI responses
- Auto-publish or manual approval
- Review analytics (average rating, trends)

### Database Schema
```prisma
model Review {
  id              String   @id @default(uuid())
  restaurantId    String
  
  // Source
  source          String   // 'google', 'facebook', 'wolt', 'foodora'
  externalId      String
  
  // Content
  customerName    String
  rating          Int      // 1-5
  text            String?
  reviewDate      DateTime
  
  // AI Response
  aiResponse      String?
  aiGeneratedAt   DateTime?
  responseStatus  String   // 'pending', 'approved', 'published', 'rejected'
  publishedAt     DateTime?
  
  // Sentiment
  sentiment       String?  // 'positive', 'neutral', 'negative'
  sentimentScore  Float?   // 0-1
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([source, externalId])
  @@index([restaurantId, rating])
}
```

### API Endpoints
```typescript
GET    /api/reviews                   // List reviews
GET    /api/reviews/:id               // Get review
POST   /api/reviews/:id/generate      // Generate AI response
POST   /api/reviews/:id/approve       // Approve response
POST   /api/reviews/:id/publish       // Publish response
PATCH  /api/reviews/:id/response      // Edit response
```

### Business Logic
```typescript
class ReviewService {
  // Fetch reviews from Google
  async fetchGoogleReviews(restaurantId: string): Promise<Review[]>
  
  // Analyze sentiment
  async analyzeSentiment(text: string): Promise<{ sentiment: string; score: number }>
  
  // Generate AI response
  async generateResponse(review: Review): Promise<string>
  
  // Publish response to platform
  async publishResponse(reviewId: string): Promise<void>
}

class AIResponseGenerator {
  async generateReviewResponse(review: Review): Promise<string> {
    const prompt = `Generate a professional review response.

Restaurant context: ${review.restaurant.name}
Review: "${review.text}"
Rating: ${review.rating}/5

Guidelines:
- If rating >= 4: Thank them warmly, invite back
- If rating < 4: Apologize, explain if possible, offer solution
- Personalize (mention specific feedback)
- Keep under 100 words
- Professional but friendly tone`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a professional restaurant manager.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    return response.choices[0].message.content;
  }
}
```

### Success Criteria
- ✅ All reviews fetched daily
- ✅ AI response generated in < 10 seconds
- ✅ 90%+ responses approved without edits
- ✅ Review response rate > 80%

---

## 📦 MODULE 3: ANALYTICS DASHBOARD

### Overview
Real-time analytics and business intelligence.

### Features
- Revenue analytics (today, week, month, year)
- Order volume trends
- Average order value (AOV)
- Revenue by source (Wolt, Foodora, direct)
- Top selling items
- Customer analytics (new vs returning)
- Commission tracking
- Labor cost % (if Planday connected)
- Predictive forecasting (AI)

### Database Schema
```prisma
model DailyMetrics {
  id              String   @id @default(uuid())
  restaurantId    String
  date            DateTime @db.Date
  
  // Revenue
  totalRevenue    Float
  netRevenue      Float
  commissions     Float
  
  // Orders
  totalOrders     Int
  avgOrderValue   Float
  
  // By source
  revenueBySource Json     // { wolt: 10000, foodora: 5000, direct: 3000 }
  ordersBySource  Json
  
  // Orders by hour
  ordersByHour    Int[]    // Array of 24 integers
  
  // Top items
  topItems        Json     // [{ name, quantity, revenue }]
  
  // Customer metrics
  newCustomers    Int
  returningCustomers Int
  
  createdAt       DateTime @default(now())
  
  @@unique([restaurantId, date])
  @@index([restaurantId, date])
}
```

### API Endpoints
```typescript
GET    /api/analytics/metrics         // Get metrics (date range)
GET    /api/analytics/revenue         // Revenue breakdown
GET    /api/analytics/orders          // Order analytics
GET    /api/analytics/customers       // Customer analytics
GET    /api/analytics/forecast        // AI forecast (next 7 days)
```

### Business Logic
```typescript
class AnalyticsService {
  // Calculate daily metrics (run at midnight)
  async calculateDailyMetrics(restaurantId: string, date: Date): Promise<DailyMetrics>
  
  // Get revenue trend
  async getRevenueTrend(restaurantId: string, startDate: Date, endDate: Date): Promise<any[]>
  
  // Get top items
  async getTopItems(restaurantId: string, limit: number): Promise<any[]>
  
  // Forecast next 7 days (AI)
  async forecastRevenue(restaurantId: string): Promise<any[]>
}

class Forecaster {
  async forecast(restaurantId: string, days: number = 7): Promise<any[]> {
    // Get historical data (last 12 weeks)
    const historical = await this.getHistoricalData(restaurantId);
    
    // Simple moving average + seasonality
    const forecast = [];
    
    for (let i = 0; i < days; i++) {
      const dayOfWeek = (new Date().getDay() + i) % 7;
      const avgForDayOfWeek = this.calculateAverage(historical, dayOfWeek);
      const trend = this.calculateTrend(historical);
      
      forecast.push({
        date: addDays(new Date(), i),
        predictedRevenue: avgForDayOfWeek + trend * i,
        predictedOrders: Math.round(avgForDayOfWeek / this.avgOrderValue),
        confidence: this.calculateConfidence(historical)
      });
    }
    
    return forecast;
  }
}
```

### Cron Jobs
```typescript
// Calculate daily metrics at midnight
cron.schedule('0 0 * * *', async () => {
  const restaurants = await prisma.restaurant.findMany();
  const yesterday = subDays(new Date(), 1);
  
  for (const restaurant of restaurants) {
    await analyticsService.calculateDailyMetrics(restaurant.id, yesterday);
  }
});
```

### Success Criteria
- ✅ Metrics updated daily (midnight)
- ✅ Dashboard loads in < 2 seconds
- ✅ Forecast accuracy within 20% of actual
- ✅ Real-time revenue updates (via WebSocket)

---

## 📦 MODULE 4: ONLINE ORDERING

### Overview
White-label online ordering system (own website).

### Features
- Custom domain (e.g., restaurant.no/order)
- Mobile-optimized ordering flow
- Menu display with photos
- Shopping cart
- Checkout (Vipps, Stripe)
- Order confirmation (email/SMS)
- Order tracking
- QR code menu (for dine-in)

### Database Schema
```prisma
model OnlineOrder {
  id              String   @id @default(uuid())
  restaurantId    String
  
  // Links to main Order table
  orderId         String   @unique
  order           Order    @relation(fields: [orderId], references: [id])
  
  // Payment
  paymentMethod   String   // 'vipps', 'stripe', 'cash'
  paymentStatus   String   // 'pending', 'paid', 'failed'
  paymentIntentId String?  // Stripe/Vipps ID
  
  createdAt       DateTime @default(now())
}
```

### API Endpoints (Public - No Auth)
```typescript
GET    /public/restaurants/:slug      // Get restaurant info
GET    /public/restaurants/:slug/menu // Get menu
POST   /public/orders                 // Create order
GET    /public/orders/:id             // Order status
```

### Business Logic
```typescript
class OnlineOrderingService {
  // Create order from online ordering
  async createOrder(data: CreateOrderDto): Promise<Order> {
    // 1. Validate menu items
    // 2. Calculate total
    // 3. Create order (status: pending_payment)
    // 4. Initiate payment (Vipps/Stripe)
    // 5. Return payment URL
  }
  
  // Handle payment webhook
  async handlePaymentWebhook(provider: string, payload: any): Promise<void> {
    // 1. Verify webhook signature
    // 2. Update order status
    // 3. Send to kitchen (if paid)
    // 4. Send confirmation email/SMS
  }
}
```

### Payment Integration

#### Vipps
- Initiate payment
- Webhook on payment complete
- Refund support

#### Stripe
- Checkout session
- Webhook on payment success
- Refund support

### Success Criteria
- ✅ Order placed in < 2 minutes
- ✅ Payment success rate > 95%
- ✅ Mobile-optimized (Lighthouse score > 90)
- ✅ Order confirmed within 30 seconds of payment

---

## 📦 MODULE 5: MENU MANAGEMENT

### Overview
Centralized menu management, sync to all channels.

### Features
- Create/edit categories
- Create/edit items (name, price, description, image)
- Modifiers (add-ons, options)
- Availability management (in stock / sold out)
- Channel-specific pricing (Wolt price vs direct price)
- Sync to Wolt, Foodora, online ordering

### Database Schema
```prisma
model MenuCategory {
  id              String   @id @default(uuid())
  restaurantId    String
  
  name            String
  description     String?
  displayOrder    Int
  active          Boolean  @default(true)
  
  items           MenuItem[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([restaurantId, active])
}

model MenuItem {
  id              String   @id @default(uuid())
  restaurantId    String
  categoryId      String
  category        MenuCategory @relation(fields: [categoryId], references: [id])
  
  name            String
  description     String?
  basePrice       Float
  costOfGoods     Float?   // For profitability calc
  
  imageUrl        String?
  dietaryTags     String[] // ['vegetarian', 'vegan', 'gluten-free']
  allergens       String[]
  
  available       Boolean  @default(true)
  displayOrder    Int
  active          Boolean  @default(true)
  
  modifiers       MenuItemModifier[]
  variants        MenuItemVariant[]
  channelPricing  MenuChannelPricing[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([restaurantId, categoryId, active])
}

model MenuItemModifier {
  id              String   @id @default(uuid())
  itemId          String
  item            MenuItem @relation(fields: [itemId], references: [id])
  
  groupName       String   // "Size", "Toppings", "Sauce"
  required        Boolean  @default(false)
  multiSelect     Boolean  @default(false)
  options         Json     // [{ name, price }]
  
  createdAt       DateTime @default(now())
}

model MenuChannelPricing {
  id              String   @id @default(uuid())
  itemId          String
  item            MenuItem @relation(fields: [itemId], references: [id])
  
  channel         String   // 'wolt', 'foodora', 'direct'
  price           Float
  
  @@unique([itemId, channel])
}
```

### API Endpoints
```typescript
// Categories
GET    /api/menu/categories           // List categories
POST   /api/menu/categories           // Create category
PATCH  /api/menu/categories/:id       // Update category
DELETE /api/menu/categories/:id       // Delete category

// Items
GET    /api/menu/items                // List items
POST   /api/menu/items                // Create item
PATCH  /api/menu/items/:id            // Update item
DELETE /api/menu/items/:id            // Delete item
PATCH  /api/menu/items/:id/availability // Toggle availability

// Sync
POST   /api/menu/sync                 // Sync to all channels
POST   /api/menu/sync/:channel        // Sync to specific channel
```

### Business Logic
```typescript
class MenuSyncService {
  // Sync menu to all channels
  async syncToAllChannels(restaurantId: string): Promise<void> {
    const menu = await this.getFullMenu(restaurantId);
    
    await Promise.all([
      this.syncToWolt(restaurantId, menu),
      this.syncToFoodora(restaurantId, menu),
      this.syncToOnlineOrdering(restaurantId, menu)
    ]);
  }
  
  // Transform to Wolt format
  async syncToWolt(restaurantId: string, menu: Menu): Promise<void> {
    const woltMenu = this.transformToWoltFormat(menu);
    await wolt.updateMenu(restaurantId, woltMenu);
  }
}
```

### Success Criteria
- ✅ Menu sync completes in < 30 seconds
- ✅ 100% sync success rate (or alert on failure)
- ✅ Changes reflected on all channels within 5 minutes

---

## 📦 MODULE 6: POS INTEGRATION

### Overview
Integrate with Norwegian POS systems (Favrit, Zettle, NanoPOS).

### Supported POS Systems
1. **Favrit** (priority - Kim uses this!)
2. **Zettle** (PayPal)
3. **NanoPOS** (UniTouch)

### Features
- Fetch transactions (sales)
- Sync menu (bidirectional)
- Real-time sales data
- Payment reconciliation

### Database Schema
```prisma
model POSIntegration {
  id              String   @id @default(uuid())
  restaurantId    String   @unique
  
  posType         String   // 'favrit', 'zettle', 'nanopos'
  credentials     String   // Encrypted JSON
  
  status          String   // 'connected', 'disconnected', 'error'
  lastSyncAt      DateTime?
  errorMessage    String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model POSTransaction {
  id              String   @id @default(uuid())
  restaurantId    String
  
  externalId      String
  posType         String
  
  totalAmount     Float
  paymentMethod   String
  items           Json
  
  transactionDate DateTime
  syncedAt        DateTime @default(now())
  
  @@unique([posType, externalId])
  @@index([restaurantId, transactionDate])
}
```

### API Endpoints
```typescript
POST   /api/pos/connect               // Connect POS
GET    /api/pos/status                // Check connection
POST   /api/pos/sync                  // Manual sync
POST   /api/pos/disconnect            // Disconnect
```

### Business Logic
```typescript
class FavritIntegration {
  async connect(credentials: FavritCredentials): Promise<void> {
    // Test connection
    const response = await fetch(`${FAVRIT_API}/venues/${credentials.venueId}`, {
      headers: { Authorization: `Bearer ${credentials.apiKey}` }
    });
    
    if (!response.ok) throw new Error('Connection failed');
  }
  
  async fetchTransactions(startDate: Date, endDate: Date): Promise<POSTransaction[]> {
    const response = await fetch(
      `${FAVRIT_API}/venues/${this.venueId}/transactions?start=${startDate}&end=${endDate}`
    );
    
    const data = await response.json();
    return data.transactions.map(tx => this.normalizeTransaction(tx));
  }
}
```

### Cron Jobs
```typescript
// Sync POS transactions every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  const integrations = await prisma.pOSIntegration.findMany({
    where: { status: 'connected' }
  });
  
  for (const integration of integrations) {
    await posService.syncTransactions(integration.restaurantId);
  }
});
```

### Success Criteria
- ✅ Connection established in < 1 minute
- ✅ Transaction sync every 15 minutes
- ✅ 100% transaction accuracy (match POS exactly!)

---

## 📦 MODULES 7-11: SPECIFICATIONS

(Similar detailed specs for remaining modules...)

### Module 7: Delivery Integration
- Wolt API (orders, menu sync)
- Foodora API (orders, menu sync)
- Auto-accept orders
- Commission tracking

### Module 8: Accounting Integration
- Tripletex API
- Fiken API
- Daily transaction sync
- VAT calculation
- Reports (P&L, balance sheet)

### Module 9: Staff Scheduling
- Planday API (read-only)
- Display schedule
- Labor cost tracking
- Demand-based recommendations

### Module 10: Inventory Management
- Ingredient tracking
- Recipe management
- Auto-deduct on order
- Reorder alerts
- Waste tracking

### Module 11: Customer Loyalty
- Points system
- Tiered rewards
- Referral program
- Personalized offers (AI)
- Birthday rewards

---

## 🔒 SECURITY & COMPLIANCE

### Authentication
- JWT tokens (access + refresh)
- Role-based access control (RBAC)
- Multi-factor authentication (optional)

### Data Security
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- API credentials encrypted (KMS)
- Regular security audits

### GDPR Compliance
- Data minimization
- Right to be forgotten
- Data portability
- Consent management

### Monitoring
- Error tracking (Sentry)
- Performance monitoring (Datadog)
- Uptime monitoring (Pingdom)
- Log aggregation (CloudWatch)

---

## 📈 SUCCESS METRICS

### Technical KPIs
- API response time: < 200ms (p95)
- Uptime: > 99.9%
- Error rate: < 0.1%
- Webhook delivery: > 99%

### Business KPIs
- Customer onboarding: < 15 minutes
- Data accuracy: 100% (vs source systems)
- Support tickets: < 5% of customers/month
- NPS: > 60

---

## 🚀 IMPLEMENTATION PHASES

### Phase 1: MVP (Month 1-3)
- Module 1: Order Aggregation ✅
- Module 5: Menu Management ✅
- Module 4: Online Ordering ✅
- Kitchen Display System ✅
- Basic Dashboard ✅

**Goal:** 10 paying customers

### Phase 2: Growth (Month 4-6)
- Module 6: POS Integration (Favrit) ✅
- Module 2: Review Management ✅
- Module 3: Analytics (advanced) ✅

**Goal:** 50 customers

### Phase 3: Scale (Month 7-12)
- Module 7: Delivery Integration ✅
- Module 8: Accounting Integration ✅
- Module 9: Staff Scheduling ✅
- Module 10: Inventory Management ✅
- Module 11: Customer Loyalty ✅

**Goal:** 100+ customers

---

**End of PRD**
