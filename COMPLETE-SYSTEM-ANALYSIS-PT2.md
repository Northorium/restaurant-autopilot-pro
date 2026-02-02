# 🔬 COMPLETE SYSTEM ANALYSIS - Part 2: Remaining Modules

**Continuation of COMPLETE-SYSTEM-ANALYSIS.md**

---

## MODULE 3: Analytics Dashboard 📊

**Business Value:** HIGH
**Technical Complexity:** MEDIUM
**AI Opportunity:** VERY HIGH

---

### 3.1 Problem Statement

**Current Pain:**
- HeapsGO outsources to Mixpanel (friction)
- Edda.ai charges kr 10,000+/month for analytics
- Most restaurants make decisions on gut feel, not data
- Data scattered across systems (POS, accounting, delivery apps)

**Opportunity:**
- Built-in analytics (no external tools)
- Real-time insights (not end-of-day reports)
- Predictive (not just historical)
- Actionable (not just pretty charts)

---

### 3.2 Solution: Intelligent Analytics Dashboard

**Features:**

**1. Revenue Analytics**
- Total revenue (today, week, month, year)
- Revenue by source (Wolt, Foodora, direct, dine-in)
- Revenue by time of day (peak hours)
- Revenue trends (growing or declining?)
- Average order value (AOV)
- Order frequency (orders per hour/day)

**2. Customer Analytics**
- New vs. returning customers
- Customer lifetime value (CLV)
- Most frequent customers (VIPs)
- Customer acquisition cost (if running ads)
- Churn rate (customers who stopped ordering)

**3. Product Analytics**
- Best sellers (top 10 items)
- Worst sellers (items to remove)
- Item profitability (revenue vs. cost)
- Order composition (what's ordered together)
- Menu engineering (high profit + high popularity = stars)

**4. Operational Analytics**
- Average order prep time
- Order accuracy rate (% correct orders)
- Peak hours heatmap (when to staff up)
- Kitchen efficiency (orders per hour)
- Table turn rate (for dine-in)

**5. Financial Analytics**
- Gross revenue
- Commission costs (Wolt, Foodora take X%)
- Net revenue (what you actually keep)
- Cost of goods sold (COGS) - if inventory tracked
- Gross profit margin
- Break-even analysis

**6. Comparison Analytics**
- This week vs. last week
- This month vs. last month
- This year vs. last year
- Location A vs. Location B (multi-location)

**7. Predictive Analytics (AI-Powered)**
- Sales forecast (next week, next month)
- Demand prediction (how many orders tomorrow?)
- Inventory needs (restock before running out)
- Staff scheduling recommendations

---

### 3.3 Technical Architecture

**Data Pipeline:**

```javascript
// Analytics Data Aggregator
class AnalyticsAggregator {
  constructor() {
    this.sources = [
      { name: 'orders', model: db.orders },
      { name: 'customers', model: db.customers },
      { name: 'menu', model: db.menuItems },
      { name: 'pos', api: posIntegration },
      { name: 'accounting', api: accountingIntegration }
    ];
  }

  async calculateDailyMetrics(restaurantId, date) {
    const startOfDay = new Date(date).setHours(0, 0, 0, 0);
    const endOfDay = new Date(date).setHours(23, 59, 59, 999);

    // Orders today
    const orders = await db.orders.find({
      restaurantId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: 'completed'
    });

    // Calculate metrics
    const metrics = {
      date,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      avgOrderValue: orders.length > 0 
        ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length 
        : 0,
      
      // By source
      revenueBySource: this.groupBySource(orders),
      
      // By time
      ordersByHour: this.groupByHour(orders),
      
      // Top items
      topItems: await this.calculateTopItems(orders),
      
      // Customer metrics
      newCustomers: orders.filter(o => o.customerFirstOrder).length,
      returningCustomers: orders.filter(o => !o.customerFirstOrder).length,
      
      // Commissions
      commissions: this.calculateCommissions(orders),
      netRevenue: this.calculateNetRevenue(orders)
    };

    // Save to analytics table (for historical tracking)
    await db.dailyMetrics.upsert({ restaurantId, date }, metrics);

    return metrics;
  }

  groupBySource(orders) {
    const sources = {};
    orders.forEach(order => {
      const source = order.source || 'direct';
      if (!sources[source]) {
        sources[source] = { orders: 0, revenue: 0 };
      }
      sources[source].orders++;
      sources[source].revenue += order.totalAmount;
    });
    return sources;
  }

  groupByHour(orders) {
    const hours = Array(24).fill(0);
    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hours[hour]++;
    });
    return hours;
  }

  async calculateTopItems(orders) {
    const itemCounts = {};
    const itemRevenue = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const itemName = item.name;
        itemCounts[itemName] = (itemCounts[itemName] || 0) + item.quantity;
        itemRevenue[itemName] = (itemRevenue[itemName] || 0) + (item.price * item.quantity);
      });
    });

    // Sort by quantity
    const topItems = Object.entries(itemCounts)
      .map(([name, count]) => ({
        name,
        count,
        revenue: itemRevenue[name]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return topItems;
  }

  calculateCommissions(orders) {
    const commissions = {
      wolt: 0,
      foodora: 0,
      uberEats: 0,
      total: 0
    };

    orders.forEach(order => {
      if (order.commissionAmount) {
        const source = order.source;
        if (commissions[source] !== undefined) {
          commissions[source] += order.commissionAmount;
        }
        commissions.total += order.commissionAmount;
      }
    });

    return commissions;
  }

  calculateNetRevenue(orders) {
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalCommissions = orders.reduce((sum, o) => sum + (o.commissionAmount || 0), 0);
    return totalRevenue - totalCommissions;
  }
}

// Cron job: Calculate daily metrics at midnight
cron.schedule('0 0 * * *', async () => {
  const restaurants = await db.restaurants.findAll();
  const yesterday = new Date(Date.now() - 86400000); // 24 hours ago

  for (const restaurant of restaurants) {
    await analyticsAggregator.calculateDailyMetrics(restaurant.id, yesterday);
  }
});
```

**Predictive Analytics (AI):**

```javascript
// Sales Forecasting with Time Series Analysis
class SalesForecaster {
  async forecastNextWeek(restaurantId) {
    // Get historical data (last 12 weeks)
    const historicalData = await db.dailyMetrics.find({
      restaurantId,
      date: { $gte: new Date(Date.now() - 84 * 86400000) } // 12 weeks
    }).sort({ date: 1 });

    if (historicalData.length < 14) {
      return { error: 'Not enough historical data' };
    }

    // Extract revenue time series
    const revenue = historicalData.map(d => d.totalRevenue);
    const dates = historicalData.map(d => d.date);

    // Simple moving average (can be improved with ML models)
    const weeklyAvg = this.calculateWeeklyAverage(revenue);
    const trend = this.calculateTrend(revenue);
    const seasonality = this.detectSeasonality(revenue);

    // Forecast next 7 days
    const forecast = [];
    for (let i = 0; i < 7; i++) {
      const dayOfWeek = (new Date(Date.now() + i * 86400000)).getDay();
      const seasonalFactor = seasonality[dayOfWeek] || 1.0;
      const predictedRevenue = (weeklyAvg + trend * i) * seasonalFactor;
      
      forecast.push({
        date: new Date(Date.now() + i * 86400000),
        predictedRevenue: Math.round(predictedRevenue),
        confidence: this.calculateConfidence(historicalData)
      });
    }

    return forecast;
  }

  calculateWeeklyAverage(revenue) {
    const lastWeek = revenue.slice(-7);
    return lastWeek.reduce((sum, v) => sum + v, 0) / lastWeek.length;
  }

  calculateTrend(revenue) {
    // Linear regression slope
    const n = revenue.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = revenue;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  detectSeasonality(revenue) {
    // Day-of-week seasonality
    const dayPatterns = Array(7).fill(0);
    const dayCounts = Array(7).fill(0);

    revenue.forEach((value, index) => {
      const dayOfWeek = index % 7;
      dayPatterns[dayOfWeek] += value;
      dayCounts[dayOfWeek]++;
    });

    // Normalize to average = 1.0
    const avgRevenue = revenue.reduce((a, b) => a + b, 0) / revenue.length;
    const seasonality = {};
    
    dayPatterns.forEach((sum, day) => {
      const dayAvg = sum / dayCounts[day];
      seasonality[day] = dayAvg / avgRevenue;
    });

    return seasonality;
  }

  calculateConfidence(data) {
    // Simple: More data = higher confidence
    const weeks = data.length / 7;
    if (weeks < 4) return 'low';
    if (weeks < 8) return 'medium';
    return 'high';
  }
}
```

**Database Schema:**

```sql
-- Daily aggregated metrics
CREATE TABLE daily_metrics (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  date DATE,
  total_orders INTEGER,
  total_revenue DECIMAL(10,2),
  net_revenue DECIMAL(10,2),
  avg_order_value DECIMAL(10,2),
  new_customers INTEGER,
  returning_customers INTEGER,
  revenue_by_source JSONB,
  orders_by_hour INTEGER[],
  top_items JSONB,
  commissions JSONB,
  created_at TIMESTAMP,
  UNIQUE(restaurant_id, date)
);

-- Real-time metrics cache (Redis)
Key: analytics:{restaurantId}:today
Value: {
  totalOrders: 45,
  totalRevenue: 12450.50,
  lastOrderAt: "2026-02-02T08:30:00Z",
  ...
}
TTL: 24 hours
```

---

### 3.4 Frontend: Analytics Dashboard

```jsx
// Analytics Dashboard Component
function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('week'); // 'today', 'week', 'month', 'year'
  const [metrics, setMetrics] = useState(null);
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const loadMetrics = async () => {
    const data = await api.get('/analytics/metrics', { params: { timeRange } });
    setMetrics(data);

    // Load forecast if available
    if (timeRange === 'week') {
      const forecastData = await api.get('/analytics/forecast');
      setForecast(forecastData);
    }
  };

  if (!metrics) return <Loading />;

  return (
    <div className="analytics-dashboard">
      <div className="time-range-selector">
        <button 
          className={timeRange === 'today' ? 'active' : ''}
          onClick={() => setTimeRange('today')}
        >
          Today
        </button>
        <button 
          className={timeRange === 'week' ? 'active' : ''}
          onClick={() => setTimeRange('week')}
        >
          This Week
        </button>
        <button 
          className={timeRange === 'month' ? 'active' : ''}
          onClick={() => setTimeRange('month')}
        >
          This Month
        </button>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          change={metrics.revenueChange}
          trend={metrics.revenueTrend}
        />
        <MetricCard
          title="Orders"
          value={metrics.totalOrders}
          change={metrics.ordersChange}
          trend={metrics.ordersTrend}
        />
        <MetricCard
          title="Avg Order Value"
          value={formatCurrency(metrics.avgOrderValue)}
          change={metrics.aovChange}
          trend={metrics.aovTrend}
        />
        <MetricCard
          title="Net Revenue"
          value={formatCurrency(metrics.netRevenue)}
          subtitle={`After ${formatCurrency(metrics.totalCommissions)} commissions`}
        />
      </div>

      {/* Revenue by Source Chart */}
      <div className="chart-section">
        <h3>Revenue by Source</h3>
        <PieChart data={metrics.revenueBySource} />
      </div>

      {/* Orders by Hour Heatmap */}
      <div className="chart-section">
        <h3>Peak Hours</h3>
        <HeatmapChart data={metrics.ordersByHour} />
      </div>

      {/* Top Items */}
      <div className="top-items">
        <h3>Best Sellers</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Orders</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {metrics.topItems.map(item => (
              <tr key={item.name}>
                <td>{item.name}</td>
                <td>{item.count}</td>
                <td>{formatCurrency(item.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sales Forecast (if available) */}
      {forecast && (
        <div className="forecast-section">
          <h3>Next 7 Days Forecast</h3>
          <LineChart 
            historical={metrics.revenueHistory}
            forecast={forecast}
          />
          <p className="confidence">
            Confidence: {forecast[0].confidence}
          </p>
        </div>
      )}

      {/* Insights (AI-generated) */}
      <div className="insights">
        <h3>💡 Insights</h3>
        <ul>
          {metrics.insights.map((insight, i) => (
            <li key={i} className={`insight-${insight.type}`}>
              {insight.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, change, trend }) {
  return (
    <div className="metric-card">
      <div className="metric-title">{title}</div>
      <div className="metric-value">{value}</div>
      {subtitle && <div className="metric-subtitle">{subtitle}</div>}
      {change && (
        <div className={`metric-change ${trend}`}>
          {trend === 'up' ? '↑' : '↓'} {change}%
        </div>
      )}
    </div>
  );
}
```

---

### 3.5 AI Integration Points

**1. Automated Insights Generation**

```javascript
// AI Insight Generator
class InsightGenerator {
  async generateInsights(metrics, historicalData) {
    const insights = [];

    // Revenue trend
    if (metrics.revenueTrend === 'down' && metrics.revenueChange < -10) {
      insights.push({
        type: 'warning',
        text: `Revenue is down ${Math.abs(metrics.revenueChange)}% this ${timeRange}. Consider running a promotion or checking customer feedback.`
      });
    }

    // Peak hours
    const peakHour = metrics.ordersByHour.indexOf(Math.max(...metrics.ordersByHour));
    insights.push({
      type: 'info',
      text: `Your busiest hour is ${peakHour}:00. Ensure adequate staffing during this time.`
    });

    // Top item performance
    const topItem = metrics.topItems[0];
    if (topItem) {
      insights.push({
        type: 'success',
        text: `"${topItem.name}" is your best seller with ${topItem.count} orders. Consider promoting similar items.`
      });
    }

    // Commission analysis
    const commissionPercentage = (metrics.totalCommissions / metrics.totalRevenue) * 100;
    if (commissionPercentage > 25) {
      insights.push({
        type: 'warning',
        text: `You're paying ${commissionPercentage.toFixed(1)}% in delivery commissions. Promoting direct orders could save ${formatCurrency(metrics.totalCommissions * 0.5)}/month.`
      });
    }

    // New vs. returning customers
    const returningRate = (metrics.returningCustomers / metrics.totalOrders) * 100;
    if (returningRate < 30) {
      insights.push({
        type: 'warning',
        text: `Only ${returningRate.toFixed(0)}% of orders are from returning customers. Consider implementing a loyalty program.`
      });
    }

    // Use GPT-4 for advanced insights
    const aiInsights = await this.generateAdvancedInsights(metrics, historicalData);
    insights.push(...aiInsights);

    return insights;
  }

  async generateAdvancedInsights(metrics, historicalData) {
    const prompt = `Analyze this restaurant's performance data and provide 2-3 actionable insights:

Current Period:
- Revenue: ${metrics.totalRevenue}
- Orders: ${metrics.totalOrders}
- AOV: ${metrics.avgOrderValue}
- Top item: ${metrics.topItems[0].name} (${metrics.topItems[0].count} orders)

Historical Trend:
- Revenue change: ${metrics.revenueChange}%
- Orders change: ${metrics.ordersChange}%

Commission costs: ${metrics.totalCommissions} (${(metrics.totalCommissions / metrics.totalRevenue * 100).toFixed(1)}% of revenue)

Provide insights that are:
1. Data-driven
2. Actionable (specific steps to take)
3. Concise (1-2 sentences each)

Return as JSON array: [{ "type": "warning|info|success", "text": "..." }]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a restaurant analytics expert. Provide actionable business insights based on data.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3
    });

    return JSON.parse(response.choices[0].message.content);
  }
}
```

**2. Anomaly Detection**

```javascript
// Detect unusual patterns
class AnomalyDetector {
  async detectAnomalies(restaurantId) {
    const todayMetrics = await this.getTodayMetrics(restaurantId);
    const historicalAvg = await this.getHistoricalAverage(restaurantId);

    const anomalies = [];

    // Revenue anomaly
    if (todayMetrics.totalRevenue < historicalAvg.revenue * 0.7) {
      anomalies.push({
        type: 'critical',
        metric: 'revenue',
        message: `Revenue today (${formatCurrency(todayMetrics.totalRevenue)}) is 30%+ below average. Check if there are operational issues.`
      });
    }

    // Order spike
    if (todayMetrics.totalOrders > historicalAvg.orders * 1.5) {
      anomalies.push({
        type: 'info',
        metric: 'orders',
        message: `Order volume is 50%+ higher than usual. Ensure kitchen can handle the load.`
      });
    }

    // Slow orders
    if (todayMetrics.avgPrepTime > historicalAvg.prepTime * 1.3) {
      anomalies.push({
        type: 'warning',
        metric: 'prep_time',
        message: `Orders are taking 30% longer to prepare. Check kitchen efficiency.`
      });
    }

    return anomalies;
  }
}
```

**3. Demand Forecasting**
- Predict next week's revenue (time series analysis)
- Suggest inventory levels (avoid stockouts)
- Recommend staff scheduling (based on predicted demand)

**4. Menu Engineering (AI-Powered)**
- Categorize items: Stars, Plowhorses, Puzzles, Dogs
- Suggest price changes (elasticity analysis)
- Recommend menu changes (remove underperformers)

---

### 3.6 Critical Risks & Challenges

**Risk 1: Data Quality**
- Garbage in, garbage out
- If order data is incomplete, analytics are useless
- Mitigation: Data validation, error alerts

**Risk 2: Performance**
- Aggregating millions of orders is slow
- Mitigation: Pre-calculate daily metrics, use caching (Redis)

**Risk 3: Privacy/GDPR**
- Customer data must be anonymized in reports
- Mitigation: Aggregate data only, no PII in analytics

**Risk 4: AI Hallucinations**
- GPT-4 might generate incorrect insights
- Mitigation: Fact-check AI outputs, human review

**Risk 5: Forecast Accuracy**
- Simple models are often wrong
- Mitigation: Show confidence levels, don't over-promise

---

### 3.7 Implementation Timeline

**Week 1-2:**
- [ ] Database schema (daily_metrics table)
- [ ] Data aggregation service (calculate daily metrics)
- [ ] Basic analytics API (revenue, orders, AOV)

**Week 3-4:**
- [ ] Frontend dashboard (key metrics cards)
- [ ] Revenue by source chart
- [ ] Peak hours heatmap
- [ ] Top items table

**Week 5:**
- [ ] Sales forecasting (simple moving average)
- [ ] Forecast chart

**Week 6:**
- [ ] AI insight generation (GPT-4)
- [ ] Anomaly detection

**Week 7-8:**
- [ ] Menu engineering (advanced analytics)
- [ ] Export reports (PDF, CSV)
- [ ] Polish & testing

---

### 3.8 Success Metrics

**KPIs:**
- Dashboard load time (< 2 seconds)
- Forecast accuracy (within 20% of actual)
- Insight actionability (% of insights acted upon)
- User engagement (dashboard views per week)

**Goal:**
- 90%+ of customers check dashboard daily
- 3+ actionable insights per week
- 80%+ forecast accuracy

---

## MODULE 4: Own Online Ordering 🛒

**Business Value:** CRITICAL (Replace 30% Wolt commission!)
**Technical Complexity:** MEDIUM
**AI Opportunity:** MEDIUM

---

### 4.1 Problem Statement

**Current Pain:**
- Wolt/Foodora take 30% commission (HUGE cost!)
- Restaurant on €100K revenue/month → €30K to delivery platforms
- No direct customer relationship (Wolt owns the data)
- Can't control branding, pricing, upsells

**Opportunity:**
- Own online ordering (0% commission, or 1-3% processing only)
- Customer data stays with restaurant
- Full branding control
- Upselling & cross-selling opportunities

**Examples:**
- HeapsGO does this (but no delivery aggregation)
- Munu does this (but requires their POS)
- We do this + aggregation + works with any POS

---

### 4.2 Solution: White-Label Online Ordering

**Features:**

**1. Customer-Facing Ordering Website**
- Custom domain (e.g., yourrestaurant.no/order)
- Or subdomain (yourrestaurant.order.restos.pro)
- Mobile-optimized (most orders are mobile!)
- Fast loading (< 2 seconds)

**2. QR Code Menu**
- Scan QR code at table → order on phone
- No waiter needed (self-service)
- Pay via phone (Vipps, card)
- Order sent to kitchen automatically

**3. Menu Display**
- Categories (Burgers, Sides, Drinks, Desserts)
- Items with photos, descriptions, prices
- Modifiers (extra cheese, no onions)
- Dietary tags (vegetarian, gluten-free, vegan)
- Allergen information

**4. Shopping Cart**
- Add items, adjust quantity
- Special instructions ("no pickles")
- Upsells ("Add fries for kr 20?")
- Cross-sells ("People also ordered...")

**5. Checkout**
- Order type: Pickup, Delivery, Dine-in
- Scheduled ordering ("Ready at 18:00")
- Customer info (name, phone, email)
- Delivery address (if applicable)
- Payment: Vipps, Stripe (card), Cash (pickup only)

**6. Order Confirmation**
- Confirmation page ("Your order is received!")
- Email/SMS confirmation
- Order tracking ("Your order is being prepared...")
- Estimated ready time

**7. Branding Customization**
- Restaurant logo, colors, fonts
- Custom header/footer
- Social media links
- Photos, videos

---

### 4.3 Technical Architecture

**Frontend (Customer-Facing):**

```jsx
// Online Ordering App (React)
function OnlineOrderingApp({ restaurantSlug }) {
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    loadRestaurant();
    loadMenu();
  }, [restaurantSlug]);

  const loadRestaurant = async () => {
    const data = await api.get(`/public/restaurants/${restaurantSlug}`);
    setRestaurant(data);
    
    // Apply custom branding
    document.documentElement.style.setProperty('--primary-color', data.brandColor);
    document.title = `Order from ${data.name}`;
  };

  const loadMenu = async () => {
    const data = await api.get(`/public/restaurants/${restaurantSlug}/menu`);
    setMenu(data);
  };

  const addToCart = (item, modifiers = [], quantity = 1) => {
    setCart([...cart, { item, modifiers, quantity }]);
  };

  return (
    <div className="ordering-app" style={{ '--brand-color': restaurant?.brandColor }}>
      <Header restaurant={restaurant} />
      <MenuCategories menu={menu} onAddToCart={addToCart} />
      <Cart cart={cart} />
      <Checkout cart={cart} restaurant={restaurant} />
    </div>
  );
}

// Menu Categories
function MenuCategories({ menu, onAddToCart }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (!menu) return <Loading />;

  const categories = menu.categories;
  const displayCategory = selectedCategory || categories[0];

  return (
    <div className="menu-section">
      <div className="category-tabs">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={displayCategory.id === cat.id ? 'active' : ''}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="menu-items">
        {displayCategory.items.map(item => (
          <MenuItem key={item.id} item={item} onAdd={onAddToCart} />
        ))}
      </div>
    </div>
  );
}

// Menu Item Card
function MenuItem({ item, onAdd }) {
  const [showModifiers, setShowModifiers] = useState(false);

  return (
    <div className="menu-item-card" onClick={() => setShowModifiers(true)}>
      {item.imageUrl && (
        <img src={item.imageUrl} alt={item.name} />
      )}
      <div className="item-info">
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="item-footer">
          <span className="price">kr {item.price}</span>
          {item.dietary && (
            <span className="dietary-tags">
              {item.dietary.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </span>
          )}
        </div>
      </div>

      {showModifiers && (
        <ModifierModal
          item={item}
          onClose={() => setShowModifiers(false)}
          onAdd={(modifiers, quantity) => {
            onAdd(item, modifiers, quantity);
            setShowModifiers(false);
          }}
        />
      )}
    </div>
  );
}

// Modifiers Modal
function ModifierModal({ item, onClose, onAdd }) {
  const [selectedModifiers, setSelectedModifiers] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const calculateTotal = () => {
    const basePrice = item.price;
    const modifiersPrice = selectedModifiers.reduce((sum, mod) => sum + mod.price, 0);
    return (basePrice + modifiersPrice) * quantity;
  };

  const handleAddToCart = () => {
    onAdd(selectedModifiers, quantity, specialInstructions);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modifier-modal" onClick={e => e.stopPropagation()}>
        <h2>{item.name}</h2>
        <img src={item.imageUrl} alt={item.name} />

        {item.modifierGroups?.map(group => (
          <div key={group.id} className="modifier-group">
            <h3>
              {group.name}
              {group.required && <span className="required">*</span>}
            </h3>
            {group.options.map(option => (
              <label key={option.id}>
                <input
                  type={group.multiSelect ? 'checkbox' : 'radio'}
                  name={group.id}
                  checked={selectedModifiers.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      if (group.multiSelect) {
                        setSelectedModifiers([...selectedModifiers, option]);
                      } else {
                        setSelectedModifiers([
                          ...selectedModifiers.filter(m => m.groupId !== group.id),
                          option
                        ]);
                      }
                    } else {
                      setSelectedModifiers(selectedModifiers.filter(m => m !== option));
                    }
                  }}
                />
                <span>{option.name}</span>
                {option.price > 0 && <span className="modifier-price">+kr {option.price}</span>}
              </label>
            ))}
          </div>
        ))}

        <div className="special-instructions">
          <textarea
            placeholder="Special instructions (optional)"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
          />
        </div>

        <div className="quantity-selector">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)}>+</button>
        </div>

        <button className="add-to-cart" onClick={handleAddToCart}>
          Add to Cart - kr {calculateTotal()}
        </button>
      </div>
    </div>
  );
}

// Checkout
function Checkout({ cart, restaurant }) {
  const [orderType, setOrderType] = useState('pickup'); // 'pickup', 'delivery', 'dinein'
  const [customerInfo, setCustomerInfo] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('vipps');

  const subtotal = cart.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
  const deliveryFee = orderType === 'delivery' ? 50 : 0;
  const total = subtotal + deliveryFee;

  const handleSubmitOrder = async () => {
    const order = {
      restaurantId: restaurant.id,
      items: cart,
      orderType,
      customerInfo,
      subtotal,
      deliveryFee,
      total,
      paymentMethod
    };

    // Create order
    const response = await api.post('/public/orders', order);

    // Redirect to payment (Vipps or Stripe)
    if (paymentMethod === 'vipps') {
      window.location.href = response.vippsPaymentUrl;
    } else if (paymentMethod === 'card') {
      window.location.href = response.stripeCheckoutUrl;
    } else {
      // Cash - just show confirmation
      window.location.href = `/order-confirmation/${response.orderId}`;
    }
  };

  return (
    <div className="checkout-section">
      <h2>Checkout</h2>

      <div className="order-type-selector">
        <button 
          className={orderType === 'pickup' ? 'active' : ''}
          onClick={() => setOrderType('pickup')}
        >
          🏃 Pickup
        </button>
        <button 
          className={orderType === 'delivery' ? 'active' : ''}
          onClick={() => setOrderType('delivery')}
        >
          🚚 Delivery
        </button>
        <button 
          className={orderType === 'dinein' ? 'active' : ''}
          onClick={() => setOrderType('dinein')}
        >
          🍽️ Dine-in
        </button>
      </div>

      <div className="customer-info-form">
        <input
          type="text"
          placeholder="Name *"
          value={customerInfo.name || ''}
          onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
        />
        <input
          type="tel"
          placeholder="Phone *"
          value={customerInfo.phone || ''}
          onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={customerInfo.email || ''}
          onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
        />

        {orderType === 'delivery' && (
          <input
            type="text"
            placeholder="Delivery Address *"
            value={customerInfo.address || ''}
            onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
          />
        )}

        {orderType === 'dinein' && (
          <input
            type="text"
            placeholder="Table Number"
            value={customerInfo.tableNumber || ''}
            onChange={(e) => setCustomerInfo({ ...customerInfo, tableNumber: e.target.value })}
          />
        )}
      </div>

      <div className="order-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>kr {subtotal}</span>
        </div>
        {orderType === 'delivery' && (
          <div className="summary-row">
            <span>Delivery Fee:</span>
            <span>kr {deliveryFee}</span>
          </div>
        )}
        <div className="summary-row total">
          <span>Total:</span>
          <span>kr {total}</span>
        </div>
      </div>

      <div className="payment-method-selector">
        <label>
          <input
            type="radio"
            name="payment"
            value="vipps"
            checked={paymentMethod === 'vipps'}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <img src="/vipps-logo.svg" alt="Vipps" />
        </label>
        <label>
          <input
            type="radio"
            name="payment"
            value="card"
            checked={paymentMethod === 'card'}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <span>💳 Credit Card</span>
        </label>
        {orderType === 'pickup' && (
          <label>
            <input
              type="radio"
              name="payment"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>💵 Cash (Pay at pickup)</span>
          </label>
        )}
      </div>

      <button 
        className="submit-order-btn"
        onClick={handleSubmitOrder}
        disabled={!customerInfo.name || !customerInfo.phone}
      >
        Place Order - kr {total}
      </button>
    </div>
  );
}
```

**Backend:**

```javascript
// Public Orders API (no auth required)
app.post('/public/orders', async (req, res) => {
  const { restaurantId, items, orderType, customerInfo, total, paymentMethod } = req.body;

  // Validate
  if (!restaurantId || !items || items.length === 0) {
    return res.status(400).json({ error: 'Invalid order' });
  }

  // Create order
  const order = await db.orders.create({
    restaurantId,
    source: 'direct',
    orderType,
    customerName: customerInfo.name,
    customerPhone: customerInfo.phone,
    customerEmail: customerInfo.email,
    deliveryAddress: customerInfo.address,
    tableNumber: customerInfo.tableNumber,
    items,
    totalAmount: total,
    status: 'pending_payment',
    paymentMethod,
    commissionAmount: 0, // No commission for direct orders!
    netRevenue: total
  });

  // Generate payment link
  if (paymentMethod === 'vipps') {
    const vippsPayment = await vipps.initiatePayment({
      amount: total,
      orderReference: order.id,
      callbackUrl: `${process.env.API_URL}/webhooks/vipps/${order.id}`
    });

    return res.json({
      orderId: order.id,
      vippsPaymentUrl: vippsPayment.url
    });
  } else if (paymentMethod === 'card') {
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'nok',
          product_data: { name: item.item.name },
          unit_amount: item.item.price * 100 // Stripe uses cents
        },
        quantity: item.quantity
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/order-confirmation/${order.id}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout`
    });

    return res.json({
      orderId: order.id,
      stripeCheckoutUrl: stripeSession.url
    });
  } else if (paymentMethod === 'cash') {
    // Cash - mark as pending, will be paid on pickup
    await db.orders.update({ id: order.id }, { status: 'new' });

    return res.json({
      orderId: order.id,
      message: 'Order received. Pay cash when you pick up.'
    });
  }
});

// Vipps Webhook (payment confirmation)
app.post('/webhooks/vipps/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (status === 'RESERVED' || status === 'SALE') {
    // Payment successful!
    await db.orders.update({ id: orderId }, { 
      status: 'new',
      paymentStatus: 'paid'
    });

    // Send to kitchen
    const order = await db.orders.findById(orderId);
    kdsSocket.broadcast('new-order', order);

    // Send confirmation SMS/email
    await sendOrderConfirmation(order);
  }

  res.json({ ok: true });
});
```

---

### 4.4 QR Code Menu

**Feature:** Scan QR code at table → order without waiter

```javascript
// Generate QR Code for Table
const QRCode = require('qrcode');

async function generateTableQR(restaurantId, tableNumber) {
  const orderUrl = `https://order.restos.pro/${restaurantSlug}?table=${tableNumber}`;
  const qrCodeDataUrl = await QRCode.toDataURL(orderUrl);
  
  // Save QR code image
  const qrCodePath = `/qr-codes/${restaurantId}/table-${tableNumber}.png`;
  await saveImage(qrCodePath, qrCodeDataUrl);

  return qrCodePath;
}

// When customer scans QR code:
// 1. Load menu
// 2. Pre-fill "Dine-in" order type
// 3. Pre-fill table number
// 4. Customer orders & pays on phone
// 5. Order sent to kitchen (no waiter needed!)
```

---

### 4.5 AI Integration Points

**1. Smart Upsells**
- "People who ordered Burger also ordered Fries" (collaborative filtering)
- ML model learns patterns
- Increase average order value by 15-20%

**2. Dynamic Pricing (Advanced)**
- Adjust prices based on demand (surge pricing)
- Lower prices during slow hours (happy hour automation)
- Requires careful implementation (can upset customers)

**3. Personalized Recommendations**
- Track customer order history
- "You might also like..." based on past orders
- Email/SMS: "Your favorite burger is back!"

**4. Menu Optimization**
- A/B test item descriptions, photos
- ML model: Which descriptions convert better?
- "20% more orders when photo is added"

---

### 4.6 Critical Risks & Challenges

**Risk 1: Payment Processing**
- Stripe/Vipps fees (2.5-3%)
- Chargebacks, fraud
- Mitigation: Use established providers, fraud detection

**Risk 2: Delivery Logistics**
- Own ordering doesn't include delivery drivers
- Mitigation: Integrate Wolt Drive API (delivery-as-a-service)

**Risk 3: Customer Acquisition**
- "Build it and they will come" doesn't work
- Need marketing to drive traffic to own ordering
- Mitigation: QR codes, social media, Google Business link

**Risk 4: Mobile Performance**
- Slow loading = abandoned carts
- Mitigation: Optimize images, lazy loading, CDN

**Risk 5: Competition from Delivery Platforms**
- Wolt/Foodora have massive user bases
- Customers prefer using one app for all restaurants
- Mitigation: Focus on repeat customers, loyalty programs

---

### 4.7 Implementation Timeline

**Week 1-2:**
- [ ] Database schema (menu, modifiers)
- [ ] Public API (menu, orders)
- [ ] Basic frontend (menu display, cart)

**Week 3:**
- [ ] Checkout flow
- [ ] Vipps integration
- [ ] Stripe integration

**Week 4:**
- [ ] Order confirmation page
- [ ] Email/SMS notifications
- [ ] QR code generation

**Week 5:**
- [ ] Branding customization (colors, logo)
- [ ] Mobile optimization

**Week 6:**
- [ ] Smart upsells (ML recommendations)
- [ ] Testing & polish

---

### 4.8 Success Metrics

**KPIs:**
- Direct orders as % of total (goal: 30%+)
- Conversion rate (visitors → orders) (goal: 5-10%)
- Average order value (track upsell effectiveness)
- Commission savings (vs. Wolt/Foodora)

**Goal:**
- 30% of orders come through own channel (save kr 90,000/year on €100K revenue)
- 5%+ conversion rate
- 20% higher AOV (due to upsells)

---

**(Continuing with remaining modules... Dette blir MASSIVT! Skal jeg fortsette full speed eller pause for feedback?)** 🚀

**8 moduler igjen:**
- Module 5: Menu Management
- Module 6: POS Integration  
- Module 7: Delivery Integration
- Module 8: Accounting Integration
- Module 9: Staff Scheduling
- Module 10: Inventory Management
- Module 11: Customer Loyalty
- Module 12: AI Strategy (overarching)

**Continue?** 💪
