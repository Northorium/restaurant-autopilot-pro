# 🚀 HOW TO START BUILDING

**Step-by-step guide to build Restaurant Autopilot Pro with Cursor AI**

---

## ✅ PREREQUISITES

Before starting, ensure you have:

- [x] **Node.js 18+** installed
- [x] **PostgreSQL** installed locally (or use Docker)
- [x] **Redis** installed locally (or use Docker)
- [x] **Git** installed
- [x] **Cursor IDE** (or VS Code with Cursor extension)
- [x] **npm** or **pnpm** (recommended)

---

## 📦 STEP 1: PROJECT INITIALIZATION

### 1.1 Create NestJS Project

```bash
# Install NestJS CLI globally
npm install -g @nestjs/cli

# Create new project
npx @nestjs/cli new restaurant-autopilot-api

# Choose package manager: pnpm (recommended for speed)

# Navigate into project
cd restaurant-autopilot-api
```

### 1.2 Install Core Dependencies

```bash
# Prisma (ORM)
npm install @prisma/client
npm install -D prisma

# Redis
npm install redis ioredis
npm install @nestjs/redis

# BullMQ (queue)
npm install @nestjs/bullmq bullmq

# Validation
npm install class-validator class-transformer

# Config
npm install @nestjs/config

# Event emitter
npm install @nestjs/event-emitter

# WebSocket
npm install @nestjs/websockets @nestjs/platform-socket.io

# JWT Auth
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @types/passport-jwt -D

# Bcrypt (password hashing)
npm install bcrypt
npm install @types/bcrypt -D

# OpenAI
npm install openai
```

### 1.3 Initialize Prisma

```bash
# Initialize Prisma
npx prisma init

# This creates:
# - prisma/schema.prisma
# - .env
```

### 1.4 Configure Environment Variables

**Edit `.env`:**
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/restos_dev?schema=public"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# OpenAI
OPENAI_API_KEY="sk-..."

# Wolt API (for testing)
WOLT_API_KEY="your-wolt-api-key"
WOLT_VENUE_ID="your-venue-id"

# Foodora API
FOODORA_API_KEY="your-foodora-key"
```

---

## 📁 STEP 2: PROJECT STRUCTURE SETUP

### 2.1 Create Folder Structure

```bash
cd src

# Create modules folders
mkdir -p modules/orders modules/reviews modules/analytics
mkdir -p modules/menu modules/pos modules/delivery
mkdir -p modules/accounting modules/staff modules/inventory modules/loyalty

# Create shared folders
mkdir -p shared/database shared/events shared/logger shared/auth shared/utils
```

### 2.2 Copy Configuration Files

Copy these files to your project root:
- `.cursorrules` (Cursor AI rules)
- `PRD.md` (Product requirements)
- `ARCHITECTURE.md` (System architecture)

---

## 🗄️ STEP 3: DATABASE SETUP

### 3.1 Define Prisma Schema

**Edit `prisma/schema.prisma`:**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Core Models
model Restaurant {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  email     String
  phone     String?
  address   String?
  
  // Settings
  settings  Json?
  
  // Relations
  orders    Order[]
  menuCategories MenuCategory[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([slug])
}

model User {
  id            String   @id @default(uuid())
  restaurantId  String
  
  email         String   @unique
  passwordHash  String
  firstName     String
  lastName      String
  role          String   // 'OWNER', 'MANAGER', 'STAFF', 'KITCHEN'
  
  active        Boolean  @default(true)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([restaurantId])
  @@index([email])
}

// Module 1: Orders
model Order {
  id              String   @id @default(uuid())
  restaurantId    String
  restaurant      Restaurant @relation(fields: [restaurantId], references: [id])
  
  externalId      String?
  source          String   // 'wolt', 'foodora', 'direct', 'manual'
  orderType       String   // 'delivery', 'pickup', 'dinein'
  
  // Customer
  customerName    String?
  customerPhone   String?
  customerEmail   String?
  deliveryAddress String?
  
  // Order details
  items           OrderItem[]
  totalAmount     Float
  subtotal        Float?
  deliveryFee     Float?
  commissionAmount Float?
  netRevenue      Float?
  
  // Status
  status          String   // 'new', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'
  acceptedAt      DateTime?
  readyAt         DateTime?
  completedAt     DateTime?
  
  // Metadata
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([restaurantId, status])
  @@index([restaurantId, createdAt])
  @@index([customerPhone])
}

model OrderItem {
  id          String   @id @default(uuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  name        String
  quantity    Int
  price       Float
  modifiers   Json?
  notes       String?
  
  createdAt   DateTime @default(now())
  
  @@index([orderId])
}

// Module 5: Menu
model MenuCategory {
  id              String   @id @default(uuid())
  restaurantId    String
  restaurant      Restaurant @relation(fields: [restaurantId], references: [id])
  
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
  costOfGoods     Float?
  
  imageUrl        String?
  dietaryTags     String[]
  allergens       String[]
  
  available       Boolean  @default(true)
  displayOrder    Int
  active          Boolean  @default(true)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([restaurantId, categoryId, active])
}
```

### 3.2 Run Migration

```bash
# Create initial migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

---

## 🏗️ STEP 4: BUILD CORE INFRASTRUCTURE

### 4.1 Create Prisma Module

**Create `src/shared/database/prisma.module.ts`:**

```typescript
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

**Create `src/shared/database/prisma.service.ts`:**

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### 4.2 Update App Module

**Edit `src/app.module.ts`:**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './shared/database/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    // Modules will be added here
  ],
})
export class AppModule {}
```

---

## 🎯 STEP 5: BUILD FIRST MODULE (ORDERS)

### 5.1 Generate Module with NestJS CLI

```bash
# Generate orders module
nest generate module modules/orders
nest generate controller modules/orders
nest generate service modules/orders
```

### 5.2 Create DTOs

**Create `src/modules/orders/dto/create-order.dto.ts`:**

```typescript
import { IsString, IsNotEmpty, IsNumber, Min, IsEnum, IsOptional, IsArray } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @IsEnum(['delivery', 'pickup', 'dinein'])
  orderType: string;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @IsArray()
  items: CreateOrderItemDto[];

  @IsNumber()
  @Min(0)
  totalAmount: number;
}

export class CreateOrderItemDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}
```

### 5.3 Implement Service

**Edit `src/modules/orders/orders.service.ts`:**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(restaurantId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { restaurantId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async create(data: CreateOrderDto): Promise<Order> {
    return this.prisma.order.create({
      data: {
        restaurantId: data.restaurantId,
        source: 'manual',
        orderType: data.orderType,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        totalAmount: data.totalAmount,
        status: 'new',
        items: {
          create: data.items,
        },
      },
      include: { items: true },
    });
  }
}
```

### 5.4 Implement Controller

**Edit `src/modules/orders/orders.controller.ts`:**

```typescript
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from '@prisma/client';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(): Promise<Order[]> {
    // TODO: Get restaurantId from JWT token
    const restaurantId = 'test-restaurant-id';
    return this.ordersService.findAll(restaurantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(createOrderDto);
  }
}
```

---

## 🧪 STEP 6: TEST YOUR API

### 6.1 Start Server

```bash
npm run start:dev
```

Server should start on `http://localhost:3000`

### 6.2 Create Test Restaurant

Use Prisma Studio:
```bash
npx prisma studio
```

Or create via SQL:
```sql
INSERT INTO "Restaurant" (id, name, slug, email)
VALUES ('test-restaurant-id', 'Test Restaurant', 'test-restaurant', 'test@restos.pro');
```

### 6.3 Test API with curl

```bash
# Create order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "test-restaurant-id",
    "orderType": "delivery",
    "customerName": "Kim",
    "customerPhone": "+4712345678",
    "totalAmount": 250,
    "items": [
      {
        "name": "Burger",
        "quantity": 1,
        "price": 150
      },
      {
        "name": "Fries",
        "quantity": 1,
        "price": 50
      }
    ]
  }'

# Get all orders
curl http://localhost:3000/api/orders

# Get one order
curl http://localhost:3000/api/orders/{order-id}
```

---

## 🤖 STEP 7: USE CURSOR AI TO BUILD FASTER

### 7.1 Open Project in Cursor

```bash
# Open in Cursor
cursor .
```

### 7.2 Cursor AI Commands

**Generate new module:**
> "Create a reviews module with CRUD operations. Follow the same pattern as orders module."

**Add feature:**
> "Add status update endpoint to orders controller. Valid statuses: accepted, preparing, ready, completed, cancelled."

**Generate tests:**
> "Write unit tests for OrdersService. Mock Prisma client."

**Fix bugs:**
> "This code throws an error when customer is not found. Fix it and add proper error handling."

### 7.3 Use Cursor Chat

Press `Cmd/Ctrl + L` to open Cursor chat:

```
You: "Create Menu module with categories and items. Follow Prisma schema in schema.prisma."

Cursor: [Generates complete module with controller, service, DTOs]

You: "Add endpoint to sync menu to Wolt API"

Cursor: [Adds sync functionality]
```

---

## 📋 STEP 8: BUILD REMAINING MODULES

### Priority Order (MVP first):

**Phase 1: MVP (Do these first)**
1. ✅ Orders Module (done!)
2. Menu Module (next!)
3. Online Ordering (frontend + API)
4. Kitchen Display System (frontend)
5. Basic Analytics

**Phase 2: Integrations**
6. POS Integration (Favrit)
7. Delivery Integration (Wolt, Foodora)
8. Review Management

**Phase 3: Advanced**
9. Accounting Integration
10. Staff Scheduling
11. Inventory Management
12. Customer Loyalty

### Use Cursor to Generate Each Module

For each module:
1. Create module with `nest generate`
2. Ask Cursor: "Build [module name] following PRD.md specifications"
3. Cursor will generate:
   - Controller
   - Service
   - DTOs
   - Tests
4. Review code, test, commit!

---

## 🎨 STEP 9: BUILD FRONTEND

### 9.1 Create Dashboard App

```bash
# In project root
npm create vite@latest dashboard -- --template react-ts

cd dashboard
npm install

# Install dependencies
npm install @tanstack/react-query axios zustand
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 9.2 Connect to API

**Create API client:**

```typescript
// src/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Create React Query hooks:**

```typescript
// src/api/orders.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from './client';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await apiClient.get('/orders');
      return data;
    },
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (orderData) => {
      const { data } = await apiClient.post('/orders', orderData);
      return data;
    },
  });
}
```

---

## 🚀 STEP 10: DEPLOY (When Ready)

### 10.1 Dockerize API

**Create `Dockerfile`:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### 10.2 Deploy to AWS/Railway/Render

Choose platform:
- **Railway:** Easiest (git push to deploy)
- **Render:** Simple (free tier available)
- **AWS ECS:** Most scalable (but complex)

### 10.3 Set up CI/CD

GitHub Actions example:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: docker build -t restos-api .
      - run: docker push restos-api:latest
```

---

## 📚 USEFUL COMMANDS

```bash
# Development
npm run start:dev          # Start with hot reload

# Database
npx prisma studio          # Open database GUI
npx prisma migrate dev     # Create migration
npx prisma generate        # Generate Prisma client
npx prisma db push         # Push schema without migration

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run integration tests
npm run test:cov           # Test coverage

# Build
npm run build              # Build for production
npm run start:prod         # Run production build

# Code quality
npm run lint               # ESLint
npm run format             # Prettier
```

---

## 🆘 TROUBLESHOOTING

### Problem: "Cannot find module '@prisma/client'"
**Solution:**
```bash
npx prisma generate
```

### Problem: Database connection error
**Solution:**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Try: `psql -U postgres` to test connection

### Problem: Port 3000 already in use
**Solution:**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or change port in main.ts:
await app.listen(3001);
```

### Problem: Cursor AI not following rules
**Solution:**
- Ensure `.cursorrules` is in project root
- Restart Cursor
- In chat, say: "Follow the rules in .cursorrules"

---

## ✅ YOU'RE READY!

**You now have:**
- ✅ Project structure
- ✅ Database setup
- ✅ First module (Orders)
- ✅ API testing
- ✅ Cursor AI configured

**Next steps:**
1. Build Menu module (use Cursor!)
2. Build Online Ordering
3. Get first test customer
4. Iterate based on feedback

**Remember:** Ship fast, iterate faster! 🚀

---

**Questions? Check:**
- PRD.md (product specs)
- ARCHITECTURE.md (technical details)
- .cursorrules (coding standards)

**LET'S BUILD! 💪🦁**
