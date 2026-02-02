# 🏗️ SYSTEM ARCHITECTURE

**Restaurant Autopilot Pro - Technical Architecture**

---

## 📊 HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Dashboard   │  │     KDS      │  │   Ordering   │         │
│  │   (React)    │  │   (React)    │  │  (Next.js)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                 │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API GATEWAY   │
                    │   (Kong/AWS)    │
                    └────────┬────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                    BACKEND LAYER                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│          ┌──────────────────────────────────┐                   │
│          │      NestJS Application          │                   │
│          │      (API + Business Logic)      │                   │
│          └──────────────┬───────────────────┘                   │
│                         │                                        │
│    ┌────────────────────┼────────────────────┐                  │
│    │                    │                    │                  │
│    ▼                    ▼                    ▼                  │
│ ┌─────────┐      ┌──────────┐        ┌──────────┐             │
│ │ Orders  │      │ Reviews  │  ...   │ Loyalty  │             │
│ │ Module  │      │ Module   │        │ Module   │             │
│ └─────────┘      └──────────┘        └──────────┘             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
┌─────────────────┐  ┌─────────────┐  ┌─────────────┐
│   PostgreSQL    │  │    Redis    │  │   BullMQ    │
│  (Primary DB)   │  │   (Cache)   │  │   (Queue)   │
└─────────────────┘  └─────────────┘  └─────────────┘

┌────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                        │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   Wolt   │  │ Foodora  │  │  Favrit  │  │ Planday  │      │
│  │   API    │  │   API    │  │   API    │  │   API    │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │Tripletex │  │  Vipps   │  │  Stripe  │  │ OpenAI   │      │
│  │   API    │  │   API    │  │   API    │  │   API    │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ DATABASE SCHEMA

**Prisma Schema Structure:**

```prisma
// Core Models
model Restaurant
model User

// Module 1: Orders
model Order
model OrderItem

// Module 2: Reviews
model Review

// Module 3: Analytics
model DailyMetrics

// Module 5: Menu
model MenuCategory
model MenuItem
model MenuItemModifier
model MenuChannelPricing

// Module 6: POS
model POSIntegration
model POSTransaction

// Module 7: Delivery
model DeliveryIntegration

// Module 8: Accounting
model AccountingIntegration
model AccountingSyncLog

// Module 9: Staff
model StaffSchedule (cached from Planday)

// Module 10: Inventory
model Ingredient
model Recipe
model InventoryAdjustment
model WasteLog

// Module 11: Loyalty
model LoyaltyCustomer
model LoyaltyTransaction
model LoyaltyReward
```

**Key Relationships:**
```
Restaurant (1) ─── (N) Order
Restaurant (1) ─── (N) MenuItem
Restaurant (1) ─── (1) POSIntegration
Order (1) ─── (N) OrderItem
MenuItem (1) ─── (N) Recipe (N) ─── (1) Ingredient
```

---

## 🔄 DATA FLOW EXAMPLES

### Example 1: New Order from Wolt

```
1. Wolt → Webhook → API Gateway
   POST /webhooks/wolt/order
   
2. API Gateway → Orders Module
   OrdersController.handleWoltWebhook()
   
3. Orders Module → Database
   OrdersService.createOrder()
   → Prisma.order.create()
   
4. Orders Module → Event Emitter
   EventEmitter.emit('order.new', order)
   
5. Event → WebSocket Server
   WebSocketGateway.broadcast('order.new', order)
   
6. WebSocket → KDS Frontend
   KDS displays new order
   
7. Event → Inventory Module (if connected)
   InventoryService.deductStock(order)
```

### Example 2: AI Review Response

```
1. Cron Job → Reviews Module
   ReviewsService.fetchNewReviews()
   
2. Reviews Module → Google API
   Fetch new reviews from Google
   
3. Reviews Module → Database
   Save reviews to DB
   
4. Reviews Module → AI Service
   AIService.generateResponse(review)
   
5. AI Service → OpenAI API
   Generate response with GPT-4
   
6. AI Service → Reviews Module
   Return generated response
   
7. Reviews Module → Database
   Save AI response (status: pending approval)
   
8. Reviews Module → Notification
   Notify owner: "3 new reviews need approval"
   
9. Owner approves → Reviews Module
   ReviewsService.publishResponse(reviewId)
   
10. Reviews Module → Google API
    Publish response to Google
```

---

## 🔌 MODULE INDEPENDENCE

**Key Principle: Modules don't depend on each other directly!**

### ✅ GOOD: Event-driven communication

```typescript
// Orders Module
class OrdersService {
  async completeOrder(id: string) {
    const order = await this.updateStatus(id, 'COMPLETED');
    
    // Emit event (other modules can listen)
    this.eventEmitter.emit('order.completed', order);
    
    return order;
  }
}

// Inventory Module (separate, independent)
class InventoryService {
  @OnEvent('order.completed')
  async handleOrderCompleted(order: Order) {
    // This module listens, but Orders module doesn't know about it!
    await this.deductStock(order);
  }
}
```

### ❌ BAD: Direct dependency

```typescript
// Orders Module
class OrdersService {
  constructor(
    private inventoryService: InventoryService // ❌ Direct dependency!
  ) {}

  async completeOrder(id: string) {
    const order = await this.updateStatus(id, 'COMPLETED');
    
    // ❌ Tightly coupled!
    await this.inventoryService.deductStock(order);
    
    return order;
  }
}
```

**Why events are better:**
- Modules can be developed independently
- Easy to add new modules (just listen to events)
- Easy to disable modules (stop listening)
- No circular dependencies

---

## 🌐 API STRUCTURE

### REST API Convention

```
/api/{module}/{resource}/{action}
```

**Examples:**
```
GET    /api/orders                      # List all orders
GET    /api/orders/:id                  # Get one order
POST   /api/orders                      # Create order
PATCH  /api/orders/:id                  # Update order
DELETE /api/orders/:id                  # Delete order

POST   /api/orders/:id/accept           # Custom action
POST   /api/orders/:id/complete         # Custom action

GET    /api/menu/items                  # Menu items
POST   /api/menu/sync                   # Sync menu

GET    /api/reviews                     # Reviews
POST   /api/reviews/:id/generate        # Generate AI response
```

### WebSocket Events

```typescript
// Client → Server
socket.emit('subscribe', { restaurantId });
socket.emit('order.accept', { orderId, prepTime });

// Server → Client
socket.on('order.new', (order) => { /* handle */ });
socket.on('order.updated', (order) => { /* handle */ });
socket.on('order.cancelled', (order) => { /* handle */ });
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### JWT Flow

```
1. User logs in
   POST /api/auth/login
   { email, password }

2. Server validates credentials
   → Generate JWT (access token + refresh token)

3. Client stores tokens
   localStorage.setItem('accessToken', token)

4. Client sends token in headers
   Authorization: Bearer <accessToken>

5. Server validates token
   → Extract user ID & role
   → Check permissions
```

### Role-Based Access Control (RBAC)

```typescript
enum Role {
  OWNER = 'OWNER',           // Full access
  MANAGER = 'MANAGER',       // Most features, no billing
  STAFF = 'STAFF',           // View orders only
  KITCHEN = 'KITCHEN',       // KDS only
}

// Protect routes with guards
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER, Role.MANAGER)
@Get('/api/analytics')
async getAnalytics() {
  // Only accessible by OWNER or MANAGER
}
```

---

## 📦 CACHING STRATEGY

**What to cache:**
- Menu items (TTL: 1 hour, invalidate on update)
- Daily analytics (TTL: 24 hours)
- Restaurant settings (TTL: 1 hour)
- Customer profiles (TTL: 1 hour)

**What NOT to cache:**
- Orders (real-time data!)
- Review responses (must be fresh)

```typescript
// Example: Caching menu items
async getMenu(restaurantId: string): Promise<Menu> {
  const cacheKey = `menu:${restaurantId}`;
  
  // Check cache first
  const cached = await this.redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Cache miss → fetch from DB
  const menu = await this.prisma.menuCategory.findMany({
    where: { restaurantId },
    include: { items: true },
  });
  
  // Store in cache (1 hour TTL)
  await this.redis.setex(cacheKey, 3600, JSON.stringify(menu));
  
  return menu;
}

// Invalidate cache on update
async updateMenuItem(id: string, data: any) {
  const item = await this.prisma.menuItem.update({
    where: { id },
    data,
  });
  
  // Invalidate cache
  await this.redis.del(`menu:${item.restaurantId}`);
  
  return item;
}
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### 1. Database Indexes

```prisma
model Order {
  // ... fields

  @@index([restaurantId, status])        // Fast filtering
  @@index([restaurantId, createdAt])     // Fast date range queries
  @@index([customerPhone])                // Fast customer lookup
}
```

### 2. Eager Loading (avoid N+1)

```typescript
// ✅ Good - Single query
const orders = await prisma.order.findMany({
  include: { items: true },  // Eager load items
});

// ❌ Bad - N+1 queries
const orders = await prisma.order.findMany();
for (const order of orders) {
  order.items = await prisma.orderItem.findMany({ where: { orderId: order.id } });
}
```

### 3. Pagination

```typescript
async findAll(page: number = 1, limit: number = 50) {
  return this.prisma.order.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}
```

### 4. Background Jobs (BullMQ)

```typescript
// Don't block the request!
@Post('/api/orders')
async createOrder(@Body() data: CreateOrderDto) {
  const order = await this.ordersService.create(data);
  
  // Send confirmation email in background
  await this.emailQueue.add('send-order-confirmation', {
    orderId: order.id,
    customerEmail: order.customerEmail,
  });
  
  return order; // Return immediately, don't wait for email
}
```

---

## 🚨 ERROR HANDLING & MONITORING

### Error Logging

```typescript
import { Logger } from '@nestjs/common';

class OrdersService {
  private logger = new Logger(OrdersService.name);

  async createOrder(data: CreateOrderDto) {
    try {
      this.logger.log(`Creating order for restaurant ${data.restaurantId}`);
      const order = await this.prisma.order.create({ data });
      this.logger.log(`Order created: ${order.id}`);
      return order;
    } catch (error) {
      this.logger.error(
        `Failed to create order: ${error.message}`,
        error.stack
      );
      
      // Send to Sentry for monitoring
      Sentry.captureException(error);
      
      throw error;
    }
  }
}
```

### Health Checks

```typescript
@Controller('/health')
export class HealthController {
  @Get()
  async check() {
    return {
      status: 'ok',
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'healthy';
    } catch {
      return 'unhealthy';
    }
  }
}
```

---

## 🔒 SECURITY MEASURES

### 1. Input Validation
- All DTOs use `class-validator`
- SQL injection prevented (Prisma ORM)

### 2. Authentication
- JWT tokens (short-lived access + long-lived refresh)
- Secure password hashing (bcrypt)

### 3. API Rate Limiting
```typescript
@UseGuards(ThrottlerGuard)
@Controller('/api/orders')
// Max 100 requests per minute
```

### 4. CORS Configuration
```typescript
app.enableCors({
  origin: ['https://dashboard.restos.pro', 'https://order.restos.pro'],
  credentials: true,
});
```

### 5. Environment Variables
- Never commit secrets
- Use `.env` files (not in git)
- Validate on startup

---

## 📈 SCALABILITY PLAN

### Phase 1: Single Server (0-100 customers)
- 1 EC2 instance (t3.medium)
- 1 RDS PostgreSQL (db.t3.small)
- 1 ElastiCache Redis (cache.t3.micro)

**Cost:** ~$150/month

### Phase 2: Load Balanced (100-500 customers)
- 3 EC2 instances (behind load balancer)
- RDS PostgreSQL (db.t3.medium)
- Redis Cluster (3 nodes)

**Cost:** ~$500/month

### Phase 3: Auto-Scaling (500-1000 customers)
- Auto-scaling group (2-10 instances)
- RDS PostgreSQL (db.m5.large)
- Redis Cluster (5 nodes)
- CloudFront CDN

**Cost:** ~$1500/month

### Phase 4: Microservices (1000+ customers)
- ECS/Fargate (containerized services)
- Multi-region (EU + US)
- Read replicas for analytics
- S3 for file storage

**Cost:** ~$5000/month

---

## 🧪 TESTING STRATEGY

### Unit Tests
- Test all services
- Mock Prisma client
- Coverage > 80%

### Integration Tests
- Test API endpoints (e2e)
- Use test database
- Reset between tests

### Load Tests
- Simulate 1000 concurrent users
- Target: < 200ms response time
- Use k6 or Artillery

---

## 📦 DEPLOYMENT STRATEGY

### Development
```bash
npm run start:dev  # Local development with hot reload
```

### Staging
```bash
npm run build
npm run start:prod  # Deployed to staging server
```

### Production
```bash
# Build Docker image
docker build -t restos-api .

# Push to ECR
docker push restos-api:latest

# Deploy to ECS
aws ecs update-service --cluster prod --service restos-api
```

### CI/CD Pipeline (GitHub Actions)
```yaml
1. Run tests
2. Build Docker image
3. Push to ECR
4. Deploy to ECS
5. Run smoke tests
6. Notify on Slack
```

---

## 🎯 MONITORING & ALERTING

### Metrics to Track
- **Performance:** Response time (p50, p95, p99)
- **Errors:** Error rate (< 0.1%)
- **Availability:** Uptime (> 99.9%)
- **Business:** Orders/hour, Revenue/day

### Alerts
- **Critical:** Database down, API down
- **Warning:** High error rate, slow queries
- **Info:** New deployment, high traffic

### Tools
- **APM:** Datadog
- **Errors:** Sentry
- **Logs:** CloudWatch
- **Uptime:** Pingdom

---

**This architecture is designed to scale from 10 to 10,000 customers! 🚀**
