# 🔬 COMPLETE SYSTEM ANALYSIS - Part 4: Final Modules + Strategy

**Continuation of Part 3**

---

## MODULE 8: Accounting Integration 💰

**Business Value:** CRITICAL (Automate bookkeeping!)
**Technical Complexity:** MEDIUM
**AI Opportunity:** LOW

---

### 8.1 Problem Statement

**Current Pain:**
- Manual bookkeeping (export CSV from POS, import to accounting)
- Hours of work at month-end
- Reconciliation errors (missing transactions, duplicates)
- Tax reporting nightmare (moms, VAT, employee taxes)

**Opportunity:**
- Automatic sync (POS + online orders → accounting)
- Real-time financial overview
- One-click tax reports
- Save 10+ hours/month

---

### 8.2 Solution: Multi-Accounting Integration

**Target Systems (Norway):**
1. **Tripletex** (most popular in Norway)
2. **Fiken** (SMB-friendly)
3. **Poweroffice** (established player)
4. **24SevenOffice** (enterprise)

**Features:**

**1. Transaction Sync**
- All sales (POS + online) → accounting entries
- Payment methods mapped to accounts
- VAT/Moms automatically calculated
- Daily reconciliation

**2. Expense Tracking**
- Track purchases (food, supplies)
- Employee wages (from Planday)
- Utilities, rent, etc.

**3. Reports**
- Profit & Loss (P&L)
- Balance sheet
- Cash flow
- Tax reports (VA, RF, etc.)

**4. Bank Reconciliation**
- Match bank transactions to accounting entries
- Flag discrepancies

**5. Payroll Integration**
- Sync with Planday (hours worked)
- Calculate wages, taxes, deductions
- Generate payslips

---

### 8.3 Technical Architecture

**Integration Abstraction:**

```javascript
// Accounting Integration Interface
class AccountingIntegration {
  async connect(credentials) {
    throw new Error('Not implemented');
  }

  async syncTransactions(transactions) {
    throw new Error('Not implemented');
  }

  async getAccounts() {
    throw new Error('Not implemented');
  }

  async getProfitLoss(startDate, endDate) {
    throw new Error('Not implemented');
  }
}

// Tripletex Integration
class TripletexIntegration extends AccountingIntegration {
  constructor(apiToken, employeeId) {
    super();
    this.apiToken = apiToken;
    this.employeeId = employeeId;
    this.baseUrl = 'https://api.tripletex.io/v2';
  }

  async connect() {
    const response = await fetch(`${this.baseUrl}/employee/${this.employeeId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiToken}`
      }
    });
    return response.ok;
  }

  async syncTransactions(transactions) {
    // Transform transactions to Tripletex format
    const vouchers = transactions.map(tx => this.transformToVoucher(tx));

    // Post to Tripletex
    for (const voucher of vouchers) {
      await fetch(`${this.baseUrl}/ledger/voucher`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(voucher)
      });
    }
  }

  transformToVoucher(transaction) {
    // Tripletex voucher format
    return {
      date: transaction.date,
      description: `Sale - Order #${transaction.orderId}`,
      voucherType: 'SALE',
      postings: [
        {
          account: 3000, // Sales account
          amount: transaction.totalAmount,
          debit: false,
          description: 'Sales'
        },
        {
          account: 1920, // Bank/Cash account
          amount: transaction.totalAmount,
          debit: true,
          description: transaction.paymentMethod
        },
        {
          account: 2700, // VAT account
          amount: transaction.totalAmount * 0.25, // 25% VAT
          debit: false,
          description: 'VAT 25%'
        }
      ]
    };
  }

  async getProfitLoss(startDate, endDate) {
    const response = await fetch(
      `${this.baseUrl}/ledger/profitAndLoss?dateFrom=${startDate}&dateTo=${endDate}`,
      {
        headers: { 'Authorization': `Bearer ${this.apiToken}` }
      }
    );
    return await response.json();
  }
}

// Fiken Integration
class FikenIntegration extends AccountingIntegration {
  constructor(apiToken, companySlug) {
    super();
    this.apiToken = apiToken;
    this.companySlug = companySlug;
    this.baseUrl = 'https://api.fiken.no/api/v2';
  }

  async syncTransactions(transactions) {
    // Similar structure to Tripletex, different API format
    for (const tx of transactions) {
      const sale = this.transformToFikenSale(tx);
      
      await fetch(`${this.baseUrl}/companies/${this.companySlug}/sales`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sale)
      });
    }
  }

  transformToFikenSale(transaction) {
    return {
      issueDate: transaction.date,
      dueDate: transaction.date,
      lines: [{
        description: `Order #${transaction.orderId}`,
        netPrice: transaction.totalAmount / 1.25, // Excl. VAT
        vatType: 'HIGH', // 25%
        account: '3000'
      }],
      paymentAccount: '1920',
      paymentDate: transaction.date
    };
  }
}
```

**Sync Service:**

```javascript
// Accounting Sync Service
class AccountingSyncService {
  async syncDailyTransactions(restaurantId, date) {
    const restaurant = await db.restaurants.findById(restaurantId);
    
    if (!restaurant.accountingIntegration) {
      throw new Error('No accounting integration configured');
    }

    // Get integration
    const integration = this.getIntegration(restaurant.accountingIntegration);

    // Fetch all completed transactions for the day
    const startOfDay = new Date(date).setHours(0, 0, 0, 0);
    const endOfDay = new Date(date).setHours(23, 59, 59, 999);

    const transactions = await db.orders.find({
      restaurantId,
      status: 'completed',
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // Sync to accounting system
    await integration.syncTransactions(transactions);

    // Log sync
    await db.accountingSyncLog.create({
      restaurantId,
      date,
      transactionsSynced: transactions.length,
      status: 'success',
      syncedAt: new Date()
    });
  }

  getIntegration(config) {
    switch (config.type) {
      case 'tripletex':
        return new TripletexIntegration(config.apiToken, config.employeeId);
      case 'fiken':
        return new FikenIntegration(config.apiToken, config.companySlug);
      default:
        throw new Error(`Unsupported accounting system: ${config.type}`);
    }
  }
}

// Cron job: Sync daily at 23:30
cron.schedule('30 23 * * *', async () => {
  const today = new Date();
  const restaurants = await db.restaurants.find({
    'accountingIntegration.active': true
  });

  for (const restaurant of restaurants) {
    try {
      await accountingSyncService.syncDailyTransactions(restaurant.id, today);
    } catch (error) {
      console.error(`Accounting sync failed for ${restaurant.id}:`, error);
    }
  }
});
```

**Database Schema:**

```sql
CREATE TABLE accounting_integrations (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  type VARCHAR(50),              -- 'tripletex', 'fiken', 'poweroffice'
  credentials_encrypted TEXT,
  active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP,
  UNIQUE(restaurant_id)
);

CREATE TABLE accounting_sync_log (
  id UUID PRIMARY KEY,
  restaurant_id UUID,
  date DATE,
  transactions_synced INTEGER,
  status VARCHAR(50),            -- 'success', 'failed'
  error_message TEXT,
  synced_at TIMESTAMP
);
```

---

### 8.4 AI Integration Points

**1. Expense Categorization**
- ML model: Classify expenses automatically
- "Invoice from 'Norgesgruppen' → Food supplies"
- "Receipt from 'Rema 1000' → Ingredients"

**2. Fraud Detection**
- Anomaly detection: Unusual expenses
- "Employee expense of kr 5,000 at restaurant (suspicious)"
- Flag for manual review

**3. Cash Flow Forecasting**
- Predict upcoming expenses based on history
- "You typically pay kr 30,000 for rent on the 1st"
- Warn if cash balance is low

---

### 8.5 Critical Risks

**Risk 1: Data Integrity**
- Wrong VAT calculations → tax problems
- Mitigation: Thorough testing, auditor review

**Risk 2: Compliance**
- Norway has strict accounting rules
- Mitigation: Consult with accountant, follow standards

**Risk 3: API Rate Limits**
- Tripletex/Fiken may limit API calls
- Mitigation: Batch sync, queue system

**Risk 4: Security**
- Accounting credentials are sensitive
- Mitigation: Encrypt, use KMS, rotate regularly

---

### 8.6 Implementation Timeline

**Week 1-2: Tripletex Integration**
- [ ] Research API documentation
- [ ] Authentication (API token + employee ID)
- [ ] Transaction sync (sales)
- [ ] Test with Kim's Tripletex account

**Week 3: Fiken Integration**
- [ ] Similar structure to Tripletex
- [ ] Different API format
- [ ] Test

**Week 4:**
- [ ] Sync status dashboard
- [ ] Error handling & retry logic
- [ ] Manual reconciliation tool (if sync fails)

**Week 5:**
- [ ] Expense tracking
- [ ] Payroll integration (Planday → accounting)
- [ ] Reports (P&L, balance sheet)

---

### 8.7 Success Metrics

**KPIs:**
- Sync success rate (goal: 99%+)
- Time saved on bookkeeping (goal: 10+ hours/month)
- Error rate (goal: <1%)
- Tax report accuracy (goal: 100%)

**Goal:**
- Zero manual bookkeeping
- One-click tax reports
- Real-time financial overview

---

## MODULE 9: Staff Scheduling 👥

**Business Value:** MEDIUM (Planday integration!)
**Technical Complexity:** LOW (mostly read-only)
**AI Opportunity:** MEDIUM

---

### 9.1 Problem Statement

**Current Pain:**
- Staff scheduling in separate tool (Planday)
- No connection to sales forecast
- Over-staffing (waste money) or under-staffing (poor service)
- Manual schedule adjustments

**Opportunity:**
- **Read-only Planday integration** (display schedules in RestOS)
- Demand-based scheduling (AI suggests optimal staffing)
- Cost tracking (labor % of revenue)

---

### 9.2 Solution: Smart Scheduling Integration

**Note:** We don't replace Planday - we integrate with it!

**Features:**

**1. Schedule Display**
- Show current week's schedule (from Planday)
- Who's working when?
- Total labor hours & cost

**2. Demand Forecasting**
- Predict busy hours (based on historical orders)
- Suggest staffing levels ("You need 3 staff on Friday 18:00-21:00")

**3. Labor Cost Tracking**
- Track labor cost vs. revenue
- **Lønnsprosent** (labor % of sales) - critical KPI!
- Alert if labor % > target (e.g., >30%)

**4. Shift Coverage**
- Alert if shifts are understaffed
- "Friday dinner rush: Only 2 staff scheduled, recommend 4"

---

### 9.3 Technical Architecture

**Planday Integration:**

```javascript
// Planday API Integration (Read-Only)
class PlandayIntegration {
  constructor(apiToken, companyId) {
    this.apiToken = apiToken;
    this.companyId = companyId;
    this.baseUrl = 'https://openapi.planday.com';
  }

  async getSchedule(startDate, endDate) {
    const response = await fetch(
      `${this.baseUrl}/scheduling/v1/shifts?from=${startDate}&to=${endDate}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'X-ClientId': this.companyId
        }
      }
    );

    const data = await response.json();
    return data.shifts.map(shift => this.normalizeShift(shift));
  }

  normalizeShift(shift) {
    return {
      employeeId: shift.employeeId,
      employeeName: shift.employeeName,
      startTime: shift.startTime,
      endTime: shift.endTime,
      role: shift.shiftType,
      hours: (new Date(shift.endTime) - new Date(shift.startTime)) / 3600000,
      cost: shift.cost || 0
    };
  }

  async getEmployees() {
    const response = await fetch(
      `${this.baseUrl}/hr/v1/employees`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'X-ClientId': this.companyId
        }
      }
    );
    return await response.json();
  }

  async getLaborCost(startDate, endDate) {
    const response = await fetch(
      `${this.baseUrl}/scheduling/v1/costs?from=${startDate}&to=${endDate}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'X-ClientId': this.companyId
        }
      }
    );
    return await response.json();
  }
}
```

**Demand Forecasting:**

```javascript
// AI-Powered Staffing Recommendations
class StaffingOptimizer {
  async recommendStaffing(restaurantId, date) {
    // Predict order volume for each hour
    const forecast = await this.forecastDemand(restaurantId, date);

    // Calculate required staff based on orders
    const recommendations = [];

    for (let hour = 0; hour < 24; hour++) {
      const ordersThisHour = forecast[hour];
      const requiredStaff = this.calculateRequiredStaff(ordersThisHour);

      recommendations.push({
        hour,
        predictedOrders: ordersThisHour,
        recommendedStaff: requiredStaff
      });
    }

    return recommendations;
  }

  async forecastDemand(restaurantId, date) {
    // Fetch historical data (same day of week, last 8 weeks)
    const dayOfWeek = new Date(date).getDay();
    const historicalData = await this.getHistoricalOrdersByHour(restaurantId, dayOfWeek);

    // Simple moving average (can be improved with ML)
    const forecast = Array(24).fill(0);

    for (let hour = 0; hour < 24; hour++) {
      const avgOrders = historicalData
        .map(week => week[hour])
        .reduce((sum, orders) => sum + orders, 0) / historicalData.length;

      forecast[hour] = Math.round(avgOrders);
    }

    return forecast;
  }

  calculateRequiredStaff(ordersPerHour) {
    // Rule of thumb: 1 staff can handle 10 orders/hour
    // Minimum 1 staff always
    return Math.max(1, Math.ceil(ordersPerHour / 10));
  }

  async compareForecastToSchedule(restaurantId, date) {
    const recommendations = await this.recommendStaffing(restaurantId, date);
    
    // Get actual schedule from Planday
    const shifts = await plandayIntegration.getSchedule(date, date);

    // Compare
    const comparison = [];

    for (let hour = 0; hour < 24; hour++) {
      const recommended = recommendations[hour].recommendedStaff;
      const scheduled = shifts.filter(s => 
        new Date(s.startTime).getHours() <= hour &&
        new Date(s.endTime).getHours() > hour
      ).length;

      if (scheduled < recommended) {
        comparison.push({
          hour,
          status: 'understaffed',
          recommended,
          scheduled,
          gap: recommended - scheduled
        });
      } else if (scheduled > recommended * 1.5) {
        comparison.push({
          hour,
          status: 'overstaffed',
          recommended,
          scheduled,
          excess: scheduled - recommended
        });
      }
    }

    return comparison;
  }
}
```

**Labor Cost Tracking:**

```javascript
// Labor % Calculator
class LaborCostTracker {
  async calculateLaborPercent(restaurantId, startDate, endDate) {
    // Get revenue
    const orders = await db.orders.find({
      restaurantId,
      status: 'completed',
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Get labor cost from Planday
    const laborCost = await plandayIntegration.getLaborCost(startDate, endDate);

    const laborPercent = (laborCost / totalRevenue) * 100;

    return {
      revenue: totalRevenue,
      laborCost,
      laborPercent,
      alert: laborPercent > 30 // Alert if > 30%
    };
  }

  async generateWeeklyReport(restaurantId, weekStart) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const laborData = await this.calculateLaborPercent(restaurantId, weekStart, weekEnd);

    // Get schedule details
    const shifts = await plandayIntegration.getSchedule(weekStart, weekEnd);

    const report = {
      period: `${weekStart.toISOString().split('T')[0]} - ${weekEnd.toISOString().split('T')[0]}`,
      revenue: laborData.revenue,
      laborCost: laborData.laborCost,
      laborPercent: laborData.laborPercent,
      totalHours: shifts.reduce((sum, s) => sum + s.hours, 0),
      staffCount: new Set(shifts.map(s => s.employeeId)).size,
      insights: this.generateInsights(laborData, shifts)
    };

    return report;
  }

  generateInsights(laborData, shifts) {
    const insights = [];

    if (laborData.laborPercent > 35) {
      insights.push({
        type: 'warning',
        text: `Labor cost is ${laborData.laborPercent.toFixed(1)}% of revenue (target: <30%). Consider reducing hours or increasing sales.`
      });
    } else if (laborData.laborPercent < 20) {
      insights.push({
        type: 'info',
        text: `Labor cost is only ${laborData.laborPercent.toFixed(1)}% of revenue. You may be understaffed - consider quality impact.`
      });
    } else {
      insights.push({
        type: 'success',
        text: `Labor cost is ${laborData.laborPercent.toFixed(1)}% of revenue - within target range.`
      });
    }

    return insights;
  }
}
```

**Frontend:**

```jsx
// Staff Schedule Widget
function StaffSchedule() {
  const [schedule, setSchedule] = useState(null);
  const [staffingRecommendations, setStaffingRecommendations] = useState(null);

  useEffect(() => {
    loadSchedule();
    loadRecommendations();
  }, []);

  const loadSchedule = async () => {
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);

    const data = await api.get('/planday/schedule', {
      params: { start: weekStart, end: weekEnd }
    });
    setSchedule(data);
  };

  const loadRecommendations = async () => {
    const data = await api.get('/staffing/recommendations');
    setStaffingRecommendations(data);
  };

  return (
    <div className="staff-schedule">
      <h2>Staff Schedule (from Planday)</h2>
      
      <div className="schedule-grid">
        {schedule?.shifts.map(shift => (
          <div key={shift.id} className="shift-card">
            <div className="employee-name">{shift.employeeName}</div>
            <div className="shift-time">
              {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
            </div>
            <div className="shift-role">{shift.role}</div>
          </div>
        ))}
      </div>

      {staffingRecommendations && (
        <div className="staffing-alerts">
          <h3>Staffing Alerts</h3>
          {staffingRecommendations.map((rec, i) => (
            <div key={i} className={`alert alert-${rec.status}`}>
              {formatHour(rec.hour)}: {rec.status === 'understaffed' 
                ? `Need ${rec.gap} more staff`
                : `${rec.excess} excess staff`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Labor Cost Widget
function LaborCostWidget() {
  const [laborData, setLaborData] = useState(null);

  useEffect(() => {
    loadLaborData();
  }, []);

  const loadLaborData = async () => {
    const data = await api.get('/labor-cost/week');
    setLaborData(data);
  };

  if (!laborData) return <Loading />;

  return (
    <div className="labor-cost-widget">
      <h3>Labor Cost This Week</h3>
      <div className="labor-metrics">
        <div className="metric">
          <span className="label">Revenue:</span>
          <span className="value">{formatCurrency(laborData.revenue)}</span>
        </div>
        <div className="metric">
          <span className="label">Labor Cost:</span>
          <span className="value">{formatCurrency(laborData.laborCost)}</span>
        </div>
        <div className={`metric ${laborData.alert ? 'alert' : ''}`}>
          <span className="label">Labor %:</span>
          <span className="value">{laborData.laborPercent.toFixed(1)}%</span>
        </div>
      </div>

      {laborData.alert && (
        <div className="alert-message">
          ⚠️ Labor cost exceeds target (30%)
        </div>
      )}
    </div>
  );
}
```

---

### 9.4 AI Integration Points

**1. Demand-Based Scheduling**
- Predict busy hours → recommend staffing
- "Friday 19:00-21:00: Expect 40 orders/hour, need 4 staff"

**2. Staff Performance**
- Track orders handled per staff member
- "John handles 15 orders/hour (above average)"

**3. Cost Optimization**
- Find optimal schedule to minimize labor cost
- While maintaining service quality

---

### 9.5 Critical Risks

**Risk 1: Planday API Access**
- May not have full API access
- Mitigation: Manual CSV import fallback

**Risk 2: Forecast Accuracy**
- AI predictions may be wrong
- Mitigation: Show confidence, allow manual override

**Risk 3: Privacy**
- Employee data is sensitive
- Mitigation: Only show aggregated data, GDPR compliance

---

### 9.6 Implementation Timeline

**Week 1-2:**
- [ ] Planday API integration (read schedule)
- [ ] Display current week schedule

**Week 3:**
- [ ] Demand forecasting (simple moving average)
- [ ] Staffing recommendations

**Week 4:**
- [ ] Labor cost tracking
- [ ] Labor % calculator

**Week 5:**
- [ ] Staffing alerts (understaffed/overstaffed)
- [ ] Weekly reports

---

### 9.7 Success Metrics

**KPIs:**
- Forecast accuracy (within 20% of actual)
- Labor % (goal: 25-30%)
- Understaffing incidents (goal: 0)
- Labor cost savings (5-10%)

**Goal:**
- Optimal staffing (not too much, not too little)
- Labor cost <30% of revenue
- No understaffing complaints

---

## MODULE 10: Inventory Management 📦

**Business Value:** MEDIUM (Prevent waste!)
**Technical Complexity:** HIGH
**AI Opportunity:** HIGH

---

### 10.1 Problem Statement

**Current Pain:**
- No inventory tracking (guessing what to order)
- Food waste (over-ordering)
- Stockouts (under-ordering)
- Manual inventory counts (tedious)

**Opportunity:**
- Automated inventory tracking
- Smart reorder alerts
- Waste reduction (save 10-20%)
- Integrate with Tap.it (Favrit has this!)

---

### 10.2 Solution: Smart Inventory Management

**Features:**

**1. Ingredient Tracking**
- Track inventory levels (kg, liters, units)
- Deduct ingredients when items sold
- Low stock alerts

**2. Reorder Recommendations**
- "Tomatoes: 5 kg left, reorder in 2 days"
- Based on sales forecast

**3. Waste Tracking**
- Log spoiled/wasted items
- Calculate waste cost
- Identify patterns ("We waste 20% of lettuce every week")

**4. Supplier Management**
- Track suppliers, prices
- Compare prices
- Order history

**5. Recipe Management**
- Define recipes (ingredients per menu item)
- Auto-calculate inventory usage

---

### 10.3 Technical Architecture

**Database Schema:**

```sql
CREATE TABLE ingredients (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  name VARCHAR(255),
  unit VARCHAR(50),              -- 'kg', 'liter', 'units'
  current_stock DECIMAL(10,2),
  min_stock DECIMAL(10,2),       -- Reorder threshold
  cost_per_unit DECIMAL(10,2),
  supplier VARCHAR(255),
  last_restocked_at TIMESTAMP,
  created_at TIMESTAMP,
  INDEX(restaurant_id)
);

CREATE TABLE recipes (
  id UUID PRIMARY KEY,
  menu_item_id UUID REFERENCES menu_items(id),
  ingredient_id UUID REFERENCES ingredients(id),
  quantity DECIMAL(10,2),        -- Amount used per serving
  unit VARCHAR(50),
  created_at TIMESTAMP
);

CREATE TABLE inventory_adjustments (
  id UUID PRIMARY KEY,
  restaurant_id UUID,
  ingredient_id UUID REFERENCES ingredients(id),
  adjustment_type VARCHAR(50),   -- 'purchase', 'waste', 'count'
  quantity DECIMAL(10,2),
  reason TEXT,
  cost DECIMAL(10,2),
  adjusted_by UUID REFERENCES users(id),
  adjusted_at TIMESTAMP
);

CREATE TABLE waste_log (
  id UUID PRIMARY KEY,
  restaurant_id UUID,
  ingredient_id UUID REFERENCES ingredients(id),
  quantity DECIMAL(10,2),
  cost DECIMAL(10,2),
  reason VARCHAR(255),           -- 'spoiled', 'overcooked', 'customer return'
  logged_by UUID REFERENCES users(id),
  logged_at TIMESTAMP
);
```

**Backend Logic:**

```javascript
// Inventory Manager
class InventoryManager {
  async deductInventory(order) {
    // When an order is completed, deduct ingredients
    for (const item of order.items) {
      const recipes = await db.recipes.find({ menuItemId: item.menuItemId });

      for (const recipe of recipes) {
        // Deduct ingredient stock
        await db.ingredients.update(
          { id: recipe.ingredientId },
          {
            $inc: { currentStock: -recipe.quantity * item.quantity }
          }
        );

        // Check if below min stock
        const ingredient = await db.ingredients.findById(recipe.ingredientId);
        if (ingredient.currentStock < ingredient.minStock) {
          // Trigger low stock alert
          await this.sendLowStockAlert(ingredient);
        }
      }
    }
  }

  async sendLowStockAlert(ingredient) {
    const restaurant = await db.restaurants.findById(ingredient.restaurantId);
    
    // Send notification
    await notificationService.send(restaurant.ownerId, {
      title: 'Low Stock Alert',
      message: `${ingredient.name} is running low (${ingredient.currentStock} ${ingredient.unit} left). Reorder soon!`
    });

    // Log alert
    await db.inventoryAlerts.create({
      restaurantId: restaurant.id,
      ingredientId: ingredient.id,
      alertType: 'low_stock',
      currentStock: ingredient.currentStock,
      minStock: ingredient.minStock,
      createdAt: new Date()
    });
  }

  async generateReorderRecommendations(restaurantId) {
    // Get all ingredients
    const ingredients = await db.ingredients.find({ restaurantId });

    // Predict usage for next 7 days
    const recommendations = [];

    for (const ingredient of ingredients) {
      const dailyUsage = await this.calculateDailyUsage(ingredient.id);
      const daysUntilStockout = ingredient.currentStock / dailyUsage;

      if (daysUntilStockout < 3) {
        const reorderQuantity = dailyUsage * 7; // Order 1 week supply

        recommendations.push({
          ingredient: ingredient.name,
          currentStock: ingredient.currentStock,
          dailyUsage,
          daysUntilStockout: Math.floor(daysUntilStockout),
          recommendedOrder: Math.ceil(reorderQuantity),
          supplier: ingredient.supplier,
          estimatedCost: ingredient.costPerUnit * reorderQuantity
        });
      }
    }

    return recommendations;
  }

  async calculateDailyUsage(ingredientId) {
    // Get usage over last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

    const adjustments = await db.inventoryAdjustments.find({
      ingredientId,
      adjustmentType: 'usage',
      adjustedAt: { $gte: thirtyDaysAgo }
    });

    const totalUsage = adjustments.reduce((sum, adj) => sum + Math.abs(adj.quantity), 0);
    return totalUsage / 30;
  }

  async logWaste(restaurantId, ingredientId, quantity, reason, userId) {
    const ingredient = await db.ingredients.findById(ingredientId);
    const cost = ingredient.costPerUnit * quantity;

    // Create waste log entry
    await db.wasteLog.create({
      restaurantId,
      ingredientId,
      quantity,
      cost,
      reason,
      loggedBy: userId,
      loggedAt: new Date()
    });

    // Update inventory
    await db.ingredients.update(
      { id: ingredientId },
      { $inc: { currentStock: -quantity } }
    );

    return { cost, updatedStock: ingredient.currentStock - quantity };
  }

  async getWasteReport(restaurantId, startDate, endDate) {
    const wasteLogs = await db.wasteLog.find({
      restaurantId,
      loggedAt: { $gte: startDate, $lte: endDate }
    });

    const totalWaste = wasteLogs.reduce((sum, log) => sum + log.cost, 0);

    // Group by ingredient
    const wasteByIngredient = {};
    wasteLogs.forEach(log => {
      if (!wasteByIngredient[log.ingredientId]) {
        wasteByIngredient[log.ingredientId] = {
          quantity: 0,
          cost: 0,
          reasons: []
        };
      }
      wasteByIngredient[log.ingredientId].quantity += log.quantity;
      wasteByIngredient[log.ingredientId].cost += log.cost;
      wasteByIngredient[log.ingredientId].reasons.push(log.reason);
    });

    return {
      totalWaste,
      wasteByIngredient,
      wastePercentOfRevenue: await this.calculateWastePercent(restaurantId, totalWaste, startDate, endDate)
    };
  }

  async calculateWastePercent(restaurantId, wasteAmount, startDate, endDate) {
    const orders = await db.orders.find({
      restaurantId,
      status: 'completed',
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    return (wasteAmount / totalRevenue) * 100;
  }
}

// Hook: Deduct inventory when order completed
eventEmitter.on('order.completed', async (order) => {
  await inventoryManager.deductInventory(order);
});
```

---

### 10.4 AI Integration Points

**1. Smart Reordering**
- ML model predicts usage based on:
  - Historical sales
  - Seasonality (summer vs. winter)
  - Upcoming events (holidays, weekends)
- Optimize order quantities (minimize waste + avoid stockouts)

**2. Waste Prediction**
- Predict which ingredients will spoil
- "Lettuce: 80% chance of waste if not used in 2 days"
- Suggest menu promotions ("Use up lettuce → salad special")

**3. Price Optimization**
- Track supplier prices over time
- Alert when prices spike
- Suggest cheaper alternatives

---

### 10.5 Critical Risks

**Risk 1: Data Accuracy**
- Manual inventory counts can be wrong
- Mitigation: Regular audits, barcode scanning

**Risk 2: Recipe Complexity**
- Hard to track all ingredients accurately
- Mitigation: Start simple, improve over time

**Risk 3: Waste Tracking Compliance**
- Restaurant staff may not log waste consistently
- Mitigation: Incentivize logging, gamification

---

### 10.6 Implementation Timeline

**Week 1-2:**
- [ ] Database schema (ingredients, recipes)
- [ ] Ingredient CRUD API
- [ ] Recipe management

**Week 3:**
- [ ] Auto-deduct inventory when orders completed
- [ ] Low stock alerts

**Week 4:**
- [ ] Reorder recommendations
- [ ] Waste tracking

**Week 5:**
- [ ] Waste reports
- [ ] Supplier management

**Week 6:**
- [ ] AI-powered reorder optimization
- [ ] Predictive waste alerts

---

### 10.7 Success Metrics

**KPIs:**
- Waste reduction (goal: 20% less waste)
- Stockout incidents (goal: <1/month)
- Inventory accuracy (goal: 95%+)
- Cost savings (goal: 5-10% on food costs)

**Goal:**
- Zero stockouts
- Waste < 5% of food cost
- Automated reordering

---

## MODULE 11: Customer Loyalty 💖

**Business Value:** MEDIUM (Increase repeat orders!)
**Technical Complexity:** LOW
**AI Opportunity:** HIGH

---

### 11.1 Problem Statement

**Current Pain:**
- No loyalty program (customers have no incentive to return)
- Competing with Wolt/Foodora loyalty programs
- Can't track repeat customers across channels

**Opportunity:**
- Own loyalty program (build customer relationships!)
- Reward repeat customers
- Increase lifetime value (LTV)

---

### 11.2 Solution: Smart Loyalty Program

**Features:**

**1. Points System**
- Earn points on every order (kr 1 = 1 point)
- Redeem points for discounts (100 points = kr 10 off)
- Track points balance

**2. Tiered Rewards**
- Bronze: 0-500 points (5% discount)
- Silver: 500-1000 points (10% discount)
- Gold: 1000+ points (15% discount + free delivery)

**3. Birthday Rewards**
- Free dessert on birthday
- Automatic email/SMS

**4. Referral Program**
- Refer a friend → both get kr 50 credit
- Track referrals

**5. Personalized Offers**
- AI-powered: "You love burgers → 20% off burgers this week"
- Email/SMS campaigns

---

### 11.3 Technical Architecture

**Database Schema:**

```sql
CREATE TABLE loyalty_customers (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  customer_name VARCHAR(255),
  points_balance INTEGER DEFAULT 0,
  tier VARCHAR(50) DEFAULT 'bronze',  -- 'bronze', 'silver', 'gold'
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  referral_code VARCHAR(20) UNIQUE,
  referred_by VARCHAR(20),
  birthday DATE,
  created_at TIMESTAMP,
  last_order_at TIMESTAMP,
  INDEX(restaurant_id, customer_phone),
  INDEX(referral_code)
);

CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY,
  loyalty_customer_id UUID REFERENCES loyalty_customers(id),
  order_id UUID REFERENCES orders(id),
  transaction_type VARCHAR(50),      -- 'earn', 'redeem', 'bonus'
  points INTEGER,
  description TEXT,
  created_at TIMESTAMP
);

CREATE TABLE loyalty_rewards (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  reward_type VARCHAR(50),           -- 'discount', 'free_item', 'birthday'
  title VARCHAR(255),
  description TEXT,
  points_required INTEGER,
  discount_percent DECIMAL(5,2),
  free_item_id UUID REFERENCES menu_items(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
);
```

**Backend Logic:**

```javascript
// Loyalty Manager
class LoyaltyManager {
  async registerCustomer(restaurantId, customerInfo) {
    // Check if customer exists
    let customer = await db.loyaltyCustomers.findOne({
      restaurantId,
      customerPhone: customerInfo.phone
    });

    if (!customer) {
      // Create new loyalty customer
      customer = await db.loyaltyCustomers.create({
        restaurantId,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email,
        customerName: customerInfo.name,
        birthday: customerInfo.birthday,
        pointsBalance: 0,
        tier: 'bronze',
        referralCode: this.generateReferralCode(),
        referredBy: customerInfo.referralCode || null,
        createdAt: new Date()
      });

      // If referred, give bonus points to both
      if (customerInfo.referralCode) {
        await this.processReferral(customer.id, customerInfo.referralCode);
      }
    }

    return customer;
  }

  generateReferralCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async processReferral(newCustomerId, referralCode) {
    // Find referrer
    const referrer = await db.loyaltyCustomers.findOne({ referralCode });

    if (referrer) {
      // Give bonus points to both
      await this.addPoints(referrer.id, 500, 'Referral bonus');
      await this.addPoints(newCustomerId, 500, 'Welcome bonus (referred)');
    }
  }

  async earnPointsFromOrder(order) {
    // Register customer if not exists
    const customer = await this.registerCustomer(order.restaurantId, {
      phone: order.customerPhone,
      email: order.customerEmail,
      name: order.customerName
    });

    // Calculate points (kr 1 = 1 point)
    const pointsEarned = Math.floor(order.totalAmount);

    // Add points
    await this.addPoints(customer.id, pointsEarned, `Order #${order.id}`);

    // Update customer stats
    await db.loyaltyCustomers.update(
      { id: customer.id },
      {
        $inc: {
          totalOrders: 1,
          totalSpent: order.totalAmount
        },
        lastOrderAt: new Date()
      }
    );

    // Check tier upgrade
    await this.checkTierUpgrade(customer.id);

    return { customer, pointsEarned };
  }

  async addPoints(customerId, points, description) {
    // Add points to balance
    await db.loyaltyCustomers.update(
      { id: customerId },
      { $inc: { pointsBalance: points } }
    );

    // Log transaction
    await db.loyaltyTransactions.create({
      loyaltyCustomerId: customerId,
      transactionType: 'earn',
      points,
      description,
      createdAt: new Date()
    });
  }

  async redeemPoints(customerId, points, orderId) {
    const customer = await db.loyaltyCustomers.findById(customerId);

    if (customer.pointsBalance < points) {
      throw new Error('Insufficient points');
    }

    // Deduct points
    await db.loyaltyCustomers.update(
      { id: customerId },
      { $inc: { pointsBalance: -points } }
    );

    // Log transaction
    await db.loyaltyTransactions.create({
      loyaltyCustomerId: customerId,
      orderId,
      transactionType: 'redeem',
      points: -points,
      description: 'Points redeemed',
      createdAt: new Date()
    });

    // Calculate discount (100 points = kr 10)
    const discountAmount = (points / 100) * 10;

    return { discountAmount };
  }

  async checkTierUpgrade(customerId) {
    const customer = await db.loyaltyCustomers.findById(customerId);

    let newTier = 'bronze';
    if (customer.totalSpent >= 5000) newTier = 'silver';
    if (customer.totalSpent >= 10000) newTier = 'gold';

    if (newTier !== customer.tier) {
      await db.loyaltyCustomers.update(
        { id: customerId },
        { tier: newTier }
      );

      // Send notification
      await notificationService.send(customer.customerEmail, {
        subject: `Congratulations! You've been upgraded to ${newTier.toUpperCase()}!`,
        body: `You've earned ${newTier} tier status. Enjoy exclusive benefits!`
      });
    }
  }

  async getPersonalizedOffers(customerId) {
    const customer = await db.loyaltyCustomers.findById(customerId);

    // Get customer's order history
    const orders = await db.orders.find({
      customerPhone: customer.customerPhone,
      status: 'completed'
    }).limit(20);

    // Analyze favorite items
    const itemCounts = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });

    // Find top 3 favorites
    const favorites = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);

    // Generate personalized offers
    const offers = favorites.map(itemName => ({
      title: `20% off ${itemName}`,
      description: `We noticed you love ${itemName}! Enjoy 20% off your next order.`,
      discountPercent: 20,
      expiresAt: new Date(Date.now() + 7 * 86400000) // 7 days
    }));

    return offers;
  }

  async sendBirthdayReward(customerId) {
    const customer = await db.loyaltyCustomers.findById(customerId);

    // Send birthday email with free dessert coupon
    await notificationService.send(customer.customerEmail, {
      subject: 'Happy Birthday from [Restaurant Name]! 🎂',
      body: `Happy Birthday! Enjoy a FREE dessert on us. Use code: BDAY${customer.id.substring(0, 6)}`
    });

    // Log bonus points
    await this.addPoints(customerId, 200, 'Birthday bonus');
  }
}

// Cron job: Check birthdays daily
cron.schedule('0 9 * * *', async () => {
  const today = new Date();
  const todayMMDD = `${today.getMonth() + 1}-${today.getDate()}`;

  const birthdayCustomers = await db.loyaltyCustomers.find({
    birthday: { $regex: todayMMDD }
  });

  for (const customer of birthdayCustomers) {
    await loyaltyManager.sendBirthdayReward(customer.id);
  }
});

// Hook: Earn points when order completed
eventEmitter.on('order.completed', async (order) => {
  await loyaltyManager.earnPointsFromOrder(order);
});
```

---

### 11.4 AI Integration Points

**1. Personalized Offers**
- ML model analyzes order history
- "Customer X loves burgers → send burger discount"
- Predict churn (customer hasn't ordered in 30 days → send win-back offer)

**2. Optimal Discount Calculation**
- What discount maximizes ROI?
- "10% off increases order probability by 30% → positive ROI"

**3. Customer Segmentation**
- High-value customers (VIPs)
- At-risk customers (churn prediction)
- Occasional customers (nurture campaigns)

---

### 11.5 Critical Risks

**Risk 1: Fraud**
- Fake referrals, multiple accounts
- Mitigation: Phone verification, fraud detection

**Risk 2: Cost**
- Discounts can be expensive
- Mitigation: Set limits, track ROI

**Risk 3: Engagement**
- Customers may not use loyalty program
- Mitigation: Marketing, education, easy redemption

---

### 11.6 Implementation Timeline

**Week 1:**
- [ ] Database schema (loyalty customers, transactions)
- [ ] Register customer API
- [ ] Earn points on order

**Week 2:**
- [ ] Redeem points
- [ ] Tiered rewards

**Week 3:**
- [ ] Referral program
- [ ] Birthday rewards

**Week 4:**
- [ ] Personalized offers (AI)
- [ ] Email/SMS campaigns

---

### 11.7 Success Metrics

**KPIs:**
- Repeat order rate (goal: 40%+)
- Customer lifetime value (LTV) (goal: +30%)
- Loyalty program enrollment (goal: 50% of customers)
- Referral conversion (goal: 10%)

**Goal:**
- 50% of customers enrolled in loyalty
- 40%+ repeat order rate
- +30% LTV

---

**(Final sections coming next: AI Strategy, Risk Assessment, Architecture, Roadmap!)** 🚀

Skal jeg fortsette med FULL SPEED til slutten? 💪
