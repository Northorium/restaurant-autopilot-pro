# ⚡ Quick Start Guide - Restaurant Autopilot Pro

## 🚀 Start Demo in 30 Seconds

### Windows

```cmd
cd C:\Users\kiman.KIM\clawd\projects\restaurant-autopilot-pro

REM Terminal 1 - Backend
cd backend
node server.js

REM Terminal 2 - Frontend
cd frontend-manual
npx http-server -p 8080 --cors
```

### Mac/Linux

```bash
cd /path/to/restaurant-autopilot-pro

# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
cd frontend-manual
npx http-server -p 8080 --cors
```

**Open:** http://localhost:8080  
**Login:** demo@restaurant.com / demo123

---

## ✅ Verify Everything Works

```bash
# Run test suite
node test-api.js
```

**Expected:** 15/15 tests pass ✅

---

## 📱 What to Demo

### 1. Login (10 seconds)
- Show dark Material Design
- Pre-filled credentials
- Click "Sign In"

### 2. Dashboard (30 seconds)
- **4 key metrics:**
  - 247 total reviews (+5%)
  - 4.6 average rating (+2.2%)
  - 92% response rate (+7.0%)
  - 78% positive sentiment
- **Recent reviews preview**
- **Clean, professional interface**

### 3. Reviews Management (1 minute)
- Click "Reviews" in sidebar
- Show all 10 reviews
- Mix of Google & Meta reviews
- Responded vs Pending status
- Filter buttons (All/Pending/Responded)

### 4. AI Assistant (1 minute)
- Click "AI Assistant" in sidebar
- Select rating (1-5 stars)
- Enter sample review text
- Click "Generate Response"
- Show AI-generated professional response
- Multiple suggestions provided

### 5. Analytics (1 minute)
- Click "Analytics" in sidebar
- **Rating distribution chart:**
  - 5 stars: 182 (73.7%)
  - 4 stars: 45 (18.2%)
  - etc.
- **Sentiment breakdown:**
  - 78% positive
  - 18% neutral
  - 4% negative
- **Platform performance:**
  - Google: 198 reviews
  - Meta: 49 reviews

### 6. Business Profile (30 seconds)
- Click "Business" in sidebar
- Restaurant information
- Opening hours
- Platform connection status (both connected ✅)

**Total demo time: ~4-5 minutes**

---

## 🎯 Key Selling Points

1. **Professional Design** - Dark Material Design 3, looks expensive
2. **Real Functionality** - All features work, not just mockups
3. **Data-Driven** - Real analytics, metrics, trends
4. **AI-Powered** - Automated response generation
5. **Multi-Platform** - Google + Meta integration ready
6. **Production-Ready** - Secure, scalable, deployable

---

## 🐛 Troubleshooting

### Port 3001 already in use
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <pid> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

### Frontend won't load
- Make sure backend is running first
- Check http://localhost:3001/health
- Clear browser cache (Ctrl+Shift+R)

### Login doesn't work
- Verify credentials: demo@restaurant.com / demo123
- Check browser console (F12) for errors
- Restart backend if needed

---

## 📊 Demo Data

**Restaurant:** Bella Napoli Ristorante  
**Location:** Oslo, Norway  
**Type:** Italian Restaurant  
**Rating:** 4.6 ⭐ (247 reviews)

**10 Sample Reviews:**
- 6× Five-star ⭐⭐⭐⭐⭐
- 3× Four-star ⭐⭐⭐⭐
- 1× Three-star ⭐⭐⭐
- Mix of Google & Meta (Facebook/Instagram)
- 5 with responses, 5 pending

---

## 🚂 Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

**Set environment variables in Railway dashboard:**
- `NODE_ENV=production`
- `JWT_SECRET=your-secret-key`
- `FRONTEND_URL=https://your-frontend.vercel.app`

**Deploy frontend to Vercel (free):**
1. Push `frontend-manual/` to GitHub
2. Connect to Vercel
3. Deploy
4. Done!

---

## 📞 Support

**Documentation:**
- README.md - Full documentation
- DEMO.md - Demo walkthrough
- DEPLOYMENT.md - Deployment options
- FINAL-PACKAGE.md - Complete package overview

**Testing:**
- test-api.js - API test suite
- DEMO-TESTING.md - Test results

**Questions?**
- Check README.md first
- All endpoints documented
- Test examples included

---

## ⚡ Speed Run (For Experienced Developers)

```bash
# 1. Clone/Navigate
cd restaurant-autopilot-pro

# 2. Start backend
cd backend && npm install && node server.js &

# 3. Start frontend
cd ../frontend-manual && npx http-server -p 8080 &

# 4. Open browser
open http://localhost:8080

# 5. Login: demo@restaurant.com / demo123

# Done! 🎉
```

---

**Ready to impress! 🚀**
