# 🔍 DELIVERECT + HEAPSGO ANALYSIS - The Real Problem!

**Date:** 2026-02-02  
**Context:** Kim uses Deliverect (valuable!), HeapsGO (wants to replace), + multiple systems  
**Systems:** Heaps, Favrit, Zettle, Wolt  

---

## 🎯 THE REAL PROBLEM: INTEGRATION HELL

**Kim's Current Stack:**
1. **HeapsGO** - Online ordering platform
2. **Favrit** - POS system
3. **Zettle** - Payment processing  
4. **Wolt** - Delivery platform
5. **Deliverect** - AGGREGATES delivery platforms (valuable!)

**Pain Point:** 
→ Too many systems that don't talk to each other  
→ Switching between tablets/apps  
→ Manual work, errors, chaos  

---

## 📊 WHAT IS DELIVERECT?

**Website:** deliverect.com  
**Tagline:** "Omnichannel digital ordering solutions built to scale"  
**Founded:** 2018 (Belgium)  
**Funding:** $65M Series B (2021)  
**Valuation:** ~$300M  

### What They Do:

**Problem:** Restaurants get orders from multiple platforms:
- Uber Eats tablet
- Wolt tablet
- Foodora tablet
- Just Eat tablet
- Own website orders
- Phone orders

**Result:** Tablet hell! 📱📱📱📱📱

**Solution (Deliverect):**
→ **ONE interface for ALL delivery orders**

```
Uber Eats ─┐
Wolt ──────┤
Foodora ───┼─→ DELIVERECT ─→ Your POS/Kitchen
Just Eat ──┤                     (One screen)
Website ───┘
```

### Key Features:

1. **Order Aggregation** (Core!)
   - All orders in one dashboard
   - No more switching tablets
   - Unified order management

2. **Menu Sync**
   - Update menu once → syncs to all platforms
   - No more manual updates on each platform

3. **POS Integration**
   - Orders auto-flow to POS/KDS
   - No manual re-entry

4. **Analytics**
   - Which platform performs best?
   - Commission tracking
   - Performance metrics

5. **Automated Operations**
   - Auto-accept orders
   - Smart routing (kitchen vs. bar)
   - Inventory sync (mark items sold out)

### Pricing (Deliverect):
- €69-199/month (per location)
- OR: Transaction fee model (~1% per order)
- Enterprise: Custom pricing

### Customers:
- 35,000+ restaurants globally
- KFC, Burger King, Five Guys, Little Caesars

---

## 📱 WHAT IS HEAPSGO?

**Website:** heapsgo.com  
**Location:** Norway (Scandinavian focus)  
**Tagline:** "Eie restaurantens salg" (Own your restaurant's sales)

### What They Do:

**Problem:** Restaurants pay 30% commission to Wolt/Foodora  
**Solution:** Build your own online ordering (bypass delivery platforms)

### Key Features:

1. **Online Ordering Website**
   - Custom branded ordering page
   - Menu builder
   - Order management

2. **QR Code Ordering**
   - Customers scan → order on phone
   - No waiter needed
   - Pay via phone

3. **Integrations**
   - Vipps payment
   - POS systems (various)
   - Delivery platforms (for fulfillment)

4. **Own the Customer**
   - Customer data stays with you
   - Email/SMS marketing
   - Loyalty programs

### Pricing (HeapsGO):
- Not public (likely €50-150/month estimate)

### Kim's Take:
> "Skulle heller laget egen kopi"  
→ Not happy with HeapsGO  
→ Wants own solution  

---

## 💡 THE GAP - What RestOS Pro Should Be

**Insight:** Deliverect is valuable → aggregation is valuable!

**What Kim Really Needs:**

### 1. **Order Aggregation** (Deliverect functionality)
**Problem:** Multiple order sources (Wolt, own website, walk-in)  
**Solution:** One unified order view

**Features:**
- Aggregate Wolt, Foodora, own website orders
- Unified kitchen display
- Auto-routing (delivery vs. dine-in)
- Status tracking

**Tech:**
- Wolt API integration
- Foodora API integration
- WebSocket real-time updates
- Kitchen display screen

---

### 2. **Own Online Ordering** (HeapsGO replacement)
**Problem:** HeapsGO not perfect, want own solution  
**Solution:** White-label online ordering

**Features:**
- Custom ordering page (yourrestaurant.no/order)
- QR code menu (scan at table)
- Payment processing (Vipps, card)
- Order to kitchen (instant)

**Tech:**
- React ordering interface
- Stripe + Vipps
- QR code generation
- Kitchen display integration

---

### 3. **POS Integration** (Consolidate Favrit, Zettle, etc.)
**Problem:** Multiple POS systems, data fragmented  
**Solution:** Connect all systems to RestOS

**Integrations:**
- Favrit API
- Zettle API
- NanoPOS API
- Generic POS (if API available)

**Value:**
- All sales data in one place
- Unified reporting
- No manual reconciliation

---

### 4. **Analytics Dashboard** (Deliverect + more)
**Problem:** Can't see full picture (delivery vs. direct)  
**Solution:** Unified analytics

**Features:**
- Revenue by channel (Wolt vs. direct vs. dine-in)
- Commission tracking (how much goes to Wolt?)
- Peak hours (when to staff up?)
- Best sellers (what's working?)

---

## 🎯 RESTROS PRO V1.0 - THE REAL PRODUCT

**Core Value Proposition:**
> "One dashboard for all your orders + sales"

**Not:**
- ❌ Review management (nice to have, but not core pain)
- ❌ 12 modules (too complex)
- ❌ All-in-one (trying to do everything)

**But:**
- ✅ **Order aggregation** (Deliverect for Norway)
- ✅ **Own online ordering** (HeapsGO replacement)
- ✅ **POS integration** (unified data)
- ✅ **Analytics** (which channel is best?)

---

## 🏗️ MVP FEATURES (8 Weeks)

### Week 1-2: **Core System**
- [ ] Authentication
- [ ] Restaurant setup
- [ ] Dashboard layout
- [ ] Database (orders, menu)

### Week 3-4: **Online Ordering**
- [ ] Menu builder (categories, items, modifiers)
- [ ] Customer ordering page
- [ ] QR code generation
- [ ] Cart & checkout (Vipps + Stripe)
- [ ] Order submission

### Week 5-6: **Order Aggregation**
- [ ] Wolt API integration (fetch orders)
- [ ] Foodora API integration (if possible)
- [ ] Unified order view (all sources)
- [ ] Order status management
- [ ] Kitchen display (simple)

### Week 7-8: **Analytics + Polish**
- [ ] Revenue dashboard
- [ ] Sales by channel (Wolt, direct, etc.)
- [ ] Commission calculator ("Wolt cost you kr 15,000 last month")
- [ ] Best sellers
- [ ] UI polish & testing
- [ ] Deploy

---

## 💰 PRICING STRATEGY

**Model:** SaaS + Transaction Fee (like Deliverect)

### Option 1: **Pure SaaS**
- $99/month per location
- Unlimited orders
- All features included

### Option 2: **Transaction Fee** (Recommended!)
- $49/month base
- + 1% per order (vs. 30% Wolt takes!)
- Lower barrier, aligns incentives

**Example:**
- Restaurant: kr 500,000/month revenue
- 60% Wolt (kr 300,000) → Wolt takes kr 90,000 (30%)
- 40% Direct (kr 200,000) → RestOS takes kr 2,000 (1%)
- **RestOS Revenue:** kr 2,000 + kr 490 base = **kr 2,490/month**

**Customer saves:** kr 90,000 vs. all Wolt = HUGE

---

## 🏆 COMPETITIVE POSITIONING

### vs. Deliverect:
| Feature | Deliverect | RestOS Pro |
|---------|------------|------------|
| **Market** | Global | Norway (localized) |
| **Price** | €69-199/month | kr 500-2,000/month |
| **Own Ordering** | ❌ | ✅ (HeapsGO replacement) |
| **POS Integration** | ✅ | ✅ (Norwegian systems) |
| **Language** | English | Norwegian |
| **Support** | Global | Local |

**Advantage:** All-in-one for Norwegian restaurants (Deliverect + HeapsGO + analytics)

---

### vs. HeapsGO:
| Feature | HeapsGO | RestOS Pro |
|---------|---------|------------|
| **Delivery Aggregation** | ❌ | ✅ (Deliverect-like) |
| **Own Ordering** | ✅ | ✅ |
| **POS Integration** | Limited | ✅ (Favrit, Zettle, NanoPOS) |
| **Analytics** | Basic | ✅ Advanced |
| **Customization** | Limited | ✅ (open, modular) |

**Advantage:** More complete, better integrations

---

## 🚀 GO-TO-MARKET

### Target Customer (ICP):

**Profile:**
- Using Deliverect OR frustrated with delivery aggregation
- Using HeapsGO OR wants own online ordering
- 1-5 locations
- kr 5-30M revenue/year
- Tech-savvy (already using multiple systems)

**Pain Points:**
1. "I pay Wolt kr 100,000/month in commissions!"
2. "Switching between 3 tablets is chaos"
3. "HeapsGO is OK but not perfect"
4. "I can't see which channel is actually profitable"

**Our Pitch:**
> "Stop paying 30% to Wolt. Own your orders.  
> One dashboard for Wolt + direct + dine-in.  
> 1% transaction fee vs. 30%."

### Channel Strategy:

#### 1. **Direct Outreach to Deliverect Users**
- Scrape Deliverect case studies (public customers)
- LinkedIn: "Using Deliverect? Try Norwegian alternative"
- Email: "Save 50% on order management"

#### 2. **HeapsGO User Acquisition**
- Offer migration: "Switching from HeapsGO? Free setup!"
- Better features, same price
- No lock-in

#### 3. **Partnership: Favrit/NanoPOS**
- "Works with your POS"
- Co-marketing
- Referral program

---

## 📊 REVENUE PROJECTIONS

**Assumptions:**
- 50 customers Year 1
- Average kr 2,000/month (transaction fees + base)
- 10% monthly growth

**Year 1:**
- Month 6: 20 customers × kr 2,000 = kr 40,000/month
- Month 12: 50 customers × kr 2,000 = kr 100,000/month
- **ARR:** kr 1,200,000 (~$110,000)

**Year 2:**
- 150 customers × kr 2,500 = kr 375,000/month
- **ARR:** kr 4,500,000 (~$420,000)

**Year 3:**
- 300 customers × kr 3,000 = kr 900,000/month
- **ARR:** kr 10,800,000 (~$1M)

---

## 🎯 FINAL RECOMMENDATION

**Build:** "Deliverect for Norway + Own Ordering"

**V1.0 Core Features:**
1. ✅ Online ordering (HeapsGO replacement)
2. ✅ Order aggregation (Wolt, Foodora, direct)
3. ✅ Kitchen display (unified view)
4. ✅ Analytics (channel performance)
5. ✅ POS integration (Favrit, Zettle, NanoPOS)

**Timeline:** 8 weeks to MVP

**Pricing:** kr 490/month base + 1% transaction fee

**Target:** 20 customers by Month 6 (kr 40,000 MRR)

---

## 🤔 NEXT STEPS

**Kim - what do you think?**

1. ✅ Focus on **order aggregation** (Deliverect value)?
2. ✅ Focus on **own online ordering** (HeapsGO replacement)?
3. ✅ **Both** (unified platform)?

**This is the real problem you're solving:**
→ Integration hell (too many systems)  
→ Commission hell (30% to Wolt)  
→ Data fragmentation (can't see full picture)  

**One dashboard. All orders. Own your sales.** 🚀

---

**Shall we build this?** 🦁
