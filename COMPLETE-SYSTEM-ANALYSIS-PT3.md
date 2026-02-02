# 🔬 COMPLETE SYSTEM ANALYSIS - Part 3: Core Integrations

**Continuation of Part 2**

---

## MODULE 5: Menu Management 📋

**Business Value:** MEDIUM (Foundation for all other modules)
**Technical Complexity:** MEDIUM
**AI Opportunity:** LOW

---

### 5.1 Problem Statement

**Current Pain:**
- Menu changes require updating multiple systems (POS, website, delivery platforms)
- Pricing inconsistencies across channels
- Out-of-stock items still visible (lost time, frustrated customers)
- No insight into item performance

**Opportunity:**
- Single source of truth for menu
- Update once, sync everywhere
- Real-time availability management
- Performance tracking per item

---

### 5.2 Solution: Unified Menu Management

**Features:**

**1. Menu Structure**
- Categories (Burgers, Sides, Drinks, Desserts)
- Items (with name, description, price)
- Modifiers (Add-ons, options, choices)
- Dietary tags (vegetarian, vegan, gluten-free)
- Allergen information
- Item images

**2. Pricing Management**
- Base price
- Size variants (Small, Medium, Large)
- Channel-specific pricing (Wolt price vs. direct price)
- Happy hour pricing (time-based)
- Dynamic pricing (demand-based - advanced)

**3. Availability Management**
- In stock / Out of stock
- Schedule availability (breakfast items only 7-11am)
- Auto-hide when sold out
- Inventory integration (auto-update when stock low)

**4. Menu Sync**
- Push to own online ordering
- Push to Wolt (via API)
- Push to Foodora (via API)
- Push to POS (if integration available)
- One-click "Publish to all channels"

**5. Menu Analytics**
- Best sellers (quantity + revenue)
- Worst sellers (candidates for removal)
- Item profitability (if COGS tracked)
- Menu engineering matrix (popularity vs. profitability)
- Trending items (growing or declining)

---

### 5.3 Technical Architecture

**Database Schema:**

```sql
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  name VARCHAR(255),
  description TEXT,
  display_order INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE menu_items (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  category_id UUID REFERENCES menu_categories(id),
  name VARCHAR(255),
  description TEXT,
  base_price DECIMAL(10,2),
  cost_of_goods DECIMAL(10,2),      -- For profitability calc
  image_url TEXT,
  dietary_tags TEXT[],              -- ['vegetarian', 'gluten-free']
  allergens TEXT[],                 -- ['nuts', 'dairy']
  available BOOLEAN DEFAULT true,
  display_order INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  INDEX(restaurant_id, active),
  INDEX(category_id)
);

CREATE TABLE menu_item_modifiers (
  id UUID PRIMARY KEY,
  item_id UUID REFERENCES menu_items(id),
  group_name VARCHAR(255),          -- "Size", "Add-ons", "Toppings"
  required BOOLEAN DEFAULT false,
  multi_select BOOLEAN DEFAULT false,
  options JSONB,                    -- [{ "name": "Extra Cheese", "price": 20 }]
  created_at TIMESTAMP
);

CREATE TABLE menu_item_variants (
  id UUID PRIMARY KEY,
  item_id UUID REFERENCES menu_items(id),
  name VARCHAR(255),                -- "Small", "Medium", "Large"
  price DECIMAL(10,2),
  active BOOLEAN DEFAULT true
);

CREATE TABLE menu_channel_pricing (
  id UUID PRIMARY KEY,
  item_id UUID REFERENCES menu_items(id),
  channel VARCHAR(50),              -- 'wolt', 'foodora', 'direct'
  price DECIMAL(10,2),              -- Override price for this channel
  active BOOLEAN DEFAULT true
);

CREATE TABLE menu_sync_log (
  id UUID PRIMARY KEY,
  restaurant_id UUID,
  channel VARCHAR(50),
  sync_type VARCHAR(50),            -- 'full', 'incremental'
  status VARCHAR(50),               -- 'success', 'failed'
  items_synced INTEGER,
  error_message TEXT,
  synced_at TIMESTAMP
);
```

**Backend API:**

```javascript
// Menu Management Service
class MenuManager {
  async getMenu(restaurantId) {
    const categories = await db.menuCategories.find({
      restaurantId,
      active: true
    }).sort({ displayOrder: 1 });

    const menu = [];
    
    for (const category of categories) {
      const items = await db.menuItems.find({
        categoryId: category.id,
        active: true,
        available: true
      }).sort({ displayOrder: 1 });

      // Load modifiers for each item
      for (const item of items) {
        item.modifiers = await db.menuItemModifiers.find({ itemId: item.id });
        item.variants = await db.menuItemVariants.find({ itemId: item.id, active: true });
      }

      menu.push({
        ...category,
        items
      });
    }

    return menu;
  }

  async updateItem(itemId, updates) {
    await db.menuItems.update({ id: itemId }, updates);

    // Trigger sync to all channels
    const item = await db.menuItems.findById(itemId);
    await this.syncToChannels(item.restaurantId);
  }

  async syncToChannels(restaurantId) {
    const menu = await this.getMenu(restaurantId);

    // Sync to all connected channels
    const channels = ['wolt', 'foodora', 'direct'];
    
    for (const channel of channels) {
      try {
        await this.syncToChannel(restaurantId, channel, menu);
        await db.menuSyncLog.create({
          restaurantId,
          channel,
          syncType: 'full',
          status: 'success',
          itemsSynced: menu.flatMap(c => c.items).length,
          syncedAt: new Date()
        });
      } catch (error) {
        await db.menuSyncLog.create({
          restaurantId,
          channel,
          syncType: 'full',
          status: 'failed',
          errorMessage: error.message,
          syncedAt: new Date()
        });
      }
    }
  }

  async syncToChannel(restaurantId, channel, menu) {
    switch (channel) {
      case 'wolt':
        await this.syncToWolt(restaurantId, menu);
        break;
      case 'foodora':
        await this.syncToFoodora(restaurantId, menu);
        break;
      case 'direct':
        // Already in our database, just mark as synced
        break;
    }
  }

  async syncToWolt(restaurantId, menu) {
    const restaurant = await db.restaurants.findById(restaurantId);
    const woltVenueId = restaurant.woltVenueId;

    if (!woltVenueId) {
      throw new Error('Wolt venue ID not configured');
    }

    // Transform our menu format to Wolt format
    const woltMenu = this.transformToWoltFormat(menu);

    // Push to Wolt API
    await wolt.updateMenu(woltVenueId, woltMenu);
  }

  transformToWoltFormat(menu) {
    // Wolt has specific JSON schema for menus
    return {
      categories: menu.map(cat => ({
        name: cat.name,
        description: cat.description,
        items: cat.items.map(item => ({
          name: item.name,
          description: item.description,
          price: item.basePrice * 100, // Wolt uses cents
          image: item.imageUrl,
          options: item.modifiers?.map(mod => ({
            name: mod.groupName,
            required: mod.required,
            multi_select: mod.multiSelect,
            choices: mod.options.map(opt => ({
              name: opt.name,
              price: opt.price * 100
            }))
          }))
        }))
      }))
    };
  }
}
```

**Frontend: Menu Editor**

```jsx
// Menu Management UI
function MenuManagement() {
  const [menu, setMenu] = useState(null);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    const data = await api.get('/menu');
    setMenu(data);
  };

  const updateItem = async (itemId, updates) => {
    await api.put(`/menu/items/${itemId}`, updates);
    loadMenu();
  };

  const syncToAllChannels = async () => {
    await api.post('/menu/sync');
    alert('Menu synced to all channels!');
  };

  return (
    <div className="menu-management">
      <div className="menu-header">
        <h1>Menu Management</h1>
        <button onClick={syncToAllChannels} className="btn-primary">
          🔄 Sync to All Channels
        </button>
      </div>

      {menu?.map(category => (
        <div key={category.id} className="category-section">
          <h2>{category.name}</h2>
          <div className="items-grid">
            {category.items.map(item => (
              <MenuItemCard
                key={item.id}
                item={item}
                onEdit={() => setEditing(item)}
                onUpdate={updateItem}
              />
            ))}
          </div>
        </div>
      ))}

      {editing && (
        <MenuItemEditor
          item={editing}
          onSave={(updates) => {
            updateItem(editing.id, updates);
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function MenuItemCard({ item, onEdit, onUpdate }) {
  const toggleAvailability = () => {
    onUpdate(item.id, { available: !item.available });
  };

  return (
    <div className={`menu-item-card ${!item.available ? 'unavailable' : ''}`}>
      <img src={item.imageUrl} alt={item.name} />
      <div className="item-info">
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="item-price">kr {item.basePrice}</div>
        <div className="item-actions">
          <button onClick={onEdit}>Edit</button>
          <button 
            onClick={toggleAvailability}
            className={item.available ? 'btn-success' : 'btn-warning'}
          >
            {item.available ? '✓ Available' : '⚠ Sold Out'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuItemEditor({ item, onSave, onCancel }) {
  const [form, setForm] = useState(item);

  return (
    <div className="modal">
      <div className="menu-editor">
        <h2>Edit {item.name}</h2>
        
        <label>
          Name
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>

        <label>
          Description
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>

        <label>
          Base Price (kr)
          <input
            type="number"
            value={form.basePrice}
            onChange={(e) => setForm({ ...form, basePrice: parseFloat(e.target.value) })}
          />
        </label>

        <label>
          Image URL
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
        </label>

        <label>
          Dietary Tags
          <select 
            multiple
            value={form.dietaryTags || []}
            onChange={(e) => setForm({ ...form, dietaryTags: Array.from(e.target.selectedOptions, opt => opt.value) })}
          >
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="gluten-free">Gluten-Free</option>
            <option value="dairy-free">Dairy-Free</option>
          </select>
        </label>

        <div className="editor-actions">
          <button onClick={() => onSave(form)} className="btn-primary">
            Save Changes
          </button>
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### 5.4 AI Integration Points

**1. Menu Optimization Recommendations**
- "Remove items with <5 orders/week"
- "Increase price of high-demand items by 10%"
- "Pair items: 80% who order Burger also order Fries"

**2. Dynamic Descriptions**
- GPT-4 generate appetizing descriptions
- "Juicy beef patty with melted cheddar, crispy bacon, and our secret sauce"
- A/B test descriptions

**3. Smart Pricing**
- Price elasticity analysis
- "If you increase burger price from kr 120 → kr 130, you'll lose 5% volume but gain 3% revenue"

---

### 5.5 Critical Risks

**Risk 1: Sync Failures**
- API down, schema mismatch
- Mitigation: Retry logic, error alerts

**Risk 2: Pricing Conflicts**
- Different prices on different channels (confusing)
- Mitigation: Clear channel pricing rules

**Risk 3: Out-of-Stock Delays**
- Item marked sold out, but still shows on Wolt for 10 minutes
- Mitigation: Webhook-based instant updates

---

### 5.6 Implementation Timeline

**Week 1:**
- [ ] Database schema
- [ ] CRUD API (create, read, update, delete items)
- [ ] Basic menu editor UI

**Week 2:**
- [ ] Category management
- [ ] Modifiers/variants
- [ ] Image upload

**Week 3:**
- [ ] Wolt API sync
- [ ] Foodora API sync
- [ ] Sync status dashboard

**Week 4:**
- [ ] Channel-specific pricing
- [ ] Availability management
- [ ] Polish & testing

---

## MODULE 6: POS Integration 💳

**Business Value:** CRITICAL (Unified sales data!)
**Technical Complexity:** HIGH
**AI Opportunity:** LOW

---

### 6.1 Problem Statement

**Current Pain:**
- Sales data fragmented (POS, online orders, delivery platforms)
- Manual reconciliation at end of day (hours of work)
- No real-time unified revenue view
- Accounting nightmare (export CSV, import, reconcile)

**Opportunity:**
- All sales data in one place
- Real-time revenue tracking (POS + online)
- Automatic accounting sync
- No more manual reconciliation

---

### 6.2 Solution: Multi-POS Integration Layer

**Target POS Systems (Norway):**
1. **Favrit** - Modern Norwegian POS (Kim uses this!)
2. **NanoPOS (UniTouch)** - Kim has API access!
3. **Zettle** - PayPal's POS (RestOS-New has code)
4. **Munu POS** - If they have API
5. **Generic fallback** - Manual CSV import

**Features:**

**1. Transaction Sync**
- Fetch all transactions from POS
- Real-time (webhook) or polling (every 5 min)
- Normalize to unified format
- Store in RestOS database

**2. Sales Reconciliation**
- Match POS sales + online orders
- Calculate total daily revenue
- Identify discrepancies (missing transactions)

**3. Menu Sync (Bidirectional)**
- POS → RestOS (import existing menu)
- RestOS → POS (update prices, items)
- Keep in sync

**4. Inventory Sync**
- POS tracks stock levels
- RestOS reads inventory
- Auto-mark items sold out

**5. Payment Reconciliation**
- Cash, card, Vipps, etc.
- Match payment methods to accounting categories
- Export to Tripletex/Fiken

---

### 6.3 Technical Architecture

**Integration Abstraction Layer:**

```javascript
// POS Integration Interface
class POSIntegration {
  async connect(credentials) {
    throw new Error('Not implemented');
  }

  async fetchTransactions(startDate, endDate) {
    throw new Error('Not implemented');
  }

  async syncMenu() {
    throw new Error('Not implemented');
  }

  async getInventory() {
    throw new Error('Not implemented');
  }
}

// Favrit Integration
class FavritIntegration extends POSIntegration {
  constructor(apiKey, venueId) {
    super();
    this.apiKey = apiKey;
    this.venueId = venueId;
    this.baseUrl = 'https://api.favrit.com'; // (assumed URL)
  }

  async connect() {
    // Test API connection
    const response = await fetch(`${this.baseUrl}/venues/${this.venueId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    return response.ok;
  }

  async fetchTransactions(startDate, endDate) {
    const response = await fetch(
      `${this.baseUrl}/venues/${this.venueId}/transactions?start=${startDate}&end=${endDate}`,
      { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
    );
    const data = await response.json();

    // Normalize to our format
    return data.transactions.map(tx => this.normalizeTransaction(tx));
  }

  normalizeTransaction(tx) {
    return {
      externalId: tx.id,
      source: 'favrit',
      timestamp: tx.timestamp,
      totalAmount: tx.total,
      paymentMethod: tx.payment_method,
      items: tx.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      customer: {
        name: tx.customer_name,
        phone: tx.customer_phone
      }
    };
  }

  async syncMenu() {
    const response = await fetch(
      `${this.baseUrl}/venues/${this.venueId}/menu`,
      { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
    );
    const menu = await response.json();

    // Convert Favrit menu to RestOS format
    return this.transformMenu(menu);
  }

  async getInventory() {
    const response = await fetch(
      `${this.baseUrl}/venues/${this.venueId}/inventory`,
      { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
    );
    return await response.json();
  }
}

// NanoPOS Integration (similar structure)
class NanoPOSIntegration extends POSIntegration {
  constructor(credentials) {
    super();
    this.credentials = credentials;
    this.baseUrl = 'https://api.nanopos.no'; // (to be confirmed)
  }

  async fetchTransactions(startDate, endDate) {
    // NanoPOS-specific API calls
    // Kim has access - need to research actual API endpoints
  }
}

// Zettle Integration (from RestOS-New)
class ZettleIntegration extends POSIntegration {
  // Can copy code from RestOS-New project
  // Has OAuth flow, product sync, inventory sync
}
```

**Sync Service:**

```javascript
// POS Sync Service
class POSSyncService {
  constructor() {
    this.integrations = new Map();
  }

  async registerIntegration(restaurantId, posType, credentials) {
    let integration;

    switch (posType) {
      case 'favrit':
        integration = new FavritIntegration(credentials.apiKey, credentials.venueId);
        break;
      case 'nanopos':
        integration = new NanoPOSIntegration(credentials);
        break;
      case 'zettle':
        integration = new ZettleIntegration(credentials);
        break;
      default:
        throw new Error(`Unsupported POS type: ${posType}`);
    }

    // Test connection
    const connected = await integration.connect();
    if (!connected) {
      throw new Error('Failed to connect to POS');
    }

    // Save integration
    await db.posIntegrations.create({
      restaurantId,
      posType,
      credentials: encrypt(credentials),
      status: 'connected',
      connectedAt: new Date()
    });

    this.integrations.set(restaurantId, integration);
  }

  async syncTransactions(restaurantId) {
    const integration = this.integrations.get(restaurantId);
    if (!integration) {
      throw new Error('POS integration not found');
    }

    // Sync last 24 hours
    const startDate = new Date(Date.now() - 86400000);
    const endDate = new Date();

    const transactions = await integration.fetchTransactions(startDate, endDate);

    // Save to database
    for (const tx of transactions) {
      // Check if already exists
      const exists = await db.orders.findOne({
        externalId: tx.externalId,
        source: tx.source
      });

      if (!exists) {
        await db.orders.create({
          restaurantId,
          ...tx,
          status: 'completed' // POS transactions are already completed
        });
      }
    }

    // Update sync log
    await db.posSyncLog.create({
      restaurantId,
      posType: integration.constructor.name,
      transactionsSynced: transactions.length,
      syncedAt: new Date()
    });
  }

  async syncAllRestaurants() {
    const restaurants = await db.posIntegrations.find({ status: 'connected' });

    for (const restaurant of restaurants) {
      try {
        await this.syncTransactions(restaurant.restaurantId);
      } catch (error) {
        console.error(`Sync failed for restaurant ${restaurant.restaurantId}:`, error);
      }
    }
  }
}

// Cron job: Sync every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  await posSyncService.syncAllRestaurants();
});
```

**Database Schema:**

```sql
CREATE TABLE pos_integrations (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  pos_type VARCHAR(50),             -- 'favrit', 'nanopos', 'zettle'
  credentials_encrypted TEXT,       -- Encrypted API keys
  status VARCHAR(50),               -- 'connected', 'disconnected', 'error'
  last_sync_at TIMESTAMP,
  connected_at TIMESTAMP,
  error_message TEXT,
  UNIQUE(restaurant_id, pos_type)
);

CREATE TABLE pos_sync_log (
  id UUID PRIMARY KEY,
  restaurant_id UUID,
  pos_type VARCHAR(50),
  transactions_synced INTEGER,
  status VARCHAR(50),               -- 'success', 'failed'
  error_message TEXT,
  synced_at TIMESTAMP
);
```

---

### 6.4 AI Integration Points

**1. Transaction Reconciliation**
- ML model: Detect duplicate transactions
- "This POS transaction matches this online order (same customer, time, items)"
- Avoid double-counting

**2. Fraud Detection**
- Anomaly detection: Unusual transactions
- "Employee discount used 20 times in one shift"
- "Void rate is 10x higher than normal"

**3. Sales Attribution**
- "This online order came through QR code at Table 5"
- Attribution modeling (which marketing channel drove sale?)

---

### 6.5 Critical Risks

**Risk 1: API Access**
- POS vendors may not have public APIs
- Mitigation: Manual CSV import fallback

**Risk 2: Rate Limits**
- API calls limited (1000/day, etc.)
- Mitigation: Webhook-based (push, not poll)

**Risk 3: Data Schema Changes**
- POS vendor changes API format
- Mitigation: Version pinning, monitoring

**Risk 4: Credentials Security**
- API keys must be encrypted
- Mitigation: Use KMS (AWS Secrets Manager)

**Risk 5: Sync Lag**
- 15-minute sync means data is stale
- Mitigation: Webhook-based real-time (if available)

---

### 6.6 Implementation Timeline

**Week 1-2: Favrit Integration** (Kim's primary POS!)
- [ ] Research Favrit API (documentation)
- [ ] OAuth/API key flow
- [ ] Transaction fetch
- [ ] Test with Kim's restaurant data

**Week 3: NanoPOS Integration**
- [ ] Research NanoPOS API
- [ ] Similar structure to Favrit
- [ ] Test with Kim's access

**Week 4: Zettle Integration**
- [ ] Copy code from RestOS-New
- [ ] Adapt to RestOS Pro architecture
- [ ] Test

**Week 5:**
- [ ] Generic CSV import (fallback)
- [ ] Sync status dashboard
- [ ] Error handling & monitoring

**Week 6:**
- [ ] Menu sync (bidirectional)
- [ ] Inventory sync
- [ ] Polish & testing

---

### 6.7 Success Metrics

**KPIs:**
- Sync success rate (goal: 99%+)
- Data lag (goal: <15 minutes)
- Transaction match rate (POS + online reconciliation)
- Manual work reduction (hours saved per week)

**Goal:**
- 100% of POS transactions synced automatically
- Zero manual reconciliation
- Real-time unified revenue dashboard

---

## MODULE 7: Delivery Integration 🛵

**Business Value:** CRITICAL (Order aggregation!)
**Technical Complexity:** HIGH
**AI Opportunity:** MEDIUM

---

### 7.1 Problem Statement (recap from earlier)

**Current Pain:**
- Wolt tablet + Foodora tablet + Uber Eats tablet = Chaos!
- 30% commission (expensive!)
- Orders missed, delays, errors

**Opportunity:**
- Unified order view (like Deliverect)
- Commission tracking (which platform costs most?)
- Menu sync (update once)

---

### 7.2 Solution: Delivery Platform Aggregation

**Target Platforms:**
1. **Wolt** (Norway market leader)
2. **Foodora** (strong presence)
3. **Uber Eats** (international)
4. **Just Eat** (UK/Europe)

**Features:**

**1. Order Aggregation** (already covered in Module 1)
- Fetch orders from all platforms
- Unified order list
- Kitchen display shows all

**2. Menu Sync**
- RestOS menu → Push to Wolt
- RestOS menu → Push to Foodora
- Update once, sync everywhere

**3. Commission Tracking**
- Track how much each platform takes
- "Wolt: kr 12,000 this month (30%)"
- "Foodora: kr 8,000 this month (25%)"
- Recommend cheaper platform

**4. Performance Comparison**
- Which platform drives most orders?
- Which has highest AOV?
- Which has best customer retention?

**5. Auto-Accept Orders**
- Automatically accept incoming orders
- No manual tablet checking
- Set rules ("Auto-accept if prep time < 30 min")

---

### 7.3 Technical Architecture

**(Already covered in Module 1 - Order Aggregation)**

**Additional: Menu Sync**

```javascript
// Delivery Platform Menu Sync
class DeliveryMenuSync {
  async syncToWolt(restaurantId, menu) {
    const restaurant = await db.restaurants.findById(restaurantId);
    
    if (!restaurant.woltVenueId) {
      throw new Error('Wolt venue not configured');
    }

    const woltMenu = this.transformToWoltFormat(menu);

    await wolt.updateMenu(restaurant.woltVenueId, woltMenu);
  }

  async syncToFoodora(restaurantId, menu) {
    const restaurant = await db.restaurants.findById(restaurantId);
    
    if (!restaurant.foodoraRestaurantId) {
      throw new Error('Foodora restaurant not configured');
    }

    const foodoraMenu = this.transformToFoodoraFormat(menu);

    await foodora.updateMenu(restaurant.foodoraRestaurantId, foodoraMenu);
  }

  transformToWoltFormat(menu) {
    // Wolt-specific JSON schema
    return {
      categories: menu.map(cat => ({
        name: cat.name,
        items: cat.items.map(item => ({
          name: item.name,
          description: item.description,
          price_in_cents: item.basePrice * 100,
          image_url: item.imageUrl,
          available: item.available
        }))
      }))
    };
  }

  transformToFoodoraFormat(menu) {
    // Foodora-specific JSON schema
    // Similar but different field names
    return {
      menu_sections: menu.map(cat => ({
        title: cat.name,
        products: cat.items.map(item => ({
          title: item.name,
          description: item.description,
          price: item.basePrice,
          image: item.imageUrl,
          in_stock: item.available
        }))
      }))
    };
  }
}
```

**Commission Analytics:**

```javascript
// Commission Tracker
class CommissionAnalytics {
  async calculateMonthlyCommissions(restaurantId, month) {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const orders = await db.orders.find({
      restaurantId,
      source: { $in: ['wolt', 'foodora', 'uberEats'] },
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      status: 'completed'
    });

    const commissions = {
      wolt: { orders: 0, revenue: 0, commission: 0, rate: 0.30 },
      foodora: { orders: 0, revenue: 0, commission: 0, rate: 0.25 },
      uberEats: { orders: 0, revenue: 0, commission: 0, rate: 0.30 }
    };

    orders.forEach(order => {
      const platform = order.source;
      if (commissions[platform]) {
        commissions[platform].orders++;
        commissions[platform].revenue += order.totalAmount;
        commissions[platform].commission += order.commissionAmount;
      }
    });

    // Calculate total
    const total = {
      orders: orders.length,
      revenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      commission: orders.reduce((sum, o) => sum + o.commissionAmount, 0)
    };

    return { commissions, total };
  }

  async generateInsights(commissions) {
    const insights = [];

    // Most expensive platform
    const platforms = Object.entries(commissions.commissions);
    platforms.sort((a, b) => b[1].commission - a[1].commission);
    const mostExpensive = platforms[0];

    insights.push({
      type: 'warning',
      text: `${mostExpensive[0]} is your most expensive platform: kr ${mostExpensive[1].commission} in commissions this month (${(mostExpensive[1].rate * 100)}%).`
    });

    // Savings opportunity
    const totalCommission = commissions.total.commission;
    const potentialSavings = totalCommission * 0.3; // If 30% of orders moved to direct

    insights.push({
      type: 'info',
      text: `If you move 30% of orders to direct ordering, you could save kr ${potentialSavings.toFixed(0)} per month.`
    });

    return insights;
  }
}
```

---

### 7.4 AI Integration Points

**1. Order Routing**
- Intelligent routing: Which platform to promote?
- "Wolt orders have 20% higher AOV → promote Wolt"
- "Foodora orders have 2x return rate → focus on Foodora"

**2. Demand Prediction**
- "Wolt orders will spike 30% this Friday → prepare kitchen"
- Platform-specific demand patterns

**3. Dynamic Availability**
- "You're getting overwhelmed → pause Wolt for 30 minutes"
- Auto-management based on kitchen load

---

### 7.5 Critical Risks

**Risk 1: API Rate Limits**
- Wolt/Foodora limit API calls
- Mitigation: Webhook-based (push)

**Risk 2: Contract Terms**
- Platforms may prohibit menu sync tools
- Mitigation: Check ToS, get approval

**Risk 3: Order Acceptance Delays**
- Auto-accept too slow → customer cancels
- Mitigation: < 30 second acceptance target

**Risk 4: Menu Sync Errors**
- Wrong prices pushed to platform
- Mitigation: Validation, manual approval

---

### 7.6 Implementation Timeline

**Week 1-2:**
- [ ] Wolt API integration (orders + menu)
- [ ] Foodora API integration

**Week 3:**
- [ ] Auto-accept logic
- [ ] Order status sync back to platforms

**Week 4:**
- [ ] Commission analytics dashboard
- [ ] Platform comparison reports

---

### 7.7 Success Metrics

**KPIs:**
- All platform orders in one view (100%)
- Order acceptance time (< 30 seconds)
- Commission savings (if customers move to direct)
- Menu sync accuracy (100%)

**Goal:**
- Zero missed orders
- Zero tablet switching
- 30% commission cost reduction (move customers to direct)

---

**(Continuing... 4 more modules + final sections!)** 🚀

**Remaining:**
- Module 8: Accounting Integration
- Module 9: Staff Scheduling  
- Module 10: Inventory Management
- Module 11: Customer Loyalty
- Then: AI Strategy, Risk Assessment, Architecture, Roadmap

**Keep going?** 💪
